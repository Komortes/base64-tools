import { createContext } from 'react'
import { translate, type Locale, type TranslationParams } from './translations'

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: TranslationParams) => string
}

const defaultContextValue: I18nContextValue = {
  locale: 'en',
  setLocale: () => {},
  t: (key, params) => translate('en', key, params),
}

export const I18nContext = createContext<I18nContextValue>(defaultContextValue)
