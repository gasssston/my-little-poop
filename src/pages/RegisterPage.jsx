import RegisterForm from '../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl block mb-3">💩</span>
          <h1 className="text-3xl font-extrabold text-text-primary font-[family-name:var(--font-display)]">
            PoopLog
          </h1>
          <p className="text-text-secondary mt-1">Crea tu cuenta y empieza a registrar 🌈</p>
        </div>
        <div className="bg-cream-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
