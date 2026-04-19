import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SettingsModel } from '@/lib/models'

const DEFAULT_SETTINGS = {
  key: 'global',
  pageBranding: 'Murmur',
  defaultCaptionSignoff: '— Murmur',
  moderationThreshold: 'Medium',
  maxCharacterLength: 1000,
  defaultTemplateByCategory: {
    'Confession': 'scrapbook',
    'Gossip': 'bold-card',
    'Frustration': 'handwritten',
    'Horror Story / Weird Experiences': 'confession',
    'Good/Bad Experiences': 'journal',
    'Advice': 'bold-card',
    'Feedback': 'journal',
    'Other': 'framed-note',
  },
  exportImageSize: 1080,
  watermarkEnabled: true,
  footerSignatureFormat: '— Murmur',
}

export async function GET() {
  try {
    await connectDB()
    let settings = await SettingsModel.findOne({ key: 'global' }).lean()
    if (!settings) {
      const created = await SettingsModel.create(DEFAULT_SETTINGS)
      settings = created.toObject()
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB()
    const updates = await request.json()

    const settings = await SettingsModel.findOneAndUpdate(
      { key: 'global' },
      { $set: updates },
      { new: true, upsert: true }
    ).lean()

    return NextResponse.json(settings)
  } catch (error) {
    console.error('PATCH /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
