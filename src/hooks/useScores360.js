import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { compute360 } from '../lib/barin360/compute360'
import { adaptGPSAggregate } from '../lib/barin360/adapters/gpsAdapter'
import { adaptWellnessEntry } from '../lib/barin360/adapters/wellnessAdapter'
import { adaptMultipleTests } from '../lib/barin360/adapters/practitionerAdapter'

/**
 * Fetch all data sources for a player and compute 360 scores.
 *
 * @param {string} playerId
 * @param {string} weekStartDate - ISO date for GPS context
 * @returns {{ result, loading, error, recompute }}
 */
export function useScores360(playerId, weekStartDate) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const recompute = async () => {
    if (!playerId) return
    setLoading(true)
    setError(null)

    try {
      // 1. Fetch GPS aggregate for this week
      const { data: gpsAgg } = await supabase
        .from('weekly_aggregates')
        .select('*')
        .eq('player_id', playerId)
        .eq('week_start_date', weekStartDate)
        .single()

      // 2. Fetch latest wellness entries (last 7 days)
      const weekEnd = new Date(weekStartDate)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const { data: wellnessRows } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('player_id', playerId)
        .gte('entry_date', weekStartDate)
        .lte('entry_date', weekEnd.toISOString().slice(0, 10))
        .order('entry_date', { ascending: false })
        .limit(7)

      // 3. Fetch practitioner tests (last 14 days)
      const twoWeeksAgo = new Date(weekStartDate)
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7)
      const { data: practTests } = await supabase
        .from('practitioner_tests')
        .select('*')
        .eq('player_id', playerId)
        .gte('test_date', twoWeeksAgo.toISOString().slice(0, 10))
        .lte('test_date', weekEnd.toISOString().slice(0, 10))
        .order('test_date', { ascending: false })

      // 4. Fetch player baselines
      const { data: baselineRows } = await supabase
        .from('player_baselines')
        .select('*')
        .eq('player_id', playerId)

      // 5. Build universal parameter map from all sources
      const params = {}

      // GPS
      if (gpsAgg) {
        Object.assign(params, adaptGPSAggregate(gpsAgg, weekStartDate))
      }

      // Wellness — use the most recent entry for each param
      if (wellnessRows?.length) {
        const latest = wellnessRows[0] // already sorted desc
        Object.assign(params, adaptWellnessEntry(latest, latest.entry_date))
      }

      // Practitioner tests
      if (practTests?.length) {
        Object.assign(params, adaptMultipleTests(practTests))
      }

      // 6. Build baselines map
      const playerBaselines = {}
      if (baselineRows) {
        for (const row of baselineRows) {
          playerBaselines[row.param_key] = {
            mean_30d: row.mean_30d,
            sd_30d: row.sd_30d,
            sample_count: row.sample_count,
          }
        }
      }

      // 7. Run compute360
      const computeResult = compute360(params, playerBaselines, {}, {
        computeAt: weekEnd,
      })

      setResult(computeResult)

      // 8. Persist baseline updates
      if (computeResult.baselineUpdates) {
        const upserts = Object.entries(computeResult.baselineUpdates).map(([key, bl]) => ({
          player_id: playerId,
          param_key: key,
          mean_30d: bl.mean_30d,
          sd_30d: bl.sd_30d,
          sample_count: bl.sample_count,
          last_updated: new Date().toISOString(),
        }))

        if (upserts.length) {
          await supabase.from('player_baselines').upsert(upserts, {
            onConflict: 'player_id,param_key',
          })
        }
      }

      // 9. Persist index snapshot
      await supabase.from('index_snapshots').upsert({
        player_id: playerId,
        snapshot_date: weekStartDate,
        rtt: computeResult.scores.rtt,
        rs: computeResult.scores.rs,
        ir: computeResult.scores.ir,
        nms: computeResult.scores.nms,
        ms: computeResult.scores.ms,
        confidence_rtt: computeResult.confidence.rtt,
        confidence_rs: computeResult.confidence.rs,
        confidence_ir: computeResult.confidence.ir,
        confidence_nms: computeResult.confidence.nms,
        confidence_ms: computeResult.confidence.ms,
        constructs: computeResult.constructs,
        cross_index_mods: computeResult.crossIndexMods,
        flags: computeResult.flags,
        norm_tier: computeResult.normTier,
        source_summary: computeResult.sourceSummary,
        ir_coverage: computeResult.irCoverage,
        ir_missing_clusters: computeResult.irMissingClusters,
        ir_upper_bound: computeResult.irUpperBound,
        nms_fatigue_suppressed: computeResult.nmsFatigueSuppressed,
      }, { onConflict: 'player_id,snapshot_date' })

      // 10. Update weekly_aggregates with new 360 scores
      if (gpsAgg) {
        await supabase.from('weekly_aggregates').update({
          nms: computeResult.scores.nms,
          ms: computeResult.scores.ms,
          confidence_data: computeResult.confidence,
        }).eq('player_id', playerId).eq('week_start_date', weekStartDate)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { recompute() }, [playerId, weekStartDate])

  return { result, loading, error, recompute }
}

/**
 * Fetch stored index snapshots for a player (history).
 */
export function useIndexHistory(playerId, limit = 30) {
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) return
    supabase
      .from('index_snapshots')
      .select('*')
      .eq('player_id', playerId)
      .order('snapshot_date', { ascending: true })
      .limit(limit)
      .then(({ data }) => {
        setSnapshots(data || [])
        setLoading(false)
      })
  }, [playerId, limit])

  return { snapshots, loading }
}
