interface LoadingErrorProps {
  loading?: boolean
  error?: string | null
}

export function LoadingError({ loading, error }: LoadingErrorProps) {
  if (!loading && !error) return null

  return (
    <div className="status-stack" role="status" aria-live="polite">
      {loading && <p className="status-badge status-badge--loading">Loading...</p>}
      {error && <p className="status-badge status-badge--error">{error}</p>}
    </div>
  )
}

