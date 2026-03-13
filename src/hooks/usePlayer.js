import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function usePlayer(playerId) {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) return
    setLoading(true)
    supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single()
      .then(({ data, error }) => {
        if (!error) setPlayer(data)
        setLoading(false)
      })
  }, [playerId])

  return { player, loading }
}

export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    supabase
      .from('players')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (!error) setPlayers(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { fetch() }, [])

  return { players, loading, refetch: fetch }
}
