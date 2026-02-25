import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './translations'

if (!i18n.isInitialized) {
  void i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      keySeparator: false,
      returnNull: false,
    })
}

export default i18n
