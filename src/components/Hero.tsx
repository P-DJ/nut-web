import { homeContent } from '../content/home/content'

export function Hero() {
  return (
    <main className="hero">
      <img className="hero-image" src={homeContent.heroImage} alt={homeContent.heroAlt} />
      <div className="hero-shade" aria-hidden />
      <div className="hero-copy">
        <p>{homeContent.eyebrow}</p>
        <h1>{homeContent.title}</h1>
        <span>{homeContent.subtitle}</span>
        <div className="hero-meta" aria-label="成长档案说明">
          <span>成长档案</span><span>记录每一个值得记住的时刻</span>
        </div>
      </div>
    </main>
  )
}
