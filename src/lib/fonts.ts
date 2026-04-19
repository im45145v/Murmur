import type { FontOption, FontId } from './types'

export const FONT_OPTIONS: FontOption[] = [
  { id: 'cursive', name: 'Cursive', family: '"Segoe Print", "Comic Sans MS", cursive', preview: 'Abc' },
  { id: 'serif', name: 'Serif', family: 'Georgia, "Times New Roman", serif', preview: 'Abc' },
  { id: 'monospace', name: 'Typewriter', family: '"Courier New", Courier, monospace', preview: 'Abc' },
  { id: 'sans', name: 'Clean', family: 'system-ui, -apple-system, sans-serif', preview: 'Abc' },
  { id: 'display', name: 'Display', family: '"Trebuchet MS", "Lucida Grande", sans-serif', preview: 'Abc' },
  { id: 'handwritten', name: 'Handwritten', family: '"Segoe Script", "Bradley Hand", "Apple Chancery", cursive', preview: 'Abc' },
]

export function getFontFamily(fontId?: FontId | string): string {
  const found = FONT_OPTIONS.find((f) => f.id === fontId)
  return found?.family ?? FONT_OPTIONS[0].family
}

export function getDefaultFontForTemplate(templateId: string): FontId {
  const map: Record<string, FontId> = {
    scrapbook: 'cursive',
    'bold-card': 'sans',
    journal: 'monospace',
    handwritten: 'handwritten',
    'framed-note': 'cursive',
    confession: 'serif',
    polaroid: 'cursive',
    'neon-glow': 'sans',
    'gradient-wave': 'sans',
    'minimal-quote': 'serif',
    'retro-vintage': 'display',
    chalkboard: 'handwritten',
  }
  return map[templateId] ?? 'cursive'
}
