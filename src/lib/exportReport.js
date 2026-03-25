import jsPDF from 'jspdf'

/* ── Color helpers (same thresholds as IndexCard) ── */
export function scoreColor(v) {
  if (v >= 7.5) return '#10B981'
  if (v >= 5.5) return '#F59E0B'
  if (v >= 3.5) return '#F97316'
  return '#EF4444'
}

export function invertedColor(v) {
  // Higher = safer (same as scoreColor — injury_risk is already stored as safety score)
  if (v >= 7) return '#10B981'
  if (v >= 5) return '#F59E0B'
  if (v >= 3.5) return '#F97316'
  return '#EF4444'
}

function fmt(val) {
  if (val == null) return '—'
  return (val / 10).toFixed(1)
}

function trendArrow(t) {
  if (t === 'increasing') return { sym: '\u2191', color: '#10B981' }
  if (t === 'decreasing') return { sym: '\u2193', color: '#EF4444' }
  return { sym: '\u2192', color: '#888' }
}

/* ── SVG circle gauge (inline for standalone HTML) ── */
function circleGaugeSVG(value, inverted = false, size = 54) {
  const numVal = value != null ? value / 10 : 0
  const displayVal = value != null ? (value / 10).toFixed(1) : '—'
  const color = inverted ? invertedColor(numVal) : scoreColor(numVal)
  const pct = Math.min(numVal / 10, 1)
  const sw = size >= 70 ? 6 : 5
  const r = (size - sw - 2) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)
  const cx = size / 2
  const cy = size / 2
  // track-stroke uses a CSS var so it adapts to theme
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align:middle">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--gauge-track)" stroke-width="${sw}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"
      transform="rotate(-90 ${cx} ${cy})" style="filter:drop-shadow(0 0 6px ${color}66)"/>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
      fill="${color}" font-family="monospace" font-size="${size * 0.32}px" font-weight="700">${displayVal}</text>
  </svg>`
}

/* ── Logos ── */
const LOGO_DARK = 'https://i.imgur.com/LgVMPLV.png'
const LOGO_LIGHT = 'https://i.imgur.com/7piXXXA.png'

/* ── Theme toggle script (injected into HTML exports) ── */
const themeToggleScript = `
<script>
(function(){
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var logo = document.getElementById('header-logo');
  var current = root.getAttribute('data-theme') || 'dark';
  function apply(t){
    root.setAttribute('data-theme', t);
    current = t;
    btn.textContent = t === 'dark' ? '\\u2600' : '\\u263E';
    btn.title = t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    if(logo) logo.src = t === 'dark' ? '${LOGO_DARK}' : '${LOGO_LIGHT}';
  }
  btn.addEventListener('click', function(){ apply(current === 'dark' ? 'light' : 'dark'); });
  apply(current);
})();
<\/script>`

/* ── Shared CSS for standalone HTML reports ── */
const reportCSS = `
  * { margin:0; padding:0; box-sizing:border-box; }

  /* ── Dark theme (default) ── */
  :root, [data-theme="dark"] {
    --bg: #0A0A0A;
    --text: #E8E8E8;
    --text-heading: #FFFFFF;
    --text-sub: #888;
    --text-muted: #666;
    --border: rgba(255,255,255,0.08);
    --border-light: rgba(255,255,255,0.03);
    --card-bg: rgba(255,255,255,0.03);
    --card-border: rgba(255,255,255,0.06);
    --gauge-track: rgba(255,255,255,0.10);
    --chart-grid: rgba(255,255,255,0.06);
    --chart-dot-stroke: #0A0A0A;
  }

  /* ── Light theme ── */
  [data-theme="light"] {
    --bg: #F8F9FA;
    --text: #1A1A1A;
    --text-heading: #000000;
    --text-sub: #555;
    --text-muted: #777;
    --border: rgba(0,0,0,0.10);
    --border-light: rgba(0,0,0,0.04);
    --card-bg: rgba(0,0,0,0.03);
    --card-border: rgba(0,0,0,0.08);
    --gauge-track: rgba(0,0,0,0.10);
    --chart-grid: rgba(0,0,0,0.08);
    --chart-dot-stroke: #F8F9FA;
  }

  body { background:var(--bg); color:var(--text); font-family:'Inter','Helvetica Neue',Arial,sans-serif; transition:background 0.2s,color 0.2s; }
  .page { max-width:760px; margin:0 auto; padding:24px 28px; }

  .header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--border); padding-bottom:16px; margin-bottom:20px; }
  .header h1 { font-size:1.6rem; font-weight:700; letter-spacing:-0.5px; color:var(--text-heading); }
  .header .sub { font-family:monospace; font-size:0.7rem; color:var(--text-sub); letter-spacing:1px; }

  #theme-toggle { position:fixed; top:16px; right:20px; z-index:100; width:36px; height:36px; border-radius:50%; border:1px solid var(--border); background:var(--card-bg); color:var(--text); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; backdrop-filter:blur(8px); }
  #theme-toggle:hover { border-color:var(--text-sub); }

  .avg-row { display:flex; gap:18px; justify-content:center; flex-wrap:wrap; margin-bottom:24px; }
  .avg-card { text-align:center; padding:16px 20px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:6px; min-width:120px; }
  .avg-card .label { font-family:monospace; font-size:0.8rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--text-heading); margin-bottom:10px; }

  table { width:100%; border-collapse:collapse; font-size:0.85rem; }
  th { font-family:monospace; font-size:0.75rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--text-heading); padding:10px 10px; text-align:right; border-bottom:1px solid var(--border); }
  th:first-child, th:nth-child(2) { text-align:left; }
  td { padding:8px 10px; border-bottom:1px solid var(--border-light); text-align:right; vertical-align:middle; }
  td:first-child { text-align:left; font-weight:600; color:var(--text); }
  td:nth-child(2) { text-align:left; }
  .pos { display:inline-block; padding:2px 7px; font-family:monospace; font-size:0.6rem; letter-spacing:1px; border:1px solid rgba(227,6,19,0.3); color:rgba(227,6,19,0.85); border-radius:2px; }
  .trend-cell { font-size:1.1rem; font-weight:700; }

  .chart-section { margin-top:24px; padding:18px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:6px; }
  .chart-section .label { font-family:monospace; font-size:0.8rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--text-heading); margin-bottom:12px; }

  .header-logo { height:32px; width:auto; }
  .report-footer { margin-top:32px; padding-top:16px; border-top:1px solid var(--border); text-align:center; font-family:monospace; font-size:0.6rem; letter-spacing:1px; color:var(--text-muted); }
