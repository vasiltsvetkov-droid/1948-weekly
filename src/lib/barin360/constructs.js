/**
 * Barin Sports 360 — Construct Map (C1-C20)
 *
 * 20 latent constructs grouped into 5 indexes.
 * Each construct defines its parent index, weight in that index,
 * and which parameters feed it (pulled dynamically from parameterRegistry).
 */

/**
 * INDEX_DEFS — The 5 output indexes
 */
export const INDEX_DEFS = {
  RTT: { name: 'Readiness to Train', constructs: ['C1','C2','C3'],               color: '#10b981', higherIsBetter: true },
  RS:  { name: 'Recovery Status',    constructs: ['C4','C5','C6','C7'],           color: '#3b82f6', higherIsBetter: true },
  IR:  { name: 'Injury Risk',        constructs: ['C8','C9','C10','C11','C12'],   color: '#ef4444', higherIsBetter: false, useMax: true },
  NMS: { name: 'Neuromuscular Status', constructs: ['C13','C14','C15','C16'],     color: '#f59e0b', higherIsBetter: true },
  MS:  { name: 'Mental Status',      constructs: ['C17','C18','C19','C20'],       color: '#8b5cf6', higherIsBetter: true },
}

/**
 * CONSTRUCT_DEFS — The 20 latent constructs
 *
 * weight: construct weight within its parent index (must sum to 1.0 per index)
 * For IR, weight is not used (MAX logic), but kept for confidence weighting.
 */
export const CONSTRUCT_DEFS = {
  // ─── RTT Constructs ───
  C1: {
    name: 'Autonomic Readiness',
    index: 'RTT',
    weight: 0.30,
    description: 'Parasympathetic tone and cardiac recovery. HRV, RHR, Recovery Beats.',
  },
  C2: {
    name: 'Neuromuscular Readiness',
    index: 'RTT',
    weight: 0.40,
    description: 'Force-plate NM function. RSI-mod, CMJ metrics, grip strength.',
  },
  C3: {
    name: 'Perceived Readiness',
    index: 'RTT',
    weight: 0.30,
    description: 'Subjective self-report. Sleep, mood, soreness, motivation.',
  },

  // ─── RS Constructs ───
  C4: {
    name: 'Mechanical Residue',
    index: 'RS',
    weight: 0.40,
    description: 'Physical tissue cost from prior work. Eccentric markers, GPS load.',
  },
  C5: {
    name: 'Autonomic Recovery',
    index: 'RS',
    weight: 0.30,
    description: 'Parasympathetic rebound after training. HRV recovery, Recovery Beats.',
  },
  C6: {
    name: 'Perceived Recovery',
    index: 'RS',
    weight: 0.20,
    description: 'Subjective recovery. PRS, soreness, fatigue rating, well-being.',
  },
  C7: {
    name: 'Load Context',
    index: 'RS',
    weight: 0.10,
    description: 'How much work needs recovering from. ACWR, monotony, RPE load.',
  },

  // ─── IR Constructs (5 risk clusters, MAX logic) ───
  C8: {
    name: 'ACL / Knee Risk',
    index: 'IR',
    weight: 0.20,
    description: 'Landing asymmetry, valgus, COD asymmetry, stiffness asymmetry.',
  },
  C9: {
    name: 'Hamstring Risk',
    index: 'IR',
    weight: 0.20,
    description: 'NordBord asymmetry, HSR distance, sprint load, deceleration.',
  },
  C10: {
    name: 'Groin Risk',
    index: 'IR',
    weight: 0.20,
    description: 'AD:AB ratio, squeeze tests, COD load, thermal asymmetry.',
  },
  C11: {
    name: 'Load Risk',
    index: 'IR',
    weight: 0.20,
    description: 'ACWR spikes, monotony, work-load index, HMLD spikes.',
  },
  C12: {
    name: 'Psychosocial Risk',
    index: 'IR',
    weight: 0.20,
    description: 'Life stress, mood, sleep disruption. Independent injury predictor.',
  },

  // ─── NMS Constructs ───
  C13: {
    name: 'Force-Velocity Profile',
    index: 'NMS',
    weight: 0.25,
    description: 'Sprint F-V profiling. F0, V0, Pmax classification.',
  },
  C14: {
    name: 'Peak Force Capacity',
    index: 'NMS',
    weight: 0.35,
    description: 'IMTP peak force, CMJ force, NordBord force, grip strength.',
  },
  C15: {
    name: 'Velocity / Speed',
    index: 'NMS',
    weight: 0.20,
    description: 'Top speed, sprint distance, sprint counts, anaerobic index.',
  },
  C16: {
    name: 'NMS Enrichment',
    index: 'NMS',
    weight: 0.20,
    description: 'RSI-DJ, stiffness, VO2max, body composition, aerobic capacity.',
  },

  // ─── MS Constructs ───
  C17: {
    name: 'RPE:Load Coupling',
    index: 'MS',
    weight: 0.35,
    description: 'Perceived effort vs objective workload. Uncoupling flags distress.',
  },
  C18: {
    name: 'Psychometric State',
    index: 'MS',
    weight: 0.30,
    description: 'POMS, RESTQ, mood, motivation, confidence. Overtraining markers.',
  },
  C19: {
    name: 'Psychosocial Load',
    index: 'MS',
    weight: 0.20,
    description: 'Life stress, daily hassles, team dynamics, travel fatigue.',
  },
  C20: {
    name: 'Cognitive Performance',
    index: 'MS',
    weight: 0.15,
    description: 'Reaction time, PVT, decision-making. Lowest weight (rare data).',
  },
}

/** Get all construct IDs for a given index */
export function getConstructsForIndex(indexId) {
  return Object.entries(CONSTRUCT_DEFS)
    .filter(([, def]) => def.index === indexId)
    .map(([id, def]) => ({ id, ...def }))
}

/** Get construct definition by ID */
export function getConstruct(id) {
  return CONSTRUCT_DEFS[id] || null
}
