export interface TextFitResult {
  fontSize: number
  lineHeight: number
  mode: 'short' | 'medium' | 'long' | 'veryLong'
  warning?: string
}

export function getTextFit(text: string): TextFitResult {
  const len = text.length

  if (len < 100) {
    return { fontSize: 28, lineHeight: 1.4, mode: 'short' }
  } else if (len <= 250) {
    return { fontSize: 22, lineHeight: 1.5, mode: 'medium' }
  } else if (len <= 500) {
    return { fontSize: 18, lineHeight: 1.6, mode: 'long' }
  } else {
    return {
      fontSize: 14,
      lineHeight: 1.7,
      mode: 'veryLong',
      warning: 'Text is very long and may overflow the template canvas. Consider shortening.',
    }
  }
}

export function truncateToFit(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - 3) + '...'
}
