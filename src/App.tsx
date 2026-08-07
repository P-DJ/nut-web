import { useState } from 'react'
import './App.css'
import { Hero } from './components/Hero'
import { IconPlus, IconRotate } from './components/Icons'
import { MediaViewer } from './components/MediaViewer'
import { MomentCard } from './components/MomentCard'
import { UploadSheet } from './components/UploadSheet'
import { useMoments } from './hooks/useMoments'
import type { Moment } from './types'

function App() {
  const { moments, progress, addMoment, restoreDemo, clearProgress } = useMoments()
  const [viewer, setViewer] = useState<Moment | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div className="app">
      <Hero />

      <main className="feed">
        <div className="feed-head">
          <div>
            <p className="feed-label">生活点滴</p>
            <h2>最近的坚果</h2>
          </div>
          <button
            type="button"
            className="ghost-btn"
            onClick={restoreDemo}
            title="恢复 Demo 数据"
          >
            <IconRotate size={16} />
            Demo
          </button>
        </div>

        <div className="timeline">
          {moments.map((moment, index) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              index={index}
              onOpen={setViewer}
            />
          ))}
        </div>
      </main>

      <button
        className="fab animate-fab-in"
        type="button"
        aria-label="上传记录"
        onClick={() => {
          clearProgress()
          setUploadOpen(true)
        }}
      >
        <IconPlus size={26} />
      </button>

      <UploadSheet
        open={uploadOpen}
        progress={progress}
        onClose={() => setUploadOpen(false)}
        onSubmit={addMoment}
      />

      <MediaViewer moment={viewer} onClose={() => setViewer(null)} />
    </div>
  )
}

export default App
