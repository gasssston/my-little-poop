import { getHealthStatusColor } from '../../lib/anthropic'
import Card from '../ui/Card'
import { useLanguage } from '../../hooks/useLanguage'

export default function AnalysisResult({ result }) {
  const statusStyle = getHealthStatusColor(result.health_status)
  const { t } = useLanguage()

  return (
    <div className="space-y-3">
      {/* Card principal — Tipo Bristol */}
      <Card className="border-accent/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              🔬 {t('analysis.title')}
            </h3>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-accent font-[family-name:var(--font-display)]">
                {t('analysis.type')} {result.bristol_type}
              </span>
              {result.bristol_type === 4 && <span className="ml-2">⭐</span>}
            </div>
            <p className="text-sm font-semibold text-text-primary mt-1">
              {result.bristol_label}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {result.bristol_description}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.emoji} {result.health_status}
          </div>
        </div>
        {result.color_observed && (
          <p className="text-xs text-text-secondary mt-2">
            {t('analysis.colorObserved')}: <span className="font-medium">{result.color_observed}</span>
          </p>
        )}
      </Card>

      {/* Card recomendaciones y riesgos */}
      <Card>
        <div className="space-y-3">
          {result.recommendations?.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">💡 {t('analysis.recommendations')}</h4>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.positive_aspects?.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-success mb-1">✅ {t('analysis.positiveAspects')}</h4>
              <ul className="space-y-1">
                {result.positive_aspects.map((aspect, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-success mt-0.5">•</span>
                    {aspect}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.pathology_risks?.filter(Boolean).length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">⚠️ {t('analysis.pathologyRisks')}</h4>
              <ul className="space-y-1">
                {result.pathology_risks.filter(Boolean).map((risk, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-[#E87832] mt-0.5">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Urgencia alta */}
      {result.urgency === 'alta' && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-3">
          <p className="text-xs text-error font-semibold">
            🩺 {t('analysis.urgencyWarning')}
          </p>
        </div>
      )}

      {/* Card fun fact */}
      {result.fun_fact && (
        <Card className="bg-accent/5 border-accent/20">
          <h4 className="text-sm font-bold text-accent mb-1">🎉 {t('analysis.funFact')}</h4>
          <p className="text-xs text-text-secondary italic">"{result.fun_fact}"</p>
        </Card>
      )}
    </div>
  )
}
