# 坚果健康档案 Java 后端学习手册

这份手册对应当前项目的 Java 服务源码。目标不是背注解，而是理解一次请求如何从浏览器走到 Spring Boot、PostgreSQL/Supabase，再返回 JSON。

后端源码位于新的 worktree：`/Users/peter/Desktop/nut-web-java/backend`。

## 1. 先建立全局地图

```text
浏览器健康档案页面
        |
        | HTTP: GET / POST / DELETE /api/health
        v
Spring Boot（HealthEntryController）
        |
        | JPA Repository
        v
PostgreSQL（Supabase 的 health_entries 表）
        |
        v
JSON 响应回到浏览器
```

以“新增一次洗澡记录”为例：

1. 前端发出 `POST /api/health`，携带 `category`、`date`、`note`。
2. Spring MVC 根据 `@PostMapping` 找到 `HealthEntryController.create`。
3. `@Valid` 校验请求数据，Spring 把 JSON 转换成 `HealthEntryRequest`。
4. Controller 创建 `HealthEntry` 实体，调用 `repository.save`。
5. JPA/Hibernate 把实体翻译成 SQL，插入 Supabase PostgreSQL。
6. Controller 把实体转换成 `HealthEntryResponse`，Spring 自动序列化为 JSON，返回 `201 Created`。

## 2. 先把服务跑起来

### 2.1 前提

- JDK 21：运行 Java 代码。
- Maven：下载依赖、编译、测试、启动。
- Supabase：托管 PostgreSQL 和登录服务。

进入后端目录：

```bash
cd /Users/peter/Desktop/nut-web-java/backend
```

私有配置在 `.env`，不要提交它。启动前让 shell 把其中的变量导出：

```bash
set -a
source .env
set +a
JAVA_HOME=/opt/homebrew/opt/openjdk@21 mvn spring-boot:run
```

四行命令分别表示：

| 命令 | 含义 |
| --- | --- |
| `set -a` | 之后读到的变量自动导出给子进程。 |
| `source .env` | 在当前 shell 读取 `.env` 中的配置。 |
| `set +a` | 关闭自动导出。 |
| `mvn spring-boot:run` | Maven 编译后调用 Spring Boot 启动应用。 |

启动成功后检查：

```bash
curl http://localhost:8080/actuator/health
```

返回 `{"status":"UP"}` 说明 Web 服务、数据库连接和 Actuator 已可用。

### 2.2 启动时发生什么

`mvn spring-boot:run` 的实际过程：

1. Maven 读取 `pom.xml`，确认 Java 版本与依赖。
2. Maven 编译 `src/main/java` 到 `target/classes`。
3. 找到带 `main` 方法的 `NutHealthApiApplication`。
4. `SpringApplication.run` 创建 Spring 应用上下文（Application Context）。
5. Spring Boot 自动配置 Tomcat、JSON、JPA、数据库连接池、Flyway、Spring Security。
6. Flyway 检查数据库版本，首次启动执行 SQL 迁移。
7. Tomcat 监听 `8080` 端口，开始接收 HTTP 请求。

`target/` 只是构建产物，可以删除并重新生成，因此在 `.gitignore` 中。

## 3. Maven 项目描述：pom.xml

文件：`backend/pom.xml`

XML 的第一行声明文档格式；`<project>` 是 Maven 项目的根节点。最重要的字段如下：

| 配置 | 作用 |
| --- | --- |
| `spring-boot-starter-parent` | 继承 Spring Boot 推荐的一组依赖版本和 Maven 默认配置。 |
| `groupId: com.nut` | Java/Maven 的组织命名空间，通常对应包名前缀。 |
| `artifactId: nut-health-api` | 产物名称。打包后会出现在 jar 文件名中。 |
| `version: 0.1.0-SNAPSHOT` | `SNAPSHOT` 表示仍处于开发阶段。 |
| `java.version: 21` | 编译目标为 Java 21。 |

### 3.1 每个依赖在做什么

