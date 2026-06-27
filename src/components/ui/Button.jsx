import { Loader2 } from 'lucide-react'

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-display)]'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] px-6 py-3 text-base shadow-md shadow-accent/20',
    secondary: 'bg-cream-card text-text-primary border border-border hover:bg-border/50 px-4 py-2 text-sm',
    danger: 'bg-error/10 text-error hover:bg-error/20 px-4 py-2 text-sm',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-cream-card px-3 py-2 text-sm',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
