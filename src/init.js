import { proxy, subscribe, snapshot } from 'valtio/vanilla'
import { string } from 'yup'

const form = document.querySelector('form')
const errSel = document.querySelector('.feedback')

const state = proxy({
  isValidUrl: true,
  feeds: [],
  errorMsg: '',
})

const validateUrl = (url) => {
  const schemaUrl = string()
    .url('Ссылка должна быть валидным URL')
    .test('no-duplicates', 'RSS уже существует', url => !state.feeds.includes(url))
  // .notOneOf(state.feeds, 'URL уже существует')

  return schemaUrl.validate(url)
    .then(() => {
      state.errorMsg = ''
      return true
    })
    .catch((err) => {
      state.errorMsg = err.message
      return false
    })
}

const init = (state) => {
  const updateUI = () => {
    const obj = snapshot(state)
    errSel.textContent = obj.errorMsg
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
        state.isValidUrl = isValue
      })
  })
}

export { state, init }
