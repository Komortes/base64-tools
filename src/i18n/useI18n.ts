import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePreferencesStore } from '../store/preferences'
import './init'
import i18n from './init'
import type { TranslationParams } from './translations'

export function useI18n() {
  const locale = usePreferencesStore((state) => state.locale)
  const setLocale = usePreferencesStore((state) => state.setLocale)
  const { t: translate } = useTranslation()

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }

    document.documentElement.lang = locale
  }, [locale])

  const t = useMemo(
    () => (key: string, params?: TranslationParams) => translate(key, params) as string,
    [translate],
  )

  return {
    locale,
    setLocale,
    t,
  }
}
