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
        if (error) {
          console.warn('useTeams fetch error:', error.code, error.message)
          setTableReady(false)
          setTeams([])
        } else {
          setTableReady(true)
          setTeams(data || [])
        }
        setLoading(false)
      })
  }

  useEffect(() => { fetch() }, [])

  return { teams, loading, refetch: fetch, tableReady }
}
