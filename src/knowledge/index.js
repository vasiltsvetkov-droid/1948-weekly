/**
 * Knowledge Loader
 *
 * Imports all .md files from src/knowledge/ using Vite's ?raw import (build-time, zero runtime cost).
 * Parses each MD file into a structured JS object and exports a KNOWLEDGE map keyed by topic slug.
 */

import loadManagementRaw from './load-management.md?raw'
import periodizationRaw from './periodization.md?raw'
import fatigueMonitoringRaw from './fatigue-monitoring.md?raw'
import injuryRiskRaw from './injury-risk.md?raw'
import mechanicalLoadRaw from './mechanical-load.md?raw'
import speedExposureRaw from './speed-exposure.md?raw'
import recoveryProtocolsRaw from './recovery-protocols.md?raw'
import positionDemandsRaw from './position-demands.md?raw'
import returnToPlayRaw from './return-to-play.md?raw'
import trainingMonotonyRaw from './training-monotony.md?raw'
import matchDemandsRaw from './match-demands.md?raw'
import strengthPowerRaw from './strength-power.md?raw'

// ---------------------------------------------------------------------------
// Markdown Parser — splits on ## headings, parses tables, extracts templates
// ---------------------------------------------------------------------------

function parseMarkdownTable(text) {
  const lines = text.trim().split('\n').filter(l => l.trim().startsWith('|'))
  if (lines.length < 2) return []
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean)
  // skip separator row (line 1)
  return lines.slice(2).map(row => {
    const cells = row.split('|').map(c => c.trim()).filter(Boolean)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cells[i] || '' })
    return obj
  })
}

function parseSection(content) {
  const lines = content.split('\n')
  const tables = []
  const text = []
  let inTable = false
  let tableLines = []

  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      inTable = true
      tableLines.push(line)
    } else {
      if (inTable) {
        tables.push(parseMarkdownTable(tableLines.join('\n')))
        tableLines = []
        inTable = false
      }
      text.push(line)
    }
  }
  if (inTable) tables.push(parseMarkdownTable(tableLines.join('\n')))

  return { text: text.join('\n').trim(), tables }
}

