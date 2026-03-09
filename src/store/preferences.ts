import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '../i18n/translations'

export type ThemePack = 'atlas' | 'terminal' | 'sunset'

const LEGACY_THEME_STORAGE_KEY = 'base64-tools-theme'
const LEGACY_LOCALE_STORAGE_KEY = 'base64-tools-locale'
const PREFERENCES_STORAGE_KEY = 'base64-tools-preferences'
const PREFERENCES_STORAGE_VERSION = 0

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

interface PersistedPreferencesSnapshot {
  state?: {
    theme?: string
    locale?: string
  }
}

function seedPersistedPreferencesFromLegacy(): void {
  if (typeof window === 'undefined') {
    return
  }

  const existingPreferences = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
  if (existingPreferences) {
    return
  }

  const legacyTheme = window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
  const legacyLocale = window.localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY)

  if (legacyTheme === null && legacyLocale === null) {
    return
  }

  window.localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify({
      state: {
        theme: parseTheme(legacyTheme),
        locale: parseLocale(legacyLocale),
      },
      version: PREFERENCES_STORAGE_VERSION,
    }),
  )
  window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY)
  window.localStorage.removeItem(LEGACY_LOCALE_STORAGE_KEY)
}

function readPersistedPreferences(): PersistedPreferencesSnapshot['state'] | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PersistedPreferencesSnapshot
    return parsed.state ?? null
  } catch {
    return null
  }
}

function readInitialTheme(): ThemePack {
  seedPersistedPreferencesFromLegacy()
  return parseTheme(readPersistedPreferences()?.theme ?? null)
}

function readInitialLocale(): Locale {
  seedPersistedPreferencesFromLegacy()
  return parseLocale(readPersistedPreferences()?.locale ?? null)
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