| 依赖 | 项目中的用途 |
| --- | --- |
| `spring-boot-starter-web` | 内嵌 Tomcat、Spring MVC、JSON 序列化，提供 REST API。 |
| `spring-boot-starter-validation` | 支持 `@NotNull`、`@Size` 等输入校验。 |
| `spring-boot-starter-data-jpa` | JPA/Hibernate 与 `JpaRepository`，负责对象和 SQL 的映射。 |
| `spring-boot-starter-security` | 安全过滤器链与授权规则。 |
| `spring-boot-starter-oauth2-resource-server` | 校验 Supabase 发出的 JWT。 |
| `spring-boot-starter-actuator` | 提供 `/actuator/health` 运维检查。 |
| `postgresql` | PostgreSQL JDBC 驱动，让 Java 能连上 Supabase 数据库。`runtime` 表示只在运行期需要。 |
| `flyway-core` / `flyway-database-postgresql` | 管理数据库建表和后续演进。 |
| `spring-boot-starter-test` | 测试工具集合，只在测试期加载。 |

最后的 `spring-boot-maven-plugin` 让 Maven 知道如何执行 `spring-boot:run`、如何构建可运行 jar。

## 4. 配置：application.yml 与 .env

文件：`backend/src/main/resources/application.yml`

YAML 用缩进表达层级。`${NAME:default}` 的意思是：优先读取环境变量 `NAME`，不存在时用 `default`。

```yaml
spring:
  datasource:
    url: ${SUPABASE_DB_URL}
    username: ${SUPABASE_DB_USER:postgres}
    password: ${SUPABASE_DB_PASSWORD}
```

- `spring.datasource` 是 Spring Boot 识别的标准数据库配置前缀。
- `url` 是 JDBC 地址，例如 `jdbc:postgresql://...`。
- `username` 默认值为 `postgres`。
- 密码只来自私有 `.env`，绝不写入 Git。

```yaml
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
```

- `open-in-view: false`：请求结束时就关闭 JPA 会话，避免无意的数据库查询和连接长期占用。
- `ddl-auto: validate`：只验证 Java 实体和数据库表是否匹配，不擅自建表或改表。真正的表结构只交给 Flyway。

```yaml
  flyway:
    enabled: true
```

启动时启用 Flyway。它会记录已执行迁移，避免重复执行。

```yaml
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${SUPABASE_ISSUER_URI}
```

鉴权开启时，Spring 根据 issuer 找到 Supabase 的公开签名密钥，以验证浏览器传来的 JWT 是否真实有效。

```yaml
server:
  port: ${PORT:8080}
```

默认监听 `8080`。生产平台常用 `PORT` 注入实际端口。

```yaml
app:
  cors:
    allowed-origin: ${FRONTEND_ORIGIN:http://localhost:5173}
```

`app.*` 是本项目自定义配置：

- `allowed-origin`：允许哪个浏览器站点调用 API。当前前端是 `http://localhost:5173`，所以本地 `.env` 也应设置为这个地址。

