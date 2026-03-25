/**
 * Chart Registry — maps chart spec types from MD files to React chart components.
 * PlayerDetail.jsx iterates over KNOWLEDGE modules, collects chartSpecs,
 * and renders matching components from this registry.
 */
import TrendLineChart from '../components/charts/TrendLineChart'
import LoadRadarChart from '../components/charts/LoadRadarChart'
import StackedAreaChart from '../components/charts/StackedAreaChart'
import DualAxisChart from '../components/charts/DualAxisChart'
import GaugeChart from '../components/charts/GaugeChart'
import ZoneAreaChart from '../components/charts/ZoneAreaChart'
import GroupedBarChart from '../components/charts/GroupedBarChart'

export const CHART_REGISTRY = {
  'line-trend':    TrendLineChart,
  'radar':         LoadRadarChart,
  'stacked-area':  StackedAreaChart,
  'dual-axis':     DualAxisChart,
  'gauge':         GaugeChart,
  'zone-area':     ZoneAreaChart,
  'grouped-bar':   GroupedBarChart,
}
