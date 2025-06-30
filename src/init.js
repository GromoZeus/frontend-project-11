import { proxy, subscribe, snapshot } from 'valtio/vanilla'
import { string, setLocale } from 'yup'
import i18n from 'i18next'
import content from './locales/content.js'

i18n.init({
  lng: 'ru',
  resources: {
    ru: content,
  },
})

setLocale({
  string: {
    url: i18n.t('feedback.invalidUrl'),
  },
  mixed: {
    notOneOf: i18n.t('feedback.duplicateUrl'),
  },
})

const form = document.querySelector('form')
const errSect = document.querySelector('.feedback')

const state = proxy({
  linkForm: {
    isValidUrl: true,
    feedbackMsg: '',
  },
  feeds: [],
})

const validateUrl = (url) => {
  const schemaUrl = string()
    .url()
    // .test('no-duplicates', url => !state.feeds.includes(url))
    .notOneOf(state.feeds)

  return schemaUrl.validate(url)
    .then(() => {
      state.linkForm.feedbackMsg = ''
      return true
    })
    .catch((err) => {
      state.linkForm.feedbackMsg = err.message
      return false
    })
}

const init = (state) => {
  const updateUI = () => {
    const obj = snapshot(state)
    errSect.textContent = obj.linkForm.feedbackMsg
  }

  subscribe(state, updateUI)

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const inputValueForm = form.elements.url

    validateUrl(inputValueForm.value)
      .then((isValue) => {
        if (isValue) {
          state.feeds.push(inputValueForm.value)
          form.reset()
          inputValueForm.focus()
        }
        state.linkForm.isValidUrl = isValue
      })
  })
}

export { state, init }
