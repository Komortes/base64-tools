import assert from 'node:assert/strict'
import test from 'node:test'
import {
  decodeDataUrlTextPayload,
  extractPayload,
  parseDataUrl,
} from '../src/utils/dataUrl.js'

test('parseDataUrl parses metadata, parameters and base64 flag', () => {
  const parsed = parseDataUrl('data:text/plain;charset=utf-8;base64,SGVsbG8=')

  assert.ok(parsed)
  assert.equal(parsed.mime, 'text/plain;charset=utf-8')
  assert.equal(parsed.isBase64, true)
  assert.deepEqual(parsed.parameters, ['text/plain', 'charset=utf-8'])
  assert.equal(parsed.payload, 'SGVsbG8=')
})

test('parseDataUrl uses default MIME for empty metadata', () => {
  const parsed = parseDataUrl('data:,hello')

  assert.ok(parsed)
  assert.equal(parsed.mime, 'text/plain;charset=US-ASCII')
  assert.equal(parsed.isBase64, false)
  assert.deepEqual(parsed.parameters, [])
  assert.equal(parsed.payload, 'hello')
})

test('parseDataUrl returns null for non-data URL', () => {
  assert.equal(parseDataUrl('https://example.com'), null)
})

test('decodeDataUrlTextPayload decodes URL-encoded payload', () => {
  assert.equal(decodeDataUrlTextPayload('hello%20world%2B1'), 'hello world+1')
})

test('extractPayload handles data URLs and plain base64 input', () => {
  const extractedDataUrl = extractPayload('data:text/plain,hello%20world')
  const extractedBase64 = extractPayload('SGVsbG8=')

  assert.deepEqual(extractedDataUrl, {
    payload: 'hello%20world',
    mime: 'text/plain',
    isBase64: false,
    isDataUrl: true,
  })

  assert.deepEqual(extractedBase64, {
    payload: 'SGVsbG8=',
    isBase64: true,
    isDataUrl: false,
  })
})
