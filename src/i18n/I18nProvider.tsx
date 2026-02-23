import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext } from './context'
import { translate, type Locale, type TranslationParams } from './translations'

const LOCALE_STORAGE_KEY = 'base64-tools-locale'

function parseLocale(value: string | null): Locale {
  if (value === 'ru') return 'ru'
  if (value === 'uk') return 'uk'
  return 'en'
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') {
      return 'en'
    }

    return parseLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
  })

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  const t = useCallback(
    (key: string, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, t],
  )

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
