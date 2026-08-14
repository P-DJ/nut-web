export function LoadingScreen() {
  return (
    <main className="loading-screen" aria-live="polite" aria-label="正在准备坚果的日记本">
      <div className="paw-trail" aria-hidden>
        {[0, 1, 2, 3].map((step) => (
          <span key={step}>
            <svg viewBox="0 0 48 48" focusable="false">
              <g transform="rotate(-32 24 24)">
                <path d="M24 23c-6.7 0-11.8 5.7-11.8 12.1 0 5.2 4.3 8.9 9.5 8.9 2.2 0 3.7-1.1 5.2-2.3 1.5-1.2 3.2-2.5 5.3-2.5 2.3 0 4.4-1.6 4.4-4.6C36.6 28.3 30.7 23 24 23Z" />
                <ellipse cx="12.5" cy="20" rx="4.4" ry="6.4" transform="rotate(-29 12.5 20)" />
                <ellipse cx="21" cy="13" rx="4.6" ry="6.6" transform="rotate(-12 21 13)" />
                <ellipse cx="30.4" cy="13.8" rx="4.6" ry="6.6" transform="rotate(12 30.4 13.8)" />
                <ellipse cx="38" cy="21.1" rx="4.4" ry="6.4" transform="rotate(29 38 21.1)" />
              </g>
            </svg>
          </span>
        ))}
      </div>
      <p>坚果正在整理日记本</p>
    </main>
  )
}
