import { aboutContent } from '../content/about/content'
export function About() {
  return <main className="page-shell about-page"><header className="page-head"><div><p>ABOUT NUT</p><h1>关于坚果</h1></div></header><img className="about-portrait" src={aboutContent.portraitImage} alt="坚果" /><section className="about-intro"><h2>{aboutContent.name} <span>{aboutContent.nickname}</span></h2><p>{aboutContent.intro}</p></section><dl className="profile-grid"><div><dt>品种</dt><dd>{aboutContent.breed}</dd></div><div><dt>生日</dt><dd>{aboutContent.birthday}</dd></div><div><dt>来到家里</dt><dd>{aboutContent.arrivedAt}</dd></div></dl><section className="traits"><p>她喜欢</p><div>{aboutContent.traits.map((trait) => <span key={trait}>{trait}</span>)}</div></section></main>
}