`

/* ───────────────────────────────────────────────────
   WEEKLY ONE-PAGER
   ─────────────────────────────────────────────────── */
export function generateWeeklyHTML(squad, weekDate, teamName, theme) {
  const activeTheme = theme || document.documentElement.getAttribute('data-theme') || 'dark'
  const activeLogo = activeTheme === 'light' ? LOGO_LIGHT : LOGO_DARK
  const n = squad.length || 1
  const avgPI = squad.reduce((s, r) => s + (r.api || 0), 0) / n
  const avgRTT = squad.reduce((s, r) => s + (r.rtt || 0), 0) / n
  const avgRS = squad.reduce((s, r) => s + (r.rs || 0), 0) / n
  const avgTMI = squad.reduce((s, r) => s + (r.tmi || 0), 0) / n
  const avgIR = squad.reduce((s, r) => s + (r.injury_risk || 0), 0) / n

  const avgCards = [
    { label: 'PI', val: avgPI },
    { label: 'RTT', val: avgRTT },
    { label: 'RS', val: avgRS },
    { label: 'TMI', val: avgTMI },
    { label: 'Injury Risk', val: avgIR, inverted: true },
  ]

  const rows = squad.map(r => {
    const name = r.players?.name || '—'
    const pos = r.players?.position || '—'
    return `<tr>
      <td>${name}</td>
      <td><span class="pos">${pos}</span></td>
      <td>${circleGaugeSVG(r.api)}</td>
      <td>${circleGaugeSVG(r.rtt)}</td>
      <td>${circleGaugeSVG(r.rs)}</td>
      <td>${circleGaugeSVG(r.tmi)}</td>
      <td>${circleGaugeSVG(r.injury_risk, true)}</td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html><html lang="en" data-theme="${activeTheme}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Weekly Report — ${weekDate}${teamName ? ` — ${teamName}` : ''}</title>
