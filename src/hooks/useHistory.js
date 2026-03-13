import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useHistory(playerId, weeks = 12) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) return
    setLoading(true)
    supabase
      .from('weekly_aggregates')
      .select('*')
      .eq('player_id', playerId)
      .order('week_start_date', { ascending: false })
      .limit(weeks)
      .then(({ data, error }) => {
        if (!error) setHistory((data || []).reverse())
        setLoading(false)
      })
  }, [playerId, weeks])

  return { history, loading }
}

export function usePersonalMaxSpeed(playerId) {
  const [maxSpeed, setMaxSpeed] = useState(null)

  useEffect(() => {
    if (!playerId) return
    supabase
      .from('weekly_aggregates')
      .select('top_speed')
      .eq('player_id', playerId)
      .order('top_speed', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setMaxSpeed(data[0].top_speed)
      })
  }, [playerId])

  return maxSpeed
}
