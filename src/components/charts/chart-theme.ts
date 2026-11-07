export type AreaChartTone = "brand" | "gross" | "success"

export type BarChartTone = "brand" | "volume"

type AreaChartTheme = {
  line: string
  fillTop: string
  fillBottom: string
  dotStroke: string
}

type BarChartTheme = {
  gradient: string
  trackClassName: string
}

const AREA: Record<AreaChartTone, AreaChartTheme> = {
  brand: {
    line: "var(--chart-series-brand-line)",
    fillTop: "var(--chart-series-brand)",
    fillBottom: "var(--chart-series-brand-deep)",
    dotStroke: "var(--chart-series-brand)",
  },
  gross: {
    line: "var(--chart-series-gross-line)",
    fillTop: "var(--chart-series-gross)",
    fillBottom: "var(--chart-series-gross-deep)",
    dotStroke: "var(--chart-series-gross)",
  },
  success: {
    line: "var(--chart-series-success-line)",
    fillTop: "var(--chart-series-success)",
    fillBottom: "var(--chart-series-success-deep)",
    dotStroke: "var(--chart-series-success)",
  },
}

const BAR: Record<BarChartTone, BarChartTheme> = {
  brand: {
    gradient:
      "linear-gradient(to top, var(--chart-series-brand-deep), var(--chart-series-brand))",
    trackClassName: "bg-brand-soft/40",
  },
  volume: {
    gradient:
      "linear-gradient(to top, var(--chart-series-volume-deep) 0%, var(--chart-series-volume) 100%)",
    trackClassName: "bg-violet-500/10 dark:bg-violet-500/15",
  },
}

export function getAreaChartTheme(tone: AreaChartTone): AreaChartTheme {
  return AREA[tone]
}

export function getBarChartTheme(tone: BarChartTone): BarChartTheme {
  return BAR[tone]
}
