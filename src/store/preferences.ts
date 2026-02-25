import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '../i18n/translations'

export type ThemePack = 'atlas' | 'terminal' | 'sunset'

const LEGACY_THEME_STORAGE_KEY = 'base64-tools-theme'
const LEGACY_LOCALE_STORAGE_KEY = 'base64-tools-locale'
const PREFERENCES_STORAGE_KEY = 'base64-tools-preferences'

function parseTheme(value: string | null): ThemePack {
  if (value === 'terminal') return 'terminal'
  if (value === 'sunset') return 'sunset'
  return 'atlas'
}

function parseLocale(value: string | null): Locale {
  if (value === 'ru') return 'ru'
  if (value === 'uk') return 'uk'
  return 'en'
}

function readInitialTheme(): ThemePack {
  if (typeof window === 'undefined') {
    return 'atlas'
  }

  return parseTheme(window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY))
}

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en'
  }

  return parseLocale(window.localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY))
}

interface PreferencesState {
  theme: ThemePack
  locale: Locale
  setTheme: (theme: ThemePack) => void
  setLocale: (locale: Locale) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: readInitialTheme(),
      locale: readInitialLocale(),
      setTheme: (theme) => {
        set({ theme })
      },
      setLocale: (locale) => {
        set({ locale })
      },
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme, locale: state.locale }),
    },
  ),
)
