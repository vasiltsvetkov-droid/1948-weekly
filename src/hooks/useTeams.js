import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    supabase
      .from('teams')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (!error) setTeams(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { fetch() }, [])

  return { teams, loading, refetch: fetch }
}
