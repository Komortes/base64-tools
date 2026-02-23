import assert from 'node:assert/strict'
import test from 'node:test'
import { extensionFromMime, previewKindFromMime, sanitizeMime } from '../src/utils/mimeMappings.js'

test('sanitizeMime trims and lowercases values', () => {
  assert.equal(sanitizeMime('  Text/Plain;Charset=UTF-8  '), 'text/plain;charset=utf-8')
})

test('previewKindFromMime resolves expected preview categories', () => {
  assert.equal(previewKindFromMime('image/png'), 'image')
  assert.equal(previewKindFromMime('application/pdf'), 'pdf')
  assert.equal(previewKindFromMime('video/mp4'), 'video')
  assert.equal(previewKindFromMime('audio/mpeg'), 'audio')
  assert.equal(previewKindFromMime('application/json'), 'text')
  assert.equal(previewKindFromMime('application/xml'), 'text')
  assert.equal(previewKindFromMime('text/plain'), 'text')
  assert.equal(previewKindFromMime('application/octet-stream'), 'none')
})

test('extensionFromMime resolves known mappings and fallbacks', () => {
  assert.equal(extensionFromMime('image/png'), 'png')
  assert.equal(extensionFromMime('image/jpeg'), 'jpg')
  assert.equal(extensionFromMime('image/gif'), 'gif')
  assert.equal(extensionFromMime('image/webp'), 'webp')
  assert.equal(extensionFromMime('application/pdf'), 'pdf')
  assert.equal(extensionFromMime('application/zip'), 'zip')
  assert.equal(extensionFromMime('application/json'), 'json')
  assert.equal(extensionFromMime('text/plain'), 'txt')
  assert.equal(extensionFromMime('text/csv'), 'csv')
  assert.equal(extensionFromMime('text/xml'), 'xml')
  assert.equal(extensionFromMime('application/xml'), 'xml')
  assert.equal(extensionFromMime('audio/mpeg'), 'mp3')
  assert.equal(extensionFromMime('audio/ogg'), 'ogg')
  assert.equal(extensionFromMime('audio/wav'), 'wav')
  assert.equal(extensionFromMime('video/mp4'), 'mp4')
  assert.equal(extensionFromMime('video/webm'), 'webm')
  assert.equal(extensionFromMime('application/x-custom'), 'x-custom')
  assert.equal(extensionFromMime('unknown'), 'bin')
})
