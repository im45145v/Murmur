import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SettingsModel } from '@/lib/models'
import { isApiResponse, requireAdmin, validationError } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'
import { SettingsPatchSchema } from '@/lib/server/validation'

const DEFAULT_SETTINGS = {
  key: 'global',
  pageBranding: 'Murmur',
  defaultCaptionSignoff: '- Murmur',
  moderationThreshold: 'Medium',
  maxCharacterLength: 1000,
  defaultTemplateByCategory: {
    Confession: 'scrapbook',
    Gossip: 'bold-card',
    Frustration: 'handwritten',
    'Horror Story / Weird Experiences': 'confession',
    'Good/Bad Experiences': 'journal',
    Advice: 'bold-card',
    Feedback: 'journal',
    Other: 'framed-note',
  },
  exportImageSize: 1080,
  watermarkEnabled: true,
  footerSignatureFormat: '- Murmur',
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

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
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const parsed = SettingsPatchSchema.safeParse(await request.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const settings = await SettingsModel.findOneAndUpdate(
      { key: 'global' },
      { $set: parsed.data },
      { new: true, upsert: true }
    ).lean()

    await recordAdminAction({
      adminId: admin.sub,
      action: 'edited',
      targetType: 'settings',
      targetId: 'global',
      newValue: JSON.stringify(parsed.data),
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('PATCH /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
