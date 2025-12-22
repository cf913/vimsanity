export const KeysAllowed = ({
  keys,
  lastKeyPressed,
  children,
}: {
  keys: string[]
  lastKeyPressed: string | null
  children?: React.ReactNode
}) => {
  return (
    <div className="flex gap-4 text-text-muted mt-4 justify-center">
      {keys.map((k) => (
        <kbd
          key={k}
          className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
            lastKeyPressed === k
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
              : ''
          }`}
        >
          {k}
        </kbd>
      ))}
      {children}
    </div>
  )
}
