import assert from 'node:assert/strict'
import test from 'node:test'
import { detectMimeFromMagic } from '../src/utils/mimeSignatures.js'

test('detectMimeFromMagic detects PNG signature', () => {
  const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00])
  assert.equal(detectMimeFromMagic(bytes), 'image/png')
})

test('detectMimeFromMagic detects PDF signature', () => {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])
  assert.equal(detectMimeFromMagic(bytes), 'application/pdf')
})

test('detectMimeFromMagic returns null for unknown data', () => {
  const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03])
  assert.equal(detectMimeFromMagic(bytes), null)
})