function parseMD(raw) {
  const sections = {}
  const parts = raw.split(/^## /m)

  // First part before any ## is the title area
  const titlePart = parts[0]
  const titleMatch = titlePart.match(/^# (.+)/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Unknown'

  for (let i = 1; i < parts.length; i++) {
    const sectionText = parts[i]
    const headingEnd = sectionText.indexOf('\n')
    const heading = sectionText.slice(0, headingEnd).trim()
    const body = sectionText.slice(headingEnd + 1)
    const key = heading
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
    sections[key] = parseSection(body)
  }

  // Extract structured fields
  const postulates = extractList(sections.key_postulates?.text || '')
  const thresholds = sections.thresholds__decision_rules?.tables?.[0]
    || sections.thresholds__decision_rules?.tables?.flat()
    || []
  const templates = extractTemplates(sections.analysis_templates?.text || '')
  const chartSpecs = extractChartSpecs(sections.chart_specifications?.text || '')
  const refs = extractList(sections.references?.text || '')

  return {
    title,
    postulates,
    thresholds: Array.isArray(thresholds) ? thresholds : [],
    templates,
    chartSpecs,
    refs,
    _raw: raw,
    _sections: sections,
  }
}

/**
 * Strip markdown formatting symbols from text:
 * - **bold** → bold
 * - *italic* → italic
 * - `code` → code
 * - [link](url) → link
 * - # headings → headings
 */
function stripMarkdown(text) {
  if (!text) return text
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')        // *italic*
    .replace(/`([^`]+)`/g, '$1')        // `code`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url)
    .replace(/^#{1,6}\s+/gm, '')        // # headings
    .replace(/^\|.*\|$/gm, '')          // | table rows |
    .replace(/^[-=]{3,}$/gm, '')        // --- or === separators
    .replace(/\n{3,}/g, '\n\n')         // collapse multiple newlines
    .trim()
}

function extractList(text) {
  if (!text) return []
  return text
    .split('\n')
    .filter(l => /^\s*[-\d]/.test(l))
    .map(l => stripMarkdown(l.replace(/^\s*[-\d.]+\s*/, '').trim()))
    .filter(Boolean)
}

function extractTemplates(text) {
  if (!text) return {}
  const templates = {}
  const blocks = text.split(/###\s+/)
  for (const block of blocks) {
    if (!block.trim()) continue
    const lines = block.split('\n')
    const key = lines[0].trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
    templates[key] = stripMarkdown(lines.slice(1).join('\n').trim())
  }
  // If no sub-headings, treat the whole text as a single "default" template
  if (Object.keys(templates).length === 0 && text.trim()) {
    templates.default = stripMarkdown(text.trim())
  }
  return templates
}

function extractChartSpecs(text) {
  if (!text) return []
  const specs = []
  const blocks = text.split(/###\s+/)
  for (const block of blocks) {
    if (!block.trim()) continue
    const lines = block.trim().split('\n')
    const name = lines[0].trim()
    const body = lines.slice(1).join('\n')

    const typeMatch = body.match(/type:\s*`?([a-z-]+)`?/i)
    const dataMatch = body.match(/data(?:Key|Source|Fields?):\s*`?([^`\n]+)`?/i)
    const yMatch = body.match(/y(?:Axis|Key|Field):\s*`?([^`\n]+)`?/i)
    const refLinesMatch = body.match(/reference[Ll]ines?:\s*`?\[?([^\]`\n]+)\]?`?/i)
    const zonesMatch = body.match(/zones?:\s*`?\[?([^\]`\n]+)\]?`?/i)

    specs.push({
      name,
      type: typeMatch ? typeMatch[1] : 'line-trend',
      dataKey: dataMatch ? dataMatch[1].trim() : '',
      yKey: yMatch ? yMatch[1].trim() : '',
      referenceLines: refLinesMatch
        ? refLinesMatch[1].split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
        : [],
      zones: zonesMatch ? zonesMatch[1].trim() : '',
      _raw: body,
    })
  }
  return specs
}

// ---------------------------------------------------------------------------
// Parse all modules and export KNOWLEDGE map
// ---------------------------------------------------------------------------

const modules = {
  'load-management': loadManagementRaw,
  'periodization': periodizationRaw,
  'fatigue-monitoring': fatigueMonitoringRaw,
  'injury-risk': injuryRiskRaw,
  'mechanical-load': mechanicalLoadRaw,
  'speed-exposure': speedExposureRaw,
  'recovery-protocols': recoveryProtocolsRaw,
  'position-demands': positionDemandsRaw,
  'return-to-play': returnToPlayRaw,
  'training-monotony': trainingMonotonyRaw,
  'match-demands': matchDemandsRaw,
  'strength-power': strengthPowerRaw,
}

export const KNOWLEDGE = {}
for (const [slug, raw] of Object.entries(modules)) {
  KNOWLEDGE[slug] = parseMD(raw)
}

/**
 * Get thresholds for a topic as a lookup map.
 * @param {string} topic - Topic slug (e.g. 'load-management')
 * @param {string} keyField - Column name to use as key (default: 'Metric' or first column)
 * @returns {Object} Map of key → row object
 */
export function getThresholds(topic, keyField) {
  const mod = KNOWLEDGE[topic]
  if (!mod || !mod.thresholds.length) return {}
  const field = keyField || Object.keys(mod.thresholds[0])[0]
  const map = {}
  for (const row of mod.thresholds) {
    if (row[field]) map[row[field]] = row
  }
  return map
}

/**
 * Get analysis template text for a topic and zone.
 * @param {string} topic - Topic slug
 * @param {string} zone - Template zone key (e.g. 'danger', 'optimal')
 * @returns {string} Template text or empty string
 */
export function getTemplate(topic, zone) {
  const mod = KNOWLEDGE[topic]
  if (!mod) return ''
  return mod.templates[zone] || mod.templates.default || ''
}

/**
 * Interpolate a template string, replacing ${key} with values from a data object.
 * @param {string} template - Template with ${key} placeholders
 * @param {Object} data - Key-value pairs to interpolate
 * @returns {string} Interpolated string
 */
export function interpolate(template, data) {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    const val = data[key]
    if (val == null) return 'N/A'
    if (typeof val === 'number') return Number.isInteger(val) ? String(val) : val.toFixed(2)
    return String(val)
  })
}

/**
 * Collect all chart specs across all knowledge modules.
 * @returns {{ topic: string, spec: Object }[]}
 */
export function getAllChartSpecs() {
  const all = []
  for (const [topic, mod] of Object.entries(KNOWLEDGE)) {
    for (const spec of mod.chartSpecs) {
      all.push({ topic, spec })
    }
  }
  return all
}
