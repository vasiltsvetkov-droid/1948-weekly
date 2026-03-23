import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { computeMesocycle } from '../lib/computeMesocycle'

/**
 * Fetch available mesocycle periods for a player.
 * Groups weekly_aggregates into consecutive 4-week blocks.
 */
export function useMesocycles(playerId) {
  const [mesocycles, setMesocycles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) { setLoading(false); return }
    setLoading(true)
    supabase
      .from('weekly_aggregates')
      .select('week_start_date')
      .eq('player_id', playerId)
      .order('week_start_date', { ascending: true })
      .then(({ data }) => {
        const weeks = (data || []).map(d => d.week_start_date)
        // Group into 4-week blocks
        const groups = []
        for (let i = 0; i + 3 < weeks.length; i += 4) {
          groups.push({
            start: weeks[i],
            end: weeks[i + 3],
            weeks: weeks.slice(i, i + 4),
            label: `${weeks[i]} — ${weeks[i + 3]}`,
          })
        }
        setMesocycles(groups.reverse()) // newest first
        setLoading(false)
      })
  }, [playerId])

  return { mesocycles, loading }
}

/**
 * Compute mesocycle data for a specific 4-week period.
 */
export function useMesocycleData(playerId, weekDates, player) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId || !weekDates || weekDates.length < 4) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('weekly_aggregates')
      .select('*')
      .eq('player_id', playerId)
      .in('week_start_date', weekDates)
      .order('week_start_date', { ascending: true })
      .then(({ data: rows }) => {
        if (rows && rows.length >= 2) {
          setData(computeMesocycle(rows, player))
        } else {
          setData(null)
        }
        setLoading(false)
      })
  }, [playerId, weekDates?.join(','), player?.id])

  return { data, loading }
}

/**
 * Fetch squad-level mesocycle data for a specific period.
 */
export function useSquadMesocycle(weekDates, teamId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!weekDates || weekDates.length < 4) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('weekly_aggregates')
      .select('*, players(name, position, team_id, photo_url)')
      .in('week_start_date', weekDates)
      .then(({ data: rows }) => {
        if (!rows) { setData([]); setLoading(false); return }

        // Group by player
        const playerMap = {}
        for (const row of rows) {
          const pid = row.player_id
          if (teamId && row.players?.team_id !== teamId) continue
          if (!playerMap[pid]) playerMap[pid] = { player: row.players, weeks: [] }
          playerMap[pid].weeks.push(row)
        }

        // Compute mesocycle for each player
        const results = Object.entries(playerMap).map(([pid, { player, weeks }]) => {
          weeks.sort((a, b) => a.week_start_date.localeCompare(b.week_start_date))
          const meso = computeMesocycle(weeks, player)
          return { player_id: pid, player, ...meso }
        })

        setData(results)
        setLoading(false)
      })
  }, [weekDates?.join(','), teamId])

  return { data, loading }
}
