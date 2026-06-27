import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCelebrationMessage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true)
      try {
        // Intentar con RPC primero (función SQL)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_random_celebration')

        if (!rpcError && rpcData && rpcData.length > 0) {
          setData(rpcData[0])
          setLoading(false)
          return
        }

        // Fallback: query directa
        const { data: queryData } = await supabase
          .from('celebration_messages')
          .select('message, emoji')
          .eq('active', true)
          .limit(50)

        if (queryData && queryData.length > 0) {
          const random = queryData[Math.floor(Math.random() * queryData.length)]
          setData(random)
        } else {
          setData({ message: '¡Caca registrada con éxito! 🎉', emoji: '💩' })
        }
      } catch {
        setData({ message: '¡Caca registrada con éxito! 🎉', emoji: '💩' })
      } finally {
        setLoading(false)
      }
    }

    fetchMessage()
  }, [])

  return { ...data, loading }
}