<style>${reportCSS}</style></head><body>
<button id="theme-toggle" title="Toggle theme"></button>
<div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:14px">
      <img id="header-logo" src="${activeLogo}" alt="Barin Sports" class="header-logo"/>
      <div>
        <h1>Microcycle Report</h1>
        <div class="sub">${teamName || 'All Teams'}</div>
      </div>
    </div>
    <div class="sub">${weekDate}</div>
  </div>

  <div class="avg-row">
    ${avgCards.map(c => `<div class="avg-card">
      <div class="label">${c.label}</div>
      ${circleGaugeSVG(c.val, c.inverted, 80)}
    </div>`).join('')}
  </div>

  <table>
    <thead><tr>
      <th style="text-align:left">Player</th><th style="text-align:left">Pos</th>
      <th>PI</th><th>RTT</th><th>RS</th><th>TMI</th><th>Injury Risk</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="report-footer">&copy; 2026 Barin Sports PRO Sports Science. All Rights Reserved.</div>
</div>
${themeToggleScript}
</body></html>`
}

/* ───────────────────────────────────────────────────
   MESOCYCLE ONE-PAGER
   ─────────────────────────────────────────────────── */
export function generateMesocycleHTML(squad, periodLabel, teamName, theme) {
  const activeTheme = theme || document.documentElement.getAttribute('data-theme') || 'dark'
  const activeLogo = activeTheme === 'light' ? LOGO_LIGHT : LOGO_DARK
  const n = squad.length || 1
  const avgPI = squad.reduce((s, r) => s + (r.api || 0), 0) / n
  const avgRTT = squad.reduce((s, r) => s + (r.rtt || 0), 0) / n
  const avgRS = squad.reduce((s, r) => s + (r.rs || 0), 0) / n
  const avgTMI = squad.reduce((s, r) => s + (r.tmi || 0), 0) / n
  const avgIR = squad.reduce((s, r) => s + (r.injury_risk || 0), 0) / n

  // Compute average trend across 4 microcycles (for the line chart)
  const weekCount = squad[0]?.summary?.weekOverviews?.length || 4
  const weekLabels = squad[0]?.summary?.weekOverviews?.map(w => w.date) || []
  const avgByWeek = []
  for (let i = 0; i < weekCount; i++) {
    let piSum = 0, cnt = 0
    for (const r of squad) {
      const ov = r.summary?.weekOverviews?.[i]
      if (ov && ov.pi !== 'N/A') {
        piSum += parseFloat(ov.pi)
        cnt++
      }
    }
    avgByWeek.push(cnt ? (piSum / cnt) : 0)
  }

  const avgCards = [
    { label: 'PI', val: avgPI },
    { label: 'RTT', val: avgRTT },
    { label: 'RS', val: avgRS },
    { label: 'TMI', val: avgTMI },
    { label: 'Injury Risk', val: avgIR, inverted: true },
  ]

  const rows = squad.map(r => {
    const name = r.player?.name || '—'
    const pos = r.player?.position || '—'
    const perfTrend = r.summary?.trends?.performance
    const { sym, color } = trendArrow(perfTrend)
    return `<tr>
      <td>${name}</td>
      <td><span class="pos">${pos}</span></td>
      <td>${circleGaugeSVG(r.api)}</td>
      <td>${circleGaugeSVG(r.rtt)}</td>
      <td>${circleGaugeSVG(r.rs)}</td>
      <td>${circleGaugeSVG(r.tmi)}</td>
      <td>${circleGaugeSVG(r.injury_risk, true)}</td>
      <td class="trend-cell" style="color:${color}">${sym}</td>
    </tr>`
  }).join('')

  // SVG line chart for average PI trend
  const lineChart = buildLineChartSVG(avgByWeek, weekLabels)

  return `<!DOCTYPE html><html lang="en" data-theme="${activeTheme}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Mesocycle Report — ${periodLabel}${teamName ? ` — ${teamName}` : ''}</title>
<style>${reportCSS}</style></head><body>
<button id="theme-toggle" title="Toggle theme"></button>
<div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:14px">
      <img id="header-logo" src="${activeLogo}" alt="Barin Sports" class="header-logo"/>
      <div>
        <h1>Mesocycle Report</h1>
        <div class="sub">${teamName || 'All Teams'} &mdash; 4 Microcycles</div>
      </div>
    </div>
    <div class="sub">${periodLabel}</div>
  </div>

  <table>
    <thead><tr>
      <th style="text-align:left">Player</th><th style="text-align:left">Pos</th>
      <th>PI</th><th>RTT</th><th>RS</th><th>TMI</th><th>Injury Risk</th><th>Trend</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="avg-row" style="margin-top:24px">
    ${avgCards.map(c => `<div class="avg-card">
      <div class="label">${c.label}</div>
      ${circleGaugeSVG(c.val, c.inverted, 80)}
    </div>`).join('')}
  </div>

  <div class="chart-section">
    <div class="label">Average PI Trend — 4 Microcycles</div>
    ${lineChart}
  </div>

  <div class="report-footer">&copy; 2026 Barin Sports PRO Sports Science. All Rights Reserved.</div>
