import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableReady, setTableReady] = useState(true)

  const fetch = () => {
    setLoading(true)
    supabase
      .from('teams')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error && (error.code === '42P01' || error.message?.includes('relation') || error.code === 'PGRST204' || String(error.code) === '404')) {
          setTableReady(false)
          setTeams([])
        } else if (!error) {
          setTableReady(true)
          setTeams(data || [])
        }
        setLoading(false)
      })
  }

  useEffect(() => { fetch() }, [])

  return { teams, loading, refetch: fetch, tableReady }
}
