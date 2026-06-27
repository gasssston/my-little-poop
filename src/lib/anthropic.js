const SYSTEM_PROMPT = `Eres un asistente médico especializado en salud digestiva. El usuario te enviará una foto de sus heces. Tu tarea es analizarla de forma objetiva, profesional y útil.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, con esta estructura exacta:

{
  "bristol_type": <número del 1 al 7>,
  "bristol_label": "<nombre del tipo en español>",
  "bristol_description": "<descripción breve del tipo en 1-2 frases>",
  "color_observed": "<color observado en la foto>",
  "health_status": "<uno de: 'óptimo', 'aceptable', 'atención recomendada', 'consulta médica recomendada'>",
  "pathology_risks": [
    "<posible condición o riesgo asociado, o null si no hay>",
    "<otro posible riesgo si existe>"
  ],
  "recommendations": [
    "<recomendación concreta 1>",
    "<recomendación concreta 2>",
    "<recomendación concreta 3>"
  ],
  "positive_aspects": [
    "<aspecto positivo si lo hay, por ejemplo buena hidratación>"
  ],
  "urgency": "<uno de: 'ninguna', 'moderada', 'alta'>",
  "fun_fact": "<dato curioso o motivador relacionado con la salud digestiva, en tono amigable>"
}

Escala de Bristol de referencia:
- Tipo 1: Bolitas duras separadas (estreñimiento severo)
- Tipo 2: Salchicha grumosa (estreñimiento leve)
- Tipo 3: Salchicha con grietas (normal tendencia dura)
- Tipo 4: Salchicha suave y lisa (IDEAL)
- Tipo 5: Trozos blandos con bordes definidos (tendencia blanda)
- Tipo 6: Trozos esponjosos con bordes irregulares (diarrea leve)
- Tipo 7: Líquida sin trozos sólidos (diarrea severa)

Sé empático, no alarmista, y recuerda siempre que el diagnóstico médico lo debe hacer un profesional.
Si la imagen no muestra claramente heces o no puedes analizarla, devuelve: {"error": "No se puede analizar la imagen proporcionada"}`

/**
 * Analiza una imagen de heces usando OpenRouter (con visión)
 * Intenta con el primer modelo y si falla, usa un fallback
 */
const MODELS = [
  'google/gemma-4-31b-it:free',
  // 'google/gemma-4-26b-a4b-it:free',
  // 'nvidia/nemotron-nano-12b-v2-vl:free',
]

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export async function analyzePoopImage(base64Image, mimeType) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('Falta VITE_OPENROUTER_API_KEY en .env.local')
  }

  let lastError = null

  // Dos pasadas: primera sin delay, segunda con 2s entre intentos
  for (let pass = 0; pass < 2; pass++) {
    for (const model of MODELS) {
      try {
        if (pass === 1) await delay(2000)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'My Little Poop',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: SYSTEM_PROMPT },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
              ],
            },
          ],
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        lastError = new Error(errorData.error?.message || `Error de la API: ${response.status}`)
        // Si es rate limit, probar el siguiente modelo
        if (response.status === 429) continue
        throw lastError
      }

      const data = await response.json()
      const text = data.choices[0].message.content

      try {
        return JSON.parse(text)
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
        throw new Error('No se pudo parsear la respuesta de la IA')
      }
    } catch (err) {
      lastError = err
      if (err.message?.includes('rate') || err.message?.includes('429')) continue
      throw err
    }
    }
  }

  throw lastError || new Error('Todos los modelos están temporalmente no disponibles. Inténtalo de nuevo en unos segundos.')
}

/**
 * Mapea el tipo Bristol al tipo de heces del selector del formulario
 */
export function bristolToFormType(bristolType) {
  const map = {
    1: 'Muy dura / Pellets',
    2: 'Firme y dura',
    3: 'Firme y suave',
    4: 'Firme y suave',
    5: 'Blanda normal',
    6: 'Muy blanda',
    7: 'Líquida / Diarrea',
  }
  return map[bristolType] || ''
}

/**
 * Devuelve el color de estado de salud para la UI
 */
export function getHealthStatusColor(status) {
  const map = {
    'óptimo': { bg: 'bg-success/10', text: 'text-success', emoji: '✅' },
    'aceptable': { bg: 'bg-accent-hover/10', text: 'text-accent-hover', emoji: '👍' },
    'atención recomendada': { bg: 'bg-[#E87832]/10', text: 'text-[#E87832]', emoji: '⚠️' },
    'consulta médica recomendada': { bg: 'bg-error/10', text: 'text-error', emoji: '🩺' },
  }
  return map[status] || map['aceptable']
}
