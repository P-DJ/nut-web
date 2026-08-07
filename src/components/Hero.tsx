export function Hero() {
  return (
    <header className="hero">
      <div className="hero-glow" aria-hidden />
      <div className="hero-grain" aria-hidden />

      <div className="hero-inner animate-rise">
        <p className="hero-kicker animate-fade" style={{ animationDelay: '0.25s' }}>
          Black Shiba · 2 yrs
        </p>

        <h1 className="hero-brand">坚果</h1>

        <p className="hero-lead animate-rise" style={{ animationDelay: '0.35s' }}>
          一只黑色母柴犬的成长与生活点滴
        </p>
      </div>

      <div className="hero-scroll animate-fade" style={{ animationDelay: '0.9s' }}>
        <span>下滑看看她</span>
        <span className="hero-scroll-line" aria-hidden />
      </div>
    </header>
  )
}
