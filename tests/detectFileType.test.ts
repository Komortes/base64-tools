import assert from 'node:assert/strict'
import test from 'node:test'
import { detectFileType } from '../src/utils/detectFileType.js'

test('detectFileType prioritizes explicit MIME override', () => {
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
  const result = detectFileType(pngBytes, undefined, 'application/pdf')

  assert.equal(result.mime, 'application/pdf')
  assert.equal(result.extension, 'pdf')
  assert.equal(result.previewKind, 'pdf')
  assert.equal(result.source, 'override')
})

test('detectFileType prioritizes hinted MIME over magic signature', () => {
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
  const result = detectFileType(pngBytes, 'text/csv')

  assert.equal(result.mime, 'text/csv')
  assert.equal(result.extension, 'csv')
  assert.equal(result.previewKind, 'text')
  assert.equal(result.source, 'hint')
})

test('detectFileType detects known binary by magic signature', () => {
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0x00])
  const result = detectFileType(jpegBytes)

  assert.equal(result.mime, 'image/jpeg')
  assert.equal(result.extension, 'jpg')
  assert.equal(result.previewKind, 'image')
  assert.equal(result.source, 'magic')
})

test('detectFileType classifies printable payload as text', () => {
  const textBytes = new TextEncoder().encode('hello from tests')
  const result = detectFileType(textBytes)

  assert.equal(result.mime, 'text/plain;charset=utf-8')
  assert.equal(result.extension, 'txt')
  assert.equal(result.previewKind, 'text')
  assert.equal(result.source, 'text')
})

test('detectFileType falls back to octet-stream for unknown binary payloads', () => {
  const binaryBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04])
  const result = detectFileType(binaryBytes)

  assert.equal(result.mime, 'application/octet-stream')
  assert.equal(result.extension, 'bin')
  assert.equal(result.previewKind, 'none')
  assert.equal(result.source, 'fallback')
})
