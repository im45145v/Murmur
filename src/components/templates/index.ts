export { BaseTemplate, buildFromToLabel, buildHeaderLabel, buildSignoff } from './BaseTemplate'
export { ScrapbookTemplate } from './ScrapbookTemplate'
export { BoldCardTemplate } from './BoldCardTemplate'
export { JournalTemplate } from './JournalTemplate'
export { HandwrittenTemplate } from './HandwrittenTemplate'
export { FramedNoteTemplate } from './FramedNoteTemplate'
export { ConfessionTemplate } from './ConfessionTemplate'
export { PolaroidTemplate } from './PolaroidTemplate'
export { NeonGlowTemplate } from './NeonGlowTemplate'
export { GradientWaveTemplate } from './GradientWaveTemplate'
export { MinimalQuoteTemplate } from './MinimalQuoteTemplate'
export { RetroVintageTemplate } from './RetroVintageTemplate'
export { ChalkboardTemplate } from './ChalkboardTemplate'

import type { Submission, Template } from '@/lib/types'
import { ScrapbookTemplate } from './ScrapbookTemplate'
import { BoldCardTemplate } from './BoldCardTemplate'
import { JournalTemplate } from './JournalTemplate'
import { HandwrittenTemplate } from './HandwrittenTemplate'
import { FramedNoteTemplate } from './FramedNoteTemplate'
import { ConfessionTemplate } from './ConfessionTemplate'
import { PolaroidTemplate } from './PolaroidTemplate'
import { NeonGlowTemplate } from './NeonGlowTemplate'
import { GradientWaveTemplate } from './GradientWaveTemplate'
import { MinimalQuoteTemplate } from './MinimalQuoteTemplate'
import { RetroVintageTemplate } from './RetroVintageTemplate'
import { ChalkboardTemplate } from './ChalkboardTemplate'
import type { BaseTemplateProps } from './BaseTemplate'
import type { ComponentType } from 'react'

const templateMap: Record<string, ComponentType<BaseTemplateProps>> = {
  scrapbook: ScrapbookTemplate,
  'bold-card': BoldCardTemplate,
  journal: JournalTemplate,
  handwritten: HandwrittenTemplate,
  'framed-note': FramedNoteTemplate,
  confession: ConfessionTemplate,
  polaroid: PolaroidTemplate,
  'neon-glow': NeonGlowTemplate,
  'gradient-wave': GradientWaveTemplate,
  'minimal-quote': MinimalQuoteTemplate,
  'retro-vintage': RetroVintageTemplate,
  chalkboard: ChalkboardTemplate,
}

export function getTemplateComponent(templateId: string): ComponentType<BaseTemplateProps> {
  return templateMap[templateId] ?? ScrapbookTemplate
}

export function getDefaultTemplateId(submission: Submission, templates: Template[]): string {
  for (const t of templates) {
    if (t.isEnabled && t.defaultForCategories.includes(submission.category)) {
      return t.id
    }
  }
  return 'scrapbook'
}