</div>
${themeToggleScript}
</body></html>`
}

/* ── SVG line chart (no JS dependencies) ── */
function buildLineChartSVG(values, labels) {
  const W = 700, H = 200, pad = { t: 20, r: 20, b: 40, l: 45 }
  const plotW = W - pad.l - pad.r
  const plotH = H - pad.t - pad.b
  const n = values.length
  if (n < 2) return '<div style="color:var(--text-muted);font-size:0.75rem;text-align:center">Not enough data for chart</div>'

  const minV = 0, maxV = 10
  const pts = values.map((v, i) => {
    const x = pad.l + (i / (n - 1)) * plotW
    const y = pad.t + plotH - ((v - minV) / (maxV - minV)) * plotH
    return { x, y, v }
  })

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')

  // Grid lines at 2.5, 5.0, 7.5
  const gridLines = [2.5, 5.0, 7.5].map(gv => {
    const y = pad.t + plotH - ((gv - minV) / (maxV - minV)) * plotH
    return `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="var(--chart-grid)" stroke-dasharray="4"/>
      <text x="${pad.l - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-muted)" font-size="10" font-family="monospace">${gv.toFixed(1)}</text>`
  }).join('')

  // X labels
  const xLabels = pts.map((p, i) => {
    const label = labels[i] || `Wk ${i + 1}`
    return `<text x="${p.x}" y="${H - 8}" text-anchor="middle" fill="var(--text-muted)" font-size="9" font-family="monospace">${label}</text>`
  }).join('')

  // Data dots & labels
  const dots = pts.map(p => {
    const color = scoreColor(p.v)
    return `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${color}" stroke="var(--chart-dot-stroke)" stroke-width="2.5"/>
      <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" fill="${color}" font-size="12" font-weight="700" font-family="monospace">${p.v.toFixed(1)}</text>`
  }).join('')

  // Area fill
  const areaPath = `M${pts[0].x},${pts[0].y} ${pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${pts[n - 1].x},${pad.t + plotH} L${pts[0].x},${pad.t + plotH} Z`

  return `<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block">
    ${gridLines}
    <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E30613" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#E30613" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${areaPath}" fill="url(#areaFill)"/>
    <polyline points="${polyline}" fill="none" stroke="#E30613" stroke-width="2.5" stroke-linejoin="round"/>
    ${dots}
    ${xLabels}
  </svg>`
}

/* ── Export dispatcher ── */
export function downloadHTML(html, filename) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadPDF(html, filename) {
  // Detect current theme from the app
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark'
  const bgColor = currentTheme === 'light' ? '#F8F9FA' : '#0A0A0A'

  // Inject/override theme attribute into the HTML so the export matches
  const themedHTML = html.replace(/<html lang="en"(?: data-theme="[^"]*")?>/,
    `<html lang="en" data-theme="${currentTheme}">`)

  // Render standalone HTML in hidden iframe → canvas → PDF
  const iframe = document.createElement('iframe')
  // Use portrait A4 proportions (210×297mm ≈ 794×1123px at 96dpi)
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:2000px;border:none;'
  document.body.appendChild(iframe)

  return new Promise((resolve) => {
    iframe.onload = async () => {
      // Wait for rendering
      await new Promise(r => setTimeout(r, 300))

      const { default: html2canvas } = await import('html2canvas')
      const body = iframe.contentDocument.body
      const canvas = await html2canvas(body, { backgroundColor: bgColor, scale: 2, width: 794 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', [210, 297]) // portrait A4 (210mm × 297mm)
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pdfW) / canvas.width
      let left = imgH
      let pos = 0
      pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH)
      left -= pdfH
      while (left > 0) {
        pos -= pdfH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH)
        left -= pdfH
      }
      pdf.save(filename)
      document.body.removeChild(iframe)
      resolve()
    }
    iframe.contentDocument.open()
    iframe.contentDocument.write(themedHTML)
    iframe.contentDocument.close()
  })
}
