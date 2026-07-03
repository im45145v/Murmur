import { AdminActionModel } from '@/lib/models'
import type { AdminAction } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface AuditInput {
  adminId: string
  action: AdminAction['action']
  submissionId?: string
  previousValue?: string
  newValue?: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}

export async function recordAdminAction(input: AuditInput) {
  try {
    await AdminActionModel.create({
      id: generateId(),
      timestamp: new Date(),
      metadata: {},
      ...input,
    })
  } catch (error) {
    console.error('Failed to record admin action:', error)
  }
}
