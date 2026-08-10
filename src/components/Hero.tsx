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
      </div>
    </main>
  )
}