除公开的 `GET /api/timeline` 外，所有 API 都必须携带 Supabase JWT；没有可关闭鉴权的运行模式。

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
```

只向 HTTP 暴露 health 端点，避免把不必要的内部信息公开。

## 5. 数据库迁移：V1__create_health_entries.sql

文件：`backend/src/main/resources/db/migration/V1__create_health_entries.sql`

Flyway 文件名格式为 `V版本号__说明.sql`。首次连接到空数据库时，Flyway 执行：

```sql
create table health_entries (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null,
    category varchar(16) not null check (category in ('BATH', 'DEWORM', 'CYCLE')),
    date date not null,
    note varchar(1000),
    created_at timestamptz not null default now()
);
```

逐列解释：

| 列 | 含义 |
| --- | --- |
| `id` | 记录的唯一 ID。`uuid` 避免暴露连续数字；数据库默认生成。 |
| `owner_id` | 记录属于哪个用户。公开模式下全部使用固定 UUID。 |
| `category` | 三种护理类型，`check` 防止写入未定义值。 |
| `date` | 事件发生的日期，不含具体时刻。 |
| `note` | 可选备注，最多 1000 字符。 |
| `created_at` | 数据写入数据库的时间，带时区。 |

```sql
create index health_entries_owner_date_idx on health_entries (owner_id, date desc, created_at desc);
```

这是索引，不是第二张表。它让“查某个用户的最新记录”更快，顺序也与接口返回顺序相匹配。

后续改表时不要修改 `V1`，而是新建如 `V2__add_xxx.sql`。因为线上数据库已经记录了 V1 已执行。

## 6. 程序入口：NutHealthApiApplication.java

文件：`backend/src/main/java/com/nut/health/NutHealthApiApplication.java`

```java
package com.nut.health;
```

声明包名。Java 目录通常与包名一致，Spring Boot 默认扫描当前包及其子包，所以 Controller、Repository、Config 都放在 `com.nut.health` 下。

```java
@SpringBootApplication
```

这一个注解组合了三个常用能力：

- `@Configuration`：这个类可以定义 Spring Bean。
- `@EnableAutoConfiguration`：按依赖和配置自动创建 Tomcat、DataSource、JPA 等 Bean。
- `@ComponentScan`：扫描本包下标有 `@RestController`、`@Configuration` 等的类。

```java
public static void main(String[] args) {
    SpringApplication.run(NutHealthApiApplication.class, args);
}
```

这是 Java 程序入口。`run` 启动 Spring 容器、读取配置、创建 Bean、启动内嵌服务器，并保持进程运行。

## 7. 数据模型：HealthCategory 与 HealthEntry

### 7.1 HealthCategory.java

```java
public enum HealthCategory {
    BATH,
    DEWORM,
    CYCLE
}
```

`enum` 是固定候选值。它比 `String` 更安全：Java 在编译期就能避免拼错分类。HTTP JSON 中必须传 `"BATH"`、`"DEWORM"` 或 `"CYCLE"`。

### 7.2 HealthEntry.java

`HealthEntry` 是 JPA Entity，即一条 Java 对象对应数据库 `health_entries` 表的一行。

```java
@Entity
@Table(name = "health_entries")
public class HealthEntry {
```

- `@Entity`：交给 JPA/Hibernate 管理。
- `@Table`：明确对应的表名；不写时框架会按命名策略推断。

字段对应关系：

| Java 字段及注解 | 数据库含义 |
| --- | --- |
| `@Id @GeneratedValue(strategy = GenerationType.UUID) UUID id` | 主键，保存时生成 UUID。 |
| `@Column(name = "owner_id", nullable = false) UUID ownerId` | 映射到 `owner_id`，不能为空。 |
| `@Enumerated(EnumType.STRING)` | 把枚举存成 `BATH` 等文本，不存枚举序号。 |
| `@Column(nullable = false, length = 16)` | 分类列的非空和长度约束。 |
| `LocalDate date` | 映射 PostgreSQL `date`。 |
| `@Column(length = 1000) String note` | 对应可选备注。 |
| `Instant createdAt` | 对应带时区的创建时间。 |

```java
@PrePersist
void onCreate() { createdAt = Instant.now(); }
```

`@PrePersist` 表示第一次插入数据库前执行这个方法。即使数据库也有 `default now()`，Java 对象在 `save` 返回前就已经有创建时间，响应可以直接返回它。

其余 `getXxx` / `setXxx` 是普通 Java getter/setter。JPA 需要它们或字段访问策略来读取和写入对象状态；Controller 创建实体时也用 setter 填值。

## 8. 请求与响应对象：不要直接暴露 Entity

### 8.1 HealthEntryRequest.java

```java
public record HealthEntryRequest(
        @NotNull HealthCategory category,
        @NotNull LocalDate date,
        @Size(max = 1000) String note
) {}
```

`record` 是 Java 的轻量不可变数据载体。编译器会生成构造函数、`category()` / `date()` / `note()` 访问方法、`equals` 等。

- `@NotNull`：缺少分类或日期，框架返回 400。
- `@Size(max = 1000)`：备注太长，框架返回 400。
- `@Valid` 只有写在 Controller 参数上才会触发这些校验。

请求 JSON 示例：

```json
{
  "category": "BATH",
  "date": "2026-08-12",
  "note": "使用燕麦舒缓洗护"
}
```

### 8.2 HealthEntryResponse.java

```java
public record HealthEntryResponse(UUID id, HealthCategory category, LocalDate date, String note, Instant createdAt) {
    static HealthEntryResponse from(HealthEntry entry) {
        return new HealthEntryResponse(entry.getId(), entry.getCategory(), entry.getDate(), entry.getNote(), entry.getCreatedAt());
    }
}
```

它明确规定 API 能返回哪些字段。`ownerId` 故意不在响应里，避免向浏览器暴露内部用户 ID。`from` 是一个转换工厂方法：把数据库实体映射为 API 响应。

## 9. Repository：不用手写常规 SQL

文件：`HealthEntryRepository.java`

```java
public interface HealthEntryRepository extends JpaRepository<HealthEntry, UUID> {
```

这是接口而不是类。Spring Data JPA 会在启动时自动生成实现：

- `HealthEntry` 是操作的实体类型。
- `UUID` 是该实体主键类型。
- 因此自动得到 `save`、`findById`、`delete`、`findAll` 等基本方法。

```java
List<HealthEntry> findAllByOwnerIdOrderByDateDescCreatedAtDesc(UUID ownerId);
```

Spring 从方法名派生查询，大致等于：

```sql
select * from health_entries
where owner_id = ?
order by date desc, created_at desc;
```

第二个方法增加 `AndCategory`，再加一个分类条件。适合当前两个简单查询；查询变复杂时可改用 `@Query` 或 QueryDSL。

## 10. Controller：HTTP 路由与业务流程

文件：`HealthEntryController.java`

```java
@RestController
@RequestMapping("/api/health")
```

- `@RestController`：方法返回值不再是页面名称，而是自动转换为 JSON。
- 类级别的 `@RequestMapping` 给本类每个接口统一加前缀。

构造函数参数由 Spring 注入：

```java
HealthEntryRepository repository
```

- `repository` 是 Spring 自动创建的 Repository Bean。
- `@Value` 从 `application.yml` 解析配置。
- 构造函数注入让依赖成为 `final`，对象创建后不再变化。

### 10.1 查询：GET /api/health

```java
@GetMapping
public List<HealthEntryResponse> list(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(required = false) HealthCategory category
)
```

- `@GetMapping` 对应 GET 请求。
- `@AuthenticationPrincipal` 从已验证的登录身份中取出 JWT；公开模式下是 `null`。
- `@RequestParam(required = false)` 读取可选参数，例如 `?category=BATH`。

后面的三元表达式根据是否筛选分类选择 Repository 方法。`entries.stream().map(...).toList()` 是 Java Stream：逐条转换 Entity 为 Response，最后组成列表。

### 10.2 新增：POST /api/health

```java
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public HealthEntryResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody HealthEntryRequest request)
```

- `@RequestBody`：把 JSON 解析为 `HealthEntryRequest`。
- `@Valid`：执行 Request record 上的校验。
- `@ResponseStatus(CREATED)`：成功时返回 HTTP 201，不是默认 200。

方法内的四个 setter 构建 Entity；`repository.save(entry)` 插入数据库；再通过 `HealthEntryResponse.from` 返回安全的 JSON。

### 10.3 删除：DELETE /api/health/{id}

```java
@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
```

`{id}` 是路径变量。`@PathVariable UUID id` 把字符串 UUID 解析为 Java UUID；格式错误会自动返回 400。

查询后这段尤其重要：

```java
.filter(item -> item.getOwnerId().equals(ownerId(jwt)))
.orElseThrow(() -> new HealthEntryNotFoundException(id));
```

即使猜到别人的记录 ID，也只能删掉自己的记录；查不到或不属于自己统一返回 404，避免泄露记录是否存在。

`repository.delete(entry)` 执行删除；`204 No Content` 表示成功但响应体为空。

### 10.4 ownerId 方法与登录身份

```java
private UUID ownerId(Jwt jwt) {
    if (jwt == null) throw new IllegalStateException("未获取到登录身份。");
    return UUID.fromString(jwt.getSubject());
}
```

JWT 的 `sub` 是 Supabase 用户 UUID。缺少 JWT 时由 Security Filter 提前返回 `401`；这里保留防御性检查，避免控制器被绕过时继续访问数据库。

## 11. SecurityConfig：请求到 Controller 前先经过它

文件：`SecurityConfig.java`

`@Configuration` 表示这是 Spring 配置类；`@Bean` 表示方法返回对象要交给 Spring 管理。

```java
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception
```

Spring Security 的所有 HTTP 请求都先经过这条过滤链。`HttpSecurity` 是规则构造器。

```java
http.csrf(csrf -> csrf.disable())
    .cors(cors -> cors.configurationSource(corsConfigurationSource()));
```

- CSRF 主要保护基于浏览器 Cookie 的传统会话。该 API 使用 Bearer Token 或公开模式，没有 Cookie Session，因此关闭 CSRF。
- CORS 解决“前端 `5174` 调用后端 `8080` 是跨域”的浏览器限制。

鉴权开启时：

```java
http.authorizeHttpRequests(auth -> auth
        .requestMatchers("/actuator/health").permitAll()
        .anyRequest().authenticated())
    .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> {}));
