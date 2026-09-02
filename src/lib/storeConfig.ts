import { prisma } from '@/lib/prisma'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

const SECRET_FALLBACK = 'pielfutbolera-fallback-encryption-secret-change-me-in-prod'
const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const passphrase = process.env.STORE_CONFIG_SECRET || SECRET_FALLBACK
  return scryptSync(passphrase, 'pielfutbolera-salt-v1', 32)
}

export function encryptSecret(plain: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`
}

export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, encHex] = payload.split(':')
  if (!ivHex || !tagHex || !encHex) throw new Error('Invalid encrypted payload')
  const key = getKey()
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  const dec = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()])
  return dec.toString('utf8')
}

export async function getStoreConfig(key: string): Promise<string | null> {
  const row = await prisma.storeConfig.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function getStoreConfigWithEnvFallback(
  key: string,
  envVarName: string
): Promise<string | null> {
  const db = await getStoreConfig(key)
  if (db) return db
  return process.env[envVarName] || null
}

export async function getMercadoPagoAccessToken(): Promise<string | null> {
  const encrypted = await getStoreConfig('mp_access_token_encrypted')
  if (encrypted) {
    try {
      return decryptSecret(encrypted)
    } catch (e) {
      console.error('❌ Failed to decrypt MP access token from DB:', e)
      return process.env.MP_ACCESS_TOKEN || null
    }
  }
  return process.env.MP_ACCESS_TOKEN || null
}

export async function getMercadoPagoPublicKey(): Promise<string | null> {
  const db = await getStoreConfig('mp_public_key')
  if (db) return db
  return process.env.MP_PUBLIC_KEY || null
}
