interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

function SkeletonBase({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-border/60 rounded ${className}`}
      style={style}
    />
  )
}

export function Skeleton({ className = '', variant = 'text', width, height, lines = 1 }: SkeletonProps) {
  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'circular') {
    const size = width || height || 40
    return (
      <SkeletonBase
        className={`rounded-full ${className}`}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
      />
    )
  }

  if (variant === 'rectangular') {
    return (
      <SkeletonBase
        className={`rounded-lg ${className}`}
        style={{ height: height ? (typeof height === 'number' ? `${height}px` : height) : '120px', ...style }}
      />
    )
  }

  // Text variant
  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            className="h-4 rounded"
            style={{ width: i === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    )
  }

  return (
    <SkeletonBase
      className={`h-4 ${className}`}
      style={style}
    />
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface rounded-xl border border-border p-4 ${className}`}>
      <Skeleton variant="rectangular" height={160} className="mb-4" />
      <Skeleton width="60%" className="mb-2" />
      <Skeleton width="40%" className="mb-4" />
      <div className="flex gap-2">
        <Skeleton width={60} className="h-6 rounded-full" />
        <Skeleton width={80} className="h-6 rounded-full" />
      </div>
    </div>
  )
}