```

- health 检查无需登录，便于部署平台探测服务。
- 其他请求必须认证。
- `oauth2ResourceServer().jwt()` 启用 Bearer JWT 验证，issuer 地址来自 YAML。

公开模式时：

```java
http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
```

所有 HTTP 请求放行。注意：这也是它不能在公网长期使用的根本原因。

### 11.1 CORS 配置

```java
configuration.setAllowedOrigins(List.of(allowedOrigin));
configuration.setAllowedMethods(List.of("GET", "POST", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
```

- `allowedOrigin` 必须是准确来源，例如 `http://localhost:5174`，不能带路径。
- `OPTIONS` 是浏览器发出的预检请求。
- `Authorization` 是恢复 Supabase 鉴权后浏览器发送 JWT 的请求头。
- 不要使用 `*` 加凭据；生产环境应列出你的真实前端域名。

## 12. 错误处理

`HealthEntryNotFoundException` 是一个自定义运行时异常，只装载错误信息。

`ApiExceptionHandler` 上的 `@RestControllerAdvice` 表示全局捕获 Controller 的异常。

```java
@ExceptionHandler(HealthEntryNotFoundException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
ErrorResponse handleNotFound(HealthEntryNotFoundException exception) {
    return new ErrorResponse(exception.getMessage());
}
```

删除不存在的记录时，客户端得到：

```json
{ "message": "Health entry not found: <id>" }
```

和 HTTP `404`。`ErrorResponse` 也是一个 record，限制错误 JSON 只返回 `message`。

## 13. 常用接口实验

服务启动、公开模式下可直接执行；鉴权模式下需附带 `Authorization: Bearer <token>`。

```bash
# 查询全部记录
curl http://localhost:8080/api/health

# 只查询洗澡记录
curl 'http://localhost:8080/api/health?category=BATH'

# 新增记录
curl --request POST http://localhost:8080/api/health \
  --header 'Content-Type: application/json' \
  --data '{"category":"BATH","date":"2026-08-12","note":"洗澡并修剪指甲"}'

# 删除记录（替换真实 UUID）
curl --request DELETE http://localhost:8080/api/health/<id>
```

尝试把 `category` 改为 `OTHER`，或把 `date` 移除，观察 Spring Validation 返回的 400；这是理解请求校验最直接的练习。

## 14. 推荐阅读顺序与练习

### 第一轮：建立感觉

1. 启动服务，看日志中 Tomcat、Hikari、Flyway、Hibernate 的出现顺序。
2. 打开 `NutHealthApiApplication`，理解 `main` 与 `@SpringBootApplication`。
3. 用上面的 curl 调用三个 API。
4. 到 Supabase Table Editor 看 `health_entries` 中的记录。

### 第二轮：沿一条请求读代码

1. 从 `HealthEntryController.create` 开始。
2. 进入 `HealthEntryRequest` 看 JSON 和校验如何对应。
3. 进入 `HealthEntry` 看 Java 字段和数据库列如何对应。
4. 进入 `HealthEntryRepository` 理解 `save`。
5. 回到 `HealthEntryResponse`，理解为什么不直接返回 Entity。

### 第三轮：理解框架能力

1. 在 `HealthEntryRequest.note` 上把 `max` 临时改小，发送过长备注，观察结果。
2. 新建 `V2__add_source.sql`，给表加一个 `source` 列，再在 Entity/Request/Response 中完成映射。
3. 不带 JWT 请求健康档案写接口，观察返回 `401`。
4. 用 Supabase 登录得到 JWT，再观察 Controller 的 `jwt.getSubject()`。

## 15. 后续可改进点

当前项目刻意保持小而直观。更接近生产时，下一步通常是：

- 添加 Controller + Repository 的自动化测试。
- 使用 `@ConfigurationProperties` 替代多处 `@Value`，集中管理 `app.auth` 配置。
- 为删除操作增加确认与审计日志。
- 给 API 加分页，避免记录很多时一次性返回全部。
- 把公开模式限制在 `local` profile，避免部署时误开启。
- 统一 API 错误响应，处理校验错误、数据库错误与未知异常。

学习中最重要的边界是：Spring Boot 负责组合组件和 HTTP 生命周期；JPA 负责对象与关系数据库映射；Flyway 负责数据库历史；Supabase 在这里提供 PostgreSQL 与身份提供方。它们各自职责明确，组合后才成为当前服务。
