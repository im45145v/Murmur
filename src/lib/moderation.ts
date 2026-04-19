import type { TriggerFlag, RiskLevel, ModerationFlag } from './types'
import { generateId } from './utils'

const EXPLICIT_INSULT_PATTERNS = [
  /\b(idiot|stupid|moron|dumb|loser|trash|scum|filth|worthless|disgusting person)\b/gi,
]
const SEXUAL_CONTENT_PATTERNS = [
  /\b(sex|sexual|nude|naked|porn|explicit|intimate|hookup)\b/gi,
]
const ABUSE_PATTERNS = [
  /\b(harass(ed|ment|ing)?|abus(ed|ive|ing)?|assault(ed)?|violat(ed|ion|ing)?|molest)\b/gi,
]
const SELF_HARM_PATTERNS = [
  /\b(suicide|self.harm|kill myself|end my life|hurt myself|cutting)\b/gi,
]
const IDENTIFICATION_PATTERNS = [
  /\b([A-Z][a-z]+ [A-Z][a-z]+)\b(?=.*\b(roll|student|id|number)\b)/gi,
  /\broll\s*(no|number|#)?\s*\d+/gi,
]
const DEFAMATORY_PATTERNS = [
  /\b(lied|cheated|fraud|corrupt|criminal|illegal|bribed|stole|stealing|plagiari)\b/gi,
]
const HATE_SPEECH_PATTERNS = [
  /\b(caste|casteist|racist|sexist|homophob|transphob|bigot)\b/gi,
]
const PROFANITY_PATTERNS = [
  /\b(f+u+c+k+|s+h+i+t+|b+i+t+c+h+|a+s+s+h+o+l+e+|bastard)\b/gi,
]

interface PatternGroup {
  patterns: RegExp[]
  type: ModerationFlag['type']
  description: string
  severity: RiskLevel
}

const PATTERN_GROUPS: PatternGroup[] = [
  { patterns: EXPLICIT_INSULT_PATTERNS, type: 'explicit_insult', description: 'Contains explicit insults targeting an individual', severity: 'High' },
  { patterns: SEXUAL_CONTENT_PATTERNS, type: 'sexual_content', description: 'May contain sexual content', severity: 'Critical' },
  { patterns: ABUSE_PATTERNS, type: 'abuse_allegation', description: 'Contains allegations of abuse or harassment', severity: 'Critical' },
  { patterns: SELF_HARM_PATTERNS, type: 'self_harm', description: 'References self-harm or suicide', severity: 'Critical' },
  { patterns: IDENTIFICATION_PATTERNS, type: 'direct_identification', description: 'May contain identifying information like roll numbers or full names', severity: 'High' },
  { patterns: DEFAMATORY_PATTERNS, type: 'defamatory', description: 'Contains potentially defamatory claims', severity: 'High' },
  { patterns: HATE_SPEECH_PATTERNS, type: 'hate_speech', description: 'Contains hate speech or discriminatory language', severity: 'Critical' },
  { patterns: PROFANITY_PATTERNS, type: 'profanity', description: 'Contains strong profanity', severity: 'Medium' },
]

export function analyzeRisk(text: string, triggerFlag: TriggerFlag): { riskLevel: RiskLevel; flags: ModerationFlag[] } {
  const flags: ModerationFlag[] = []

  for (const group of PATTERN_GROUPS) {
    for (const pattern of group.patterns) {
      const matches = text.match(pattern)
      if (matches) {
        flags.push({
          id: generateId(),
          type: group.type,
          description: group.description,
          severity: group.severity,
          excerpt: matches[0],
        })
        break
      }
    }
  }

  const severityOrder: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical']

  let maxSeverity: RiskLevel = 'Low'
  for (const flag of flags) {
    if (severityOrder.indexOf(flag.severity) > severityOrder.indexOf(maxSeverity)) {
      maxSeverity = flag.severity
    }
  }

  if (triggerFlag === 'Yes' && severityOrder.indexOf(maxSeverity) < severityOrder.indexOf('High')) {
    maxSeverity = 'High'
  } else if (triggerFlag === 'Maybe' && maxSeverity === 'Low') {
    maxSeverity = 'Medium'
  }

  return { riskLevel: maxSeverity, flags }
}

export function softenPhrasing(text: string): string {
  return text
    .replace(/\b(hate|despise|can't stand)\b/gi, 'am frustrated with')
    .replace(/\b(terrible|awful|horrible)\b/gi, 'difficult')
    .replace(/\b(stupid|dumb|idiot)\b/gi, 'frustrating')
    .replace(/\b(worst)\b/gi, 'one of the most challenging')
    .replace(/\b(failed|failing|failure)\b/gi, 'struggling')
}

export function reduceRisk(text: string): string {
  return text
    .replace(/\broll\s*(no|number|#)?\s*\d+/gi, '[roll number redacted]')
    .replace(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, '[name redacted]')
    .replace(PROFANITY_PATTERNS[0], '****')
}

export function fixGrammar(text: string): string {
  let result = text.trim()
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }
  if (result.length > 0 && !result.match(/[.!?]$/)) {
    result += '.'
  }
  result = result.replace(/\s{2,}/g, ' ')
  result = result.replace(/\bi\b/g, 'I')
  return result
}

export function removeIdentifyingDetails(text: string): string {
  return text
    .replace(/\broll\s*(no|number|#)?\s*\d+/gi, '[student ID]')
    .replace(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, '[name]')
    .replace(/\b\d{10}\b/g, '[phone number]')
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[email]')
}

export function shortenText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const trimmed = text.slice(0, maxLen)
  const lastSentence = trimmed.lastIndexOf('.')
  if (lastSentence > maxLen * 0.6) {
    return trimmed.slice(0, lastSentence + 1)
  }
  return trimmed.trimEnd() + '...'
}
