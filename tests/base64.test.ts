import assert from 'node:assert/strict'
import test from 'node:test'
import {
  blobToBase64,
  base64ToBytes,
  bytesToBase64,
  decodeBase64ToText,
  encodeTextToBase64,
  normalizeBase64Input,
  toUrlSafeBase64,
  validateBase64,
  withPadding,
  withoutPadding,
} from '../src/utils/base64.js'

test('bytesToBase64 and base64ToBytes perform round-trip', () => {
  const source = new Uint8Array([0, 1, 2, 127, 255])
  const encoded = bytesToBase64(source)
  const decoded = base64ToBytes(encoded)

  assert.deepEqual(Array.from(decoded), Array.from(source))
})

test('encodeTextToBase64 and decodeBase64ToText handle UTF-8 text', () => {
  const source = 'Hello, Привіт'
  const encoded = encodeTextToBase64(source)
  const decoded = decodeBase64ToText(encoded)

  assert.equal(decoded, source)
})

test('normalizeBase64Input normalizes url-safe chars and adds padding', () => {
  const normalized = normalizeBase64Input('SGV sbG8_', {
    stripWhitespace: true,
    normalizeUrlSafe: true,
    addPadding: true,
  })

  assert.equal(normalized, 'SGVsbG8/')
})

test('toUrlSafeBase64 and padding helpers transform output as expected', () => {
  assert.equal(toUrlSafeBase64('ab+/=='), 'ab-_')
  assert.equal(withPadding('YQ'), 'YQ==')
  assert.equal(withoutPadding('YQ=='), 'YQ')
})

test('validateBase64 returns warnings for stripped whitespace', () => {
  const result = validateBase64('SGV sbG8=', true)

  assert.equal(result.isValid, true)
  assert.equal(result.format, 'standard')
  assert.ok(result.warnings.some((warning) => warning.includes('Whitespace was ignored')))
})

test('validateBase64 marks invalid alphabet and mixed format', () => {
  const invalidChars = validateBase64('abc$', true)
  const mixedAlphabet = validateBase64('ab-c/', true)

  assert.equal(invalidChars.isValid, false)
  assert.ok(invalidChars.errors.some((error) => error.includes('non-Base64 characters')))
  assert.equal(mixedAlphabet.isValid, false)
  assert.ok(mixedAlphabet.errors.some((error) => error.includes('mixes standard and URL-safe')))
})

test('bytesToBase64 handles large payloads with chunking', () => {
  const source = new Uint8Array(200_123)
  for (let i = 0; i < source.length; i += 1) {
    source[i] = i % 256
  }

  const encoded = bytesToBase64(source)
  const expected = Buffer.from(source).toString('base64')
  assert.equal(encoded, expected)
})

test('blobToBase64 streams blob chunks without loading full payload at once', async () => {
  const source = new Uint8Array(180_007)
  for (let i = 0; i < source.length; i += 1) {
    source[i] = (255 - i) % 256
  }

  const blob = new Blob([source])
  const encoded = await blobToBase64(blob, { readChunkSize: 32 * 1024 })
  const expected = Buffer.from(source).toString('base64')

  assert.equal(encoded, expected)
})
