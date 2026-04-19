import type { Submission, CaptionSuggestion } from './types'
import { generateId } from './utils'

const signoffs = ['— Murmur', '✨ Murmur', '// Murmur', '~ Murmur']

function randomSignoff() {
  return signoffs[Math.floor(Math.random() * signoffs.length)]
}

const categoryHashtags: Record<string, string[]> = {
  Confession: ['#confession', '#murmur', '#anonymous'],
  Gossip: ['#campusgossip', '#murmur', '#teabreak'],
  Frustration: ['#relatable', '#campuslife', '#frustrated'],
  'Horror Story / Weird Experiences': ['#campushorror', '#weirdstuff', '#murmur'],
  'Good/Bad Experiences': ['#campuslife', '#experience', '#murmur'],
  Advice: ['#advice', '#campuswisdom', '#murmur'],
  Feedback: ['#feedback', '#campuslife', '#murmur'],
  Other: ['#murmur', '#anonymous', '#campuslife'],
}

export function generateCaptions(submission: Submission): CaptionSuggestion[] {
  const now = new Date()
  const tags = (categoryHashtags[submission.category] ?? ['#murmur']).join(' ')
  const { category, targetProgram, targetBatch } = submission

  const captions: CaptionSuggestion[] = [
    {
      id: generateId(),
      submissionId: submission.id,
      style: 'soft_reflective',
      text: buildSoftReflective(submission.bodyText, category, tags, randomSignoff()),
      generatedAt: now,
    },
    {
      id: generateId(),
      submissionId: submission.id,
      style: 'neutral_admin_safe',
      text: buildNeutralAdminSafe(submission.bodyText, category, targetProgram, targetBatch, tags, randomSignoff()),
      generatedAt: now,
    },
    {
      id: generateId(),
      submissionId: submission.id,
      style: 'page_brand_voice',
      text: buildBrandVoice(submission.bodyText, category, tags, randomSignoff()),
      generatedAt: now,
    },
  ]

  return captions
}

function buildSoftReflective(_body: string, category: string, tags: string, signoff: string): string {
  const intros: Record<string, string> = {
    Confession: "We all carry things we wish we'd said differently. Here's one that reached us.",
    Gossip: "The campus whispers sometimes say what no one dares to say out loud.",
    Frustration: "Sometimes all you need is for someone to acknowledge — we feel this too.",
    'Horror Story / Weird Experiences': "Campus life has a way of surprising you when you least expect it.",
    'Good/Bad Experiences': "Every experience shapes us. Here's one story that might resonate with you.",
    Advice: "A little wisdom from someone who's been there. We hope this reaches who needs it.",
    Feedback: "Honest words can change things. This one's worth reading.",
    Other: "Some things just need to be said — and this is one of them.",
  }
  const intro = intros[category] ?? intros['Other']
  void _body
  return `${intro}\n\n${tags}\n\n${signoff}`
}

function buildNeutralAdminSafe(_body: string, category: string, program: string, batch: string, tags: string, signoff: string): string {
  return `Anonymous submission received — ${category} | ${program} ${batch}.\n\nShared with consent for community awareness.\n\n${tags}\n\n${signoff}`
}

function buildBrandVoice(_body: string, category: string, tags: string, signoff: string): string {
  const intros: Record<string, string> = {
    Confession: "Okay but this one sent us 👀 the audacity... the AUDACITY.",
    Gossip: "No because WHY is campus like this 😭 we don't make the rules, we just report them.",
    Frustration: "Felt this in my entire soul. If this hits different, you know what to do 👇",
    'Horror Story / Weird Experiences': "Campus said choose violence today apparently 💀 read this at your own risk.",
    'Good/Bad Experiences': "We felt every word of this 🥺 drop a ❤️ if you've been here.",
    Advice: "Free game, no cap 🧠 screenshot this before it disappears.",
    Feedback: "Someone said what we were all thinking and honestly? Respect.",
    Other: "This just landed in our DMs and we had to share 👀 no context needed.",
  }
  const intro = intros[category] ?? intros['Other']
  void _body
  return `${intro}\n\n${tags}\n\n${signoff}`
}
