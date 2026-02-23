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

test('detectMimeFromMagic detects additional image signatures', () => {
  assert.equal(detectMimeFromMagic(new Uint8Array([0xff, 0xd8, 0xff, 0x00])), 'image/jpeg')
  assert.equal(
    detectMimeFromMagic(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])),
    'image/gif',
  )
  assert.equal(
    detectMimeFromMagic(
      new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50,
      ]),
    ),
    'image/webp',
  )
})

test('detectMimeFromMagic detects archive and media signatures', () => {
  assert.equal(detectMimeFromMagic(new Uint8Array([0x50, 0x4b, 0x03, 0x04])), 'application/zip')
  assert.equal(
    detectMimeFromMagic(new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70])),
    'video/mp4',
  )
  assert.equal(detectMimeFromMagic(new Uint8Array([0x49, 0x44, 0x33, 0x04])), 'audio/mpeg')
  assert.equal(detectMimeFromMagic(new Uint8Array([0xff, 0xfb, 0x00, 0x00])), 'audio/mpeg')
  assert.equal(detectMimeFromMagic(new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0x00])), 'audio/ogg')
  assert.equal(
    detectMimeFromMagic(
      new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00,
        0x57, 0x41, 0x56, 0x45,
      ]),
    ),
    'audio/wav',
  )
  assert.equal(detectMimeFromMagic(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3])), 'video/webm')
})

test('detectMimeFromMagic detects JSON object/array signatures', () => {
  assert.equal(detectMimeFromMagic(new Uint8Array([0x7b, 0x22, 0x61, 0x22])), 'application/json')
  assert.equal(detectMimeFromMagic(new Uint8Array([0x5b, 0x7b, 0x22, 0x61])), 'application/json')
})

test('detectMimeFromMagic returns null for unknown data', () => {
  const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03])
  assert.equal(detectMimeFromMagic(bytes), null)
})
