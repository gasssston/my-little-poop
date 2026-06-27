import { useState } from 'react'
import { PenLine } from 'lucide-react'
import LogForm from '../components/log/LogForm'

export default function LogPage() {
  const [key, setKey] = useState(0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-2">
          <PenLine className="w-6 h-6 text-accent" /> Registrar deposición
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Cuéntanos los detalles de tu visita al trono
        </p>
      </div>
      <LogForm key={key} onSuccess={() => setKey((k) => k + 1)} />
    </div>
  )
}
