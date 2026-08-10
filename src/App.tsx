import { useState } from 'react'
import './App.css'
import { About } from './components/About'
import { BottomNav } from './components/BottomNav'
import { Health } from './components/Health'
import { Hero } from './components/Hero'
import { MediaViewer } from './components/MediaViewer'
import { Timeline } from './components/Timeline'
import { timelineContent } from './content/timeline/content'
import type { Moment, PageId } from './types'

function App() {
  const [page, setPage] = useState<PageId>('home')
  const [viewer, setViewer] = useState<Moment | null>(null)
  const [timelineYear, setTimelineYear] = useState(() =>
    [...new Set(timelineContent.map((moment) => moment.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a))[0] ?? '',
  )
  const [timelineMonth, setTimelineMonth] = useState('全年')
  const [timelineQuery, setTimelineQuery] = useState('')

  return (
    <div className={`app page-${page}`}>
      {page === 'home' ? <Hero /> : null}
      {page === 'timeline' ? <Timeline moments={timelineContent} year={timelineYear} month={timelineMonth} query={timelineQuery} onYearChange={setTimelineYear} onMonthChange={setTimelineMonth} onQueryChange={setTimelineQuery} onOpen={setViewer} /> : null}
      {page === 'health' ? <Health /> : null}
      {page === 'about' ? <About /> : null}

      <BottomNav active={page} onChange={setPage} />
      <MediaViewer moment={viewer} onClose={() => setViewer(null)} />
    </div>
  )
}

export default App
