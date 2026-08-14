create table timeline_entries (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null,
    type varchar(16) not null check (type in ('photo', 'video', 'text')),
    title varchar(160) not null,
    body varchar(5000),
    media_path varchar(500),
    date date not null,
    time varchar(5),
    tags text[] not null default '{}',
    created_at timestamptz not null default now()
);
create index timeline_entries_date_idx on timeline_entries (date desc, created_at desc);
