export interface TextFitResult {
  fontSize: number
  lineHeight: number
  lineHeightPx: number
  mode: 'tiny' | 'short' | 'medium' | 'long' | 'veryLong'
  warning?: string
}

/**
 * Continuous text-fitting: linearly interpolates font size to FILL
 * a 1080×1080 canvas. Font sizes are large by design — the text
 * should dominate the template, not float in a sea of whitespace.
 */
export function getTextFit(text: string): TextFitResult {
  const len = text.length

  // Breakpoints: [charCount, fontSize, lineHeight]
  // Tuned for 1080px canvas with ~100px padding each side → ~880px usable
  const stops: [number, number, number][] = [
    [0, 96, 1.2],
    [30, 90, 1.22],
    [80, 72, 1.25],
    [150, 56, 1.3],
    [300, 44, 1.35],
    [500, 36, 1.38],
    [700, 30, 1.4],
    [1000, 26, 1.42],
  ]

  let fontSize: number
  let lineHeight: number

  if (len <= stops[0][0]) {
    fontSize = stops[0][1]
    lineHeight = stops[0][2]
  } else if (len >= stops[stops.length - 1][0]) {
    fontSize = stops[stops.length - 1][1]
    lineHeight = stops[stops.length - 1][2]
  } else {
    // Find the two surrounding stops and lerp
    let lo = stops[0]
    let hi = stops[stops.length - 1]
    for (let i = 0; i < stops.length - 1; i++) {
      if (len >= stops[i][0] && len <= stops[i + 1][0]) {
        lo = stops[i]
        hi = stops[i + 1]
        break
      }
    }
    const t = (len - lo[0]) / (hi[0] - lo[0])
    fontSize = Math.round(lo[1] + (hi[1] - lo[1]) * t)
    lineHeight = +(lo[2] + (hi[2] - lo[2]) * t).toFixed(3)
  }

  const lineHeightPx = Math.round(fontSize * lineHeight)

  let mode: TextFitResult['mode']
  if (len < 40) mode = 'tiny'
  else if (len < 100) mode = 'short'
  else if (len < 250) mode = 'medium'
  else if (len < 600) mode = 'long'
  else mode = 'veryLong'

  return {
    fontSize,
    lineHeight,
    lineHeightPx,
    mode,
    ...(len > 800 ? { warning: 'Text is very long and may overflow the template canvas. Consider shortening.' } : {}),
  }
}

export function truncateToFit(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - 3) + '...'
}
