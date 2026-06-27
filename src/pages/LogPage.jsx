import { useState } from 'react'
import LogForm from '../components/log/LogForm'

export default function LogPage() {
  const [key, setKey] = useState(0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary font-[family-name:var(--font-display)]">
          Registrar deposición 💩
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Cuéntanos los detalles de tu visita al trono
        </p>
      </div>
      <LogForm key={key} onSuccess={() => setKey((k) => k + 1)} />
    </div>
  )
}
