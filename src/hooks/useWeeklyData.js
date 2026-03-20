import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useWeeklyData(playerId, weekStartDate) {
  const [aggregate, setAggregate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId || !weekStartDate) return
    setLoading(true)
    supabase
      .from('weekly_aggregates')
      .select('*')
      .eq('player_id', playerId)
      .eq('week_start_date', weekStartDate)
      .single()
      .then(({ data, error }) => {
        if (!error) setAggregate(data)
        setLoading(false)
      })
  }, [playerId, weekStartDate])

  return { aggregate, loading }
}

export function useWeeks() {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('weekly_aggregates')
      .select('week_start_date')
      .order('week_start_date', { ascending: false })
      .then(({ data }) => {
        const unique = [...new Set((data || []).map(d => d.week_start_date))]
        setWeeks(unique)
        setLoading(false)
      })
  }, [])

  return { weeks, loading }
}

export function useSquadWeek(weekStartDate, teamId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!weekStartDate) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('weekly_aggregates')
      .select('*, players(name, position, team_id)')
      .eq('week_start_date', weekStartDate)
      .then(({ data: rows, error }) => {
        if (!error) {
          let filtered = rows || []
          if (teamId) {
            filtered = filtered.filter(r => r.players?.team_id === teamId)
          }
          setData(filtered)
        }
        setLoading(false)
      })
  }, [weekStartDate, teamId])

  return { data, loading }
}
