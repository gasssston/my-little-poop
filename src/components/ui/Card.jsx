export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-cream-card rounded-2xl border border-border/50 p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
