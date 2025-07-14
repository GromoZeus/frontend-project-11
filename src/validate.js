import { string, setLocale } from 'yup'
import i18n from 'i18next'

export default (url, state) => {
  setLocale({
    string: {
      url: i18n.t('feedback.invalidUrl'),
    },
    mixed: {
      notOneOf: i18n.t('feedback.duplicateUrl'),
    },
  })

  state.RSSprocess.process.processState = 'processing'
  const schemaUrl = string()
    .url()
    .notOneOf(state.RSSprocess.feeds.map(item => item.url))

  return schemaUrl.validate(url)
    .then(() => {
      state.RSSprocess.process.feedbackMsg = ''
      return true
    })
    .catch((err) => {
      state.RSSprocess.process.feedbackMsg = err.message
      state.RSSprocess.process.processState = 'failed'
      return false
    })
}
