import { createHash, createHmac } from 'crypto'
import { generateId } from '@/lib/utils'

interface R2UploadResult {
  assetUrl: string
  assetKey: string
  mimeType: string
  width: number
  height: number
  byteSize: number
  checksum: string
}

interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicBaseUrl: string
}

function getConfig(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    throw new Error('R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL.')
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicBaseUrl }
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest()
}

function sha256(value: Buffer | string) {
  return createHash('sha256').update(value).digest('hex')
}

function encodeKey(key: string) {
  return key.split('/').map((part) => encodeURIComponent(part)).join('/')
}

function isoAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function dateStamp(date: Date) {
  return isoAmzDate(date).slice(0, 8)
}

function parsePngDataUrl(imageDataUrl: string) {
  const match = imageDataUrl.match(/^data:(image\/png);base64,([a-zA-Z0-9+/=]+)$/)
  if (!match) {
    throw new Error('Only PNG data URLs are supported for Instagram exports.')
  }
  return {
    mimeType: match[1],
    body: Buffer.from(match[2], 'base64'),
  }
}

export function createPostAssetKey(submissionId: string) {
  return `posts/${submissionId}/${Date.now()}-${generateId()}.png`
}

export async function uploadPngDataUrlToR2(input: {
  imageDataUrl: string
  key: string
  width: number
  height: number
}): Promise<R2UploadResult> {
  const config = getConfig()
  const { mimeType, body } = parsePngDataUrl(input.imageDataUrl)
  const now = new Date()
  const amzDate = isoAmzDate(now)
  const stamp = dateStamp(now)
  const region = 'auto'
  const service = 's3'
  const host = `${config.accountId}.r2.cloudflarestorage.com`
  const canonicalUri = `/${config.bucketName}/${encodeKey(input.key)}`
  const payloadHash = sha256(body)

  const canonicalHeaders = [
    `content-type:${mimeType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    '',
  ].join('\n')
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${stamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n')

  const dateKey = hmac(`AWS4${config.secretAccessKey}`, stamp)
  const regionKey = hmac(dateKey, region)
  const serviceKey = hmac(regionKey, service)
  const signingKey = hmac(serviceKey, 'aws4_request')
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const uploadUrl = `https://${host}${canonicalUri}`
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': mimeType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body,
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`R2 upload failed (${response.status}): ${details}`)
  }

  const publicBase = config.publicBaseUrl.replace(/\/+$/g, '')
  return {
    assetUrl: `${publicBase}/${encodeKey(input.key)}`,
    assetKey: input.key,
    mimeType,
    width: input.width,
    height: input.height,
    byteSize: body.byteLength,
    checksum: payloadHash,
  }
}
