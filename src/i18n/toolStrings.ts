import type { DecoderKind } from '../configs/decoders'
import type { EncoderKind } from '../configs/encoders'

type Translator = (key: string) => string

export function encoderLabel(kind: EncoderKind, t: Translator): string {
  return t(`encoder.mode.${kind}.label`)
}

export function encoderPlaceholder(kind: EncoderKind, t: Translator): string {
  return t(`encoder.mode.${kind}.placeholder`)
}

export function decoderLabel(kind: DecoderKind, t: Translator): string {
  return t(`decoder.mode.${kind}.label`)
}
