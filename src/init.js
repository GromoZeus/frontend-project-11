import { proxy, subscribe } from 'valtio/vanilla'
import { string, setLocale } from 'yup'
import axios from 'axios'
import i18n from 'i18next'
import content from './locales/content.js'
import updateUI from './view.js'

i18n.init({
  lng: 'ru',
  resources: {
    ru: content,
  },
})

const validateUrl = (url) => {
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

const parseRSS = (dataRSS) => {
  try {
    const codedString = dataRSS.includes(',')
      ? dataRSS.split(',')[1]
      : dataRSS

    const decodedString = atob(codedString)

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(decodedString, 'application/xml')

    const channel = xmlDoc.querySelector('channel')
    const title = channel.querySelector('title').textContent
    const items = xmlDoc.querySelectorAll('item')

    return { title, items }
  }
  catch (parserError) {
    state.RSSprocess.process.feedbackMsg = i18n.t('feedback.parserError')
    state.RSSprocess.process.processState = 'failed'
    throw new Error(`XML parsing error: ${parserError.textContent}`)
  }
}

const updatePosts = (state) => {
  const feedPromises = state.RSSprocess.feeds.map(feedUrl =>
    axios.get(`https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(feedUrl.url)}`)
      .then((response) => {
        if (response.data.contents) {
          return parseRSS(response.data.contents)
        }
        throw new Error('Empty response contents')
      })
      .then(({ items }) => {
        addPostToState(feedUrl.id, items, state.RSSprocess.posts)
      })
      .catch((error) => {
        console.error(`Ошибка в RSS ${feedUrl.url}:`, error)
      }),
  )

  Promise.all(feedPromises)
    .finally(() =>
      setTimeout(() => updatePosts(state), 5000),
    )
}
const addPostToState = (feedID, itemsXML, postsState) => {
  itemsXML.forEach((item) => {
    const currentPosts = state.RSSprocess.posts
    const postsLinks = currentPosts.map(post => post.link)
    const itemLink = item.querySelector('link').textContent
    if (!postsLinks.includes(itemLink)) {
      const postID = state.RSSprocess.posts.length + 1
      const itemTitle = item.querySelector('title').textContent
      const itemLink = item.querySelector('link').textContent
      const itemDesc = item.querySelector('description').textContent

      postsState.push({
        feedID: feedID,
        postID: postID,
        title: itemTitle,
        link: itemLink,
        description: itemDesc,
      })
    }
  })
}

const state = proxy({
  RSSprocess: {
    feeds: [],
    posts: [],
    process: {
      processState: 'filling', // 'processing', 'failed', 'success'
      contentUploaded: false,
      isValidUrl: true,
      feedbackMsg: '',
    },
  },
  readPostsID: [],
})

const init = (state) => {
  subscribe(state, () => updateUI(state))

  const form = document.querySelector('form')

  form.elements.url.addEventListener('focus', () => {
    if (state.RSSprocess.process.processState !== 'processing') {
      state.RSSprocess.process.processState = 'filling'
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const inputArea = form.elements.url
    const url = inputArea.value.trim()
    validateUrl(url)
      .then((isValue) => {
        if (isValue) {
          const proxyUrl = `https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(url)}`
          axios.get(proxyUrl)
            .then((response) => {
              if (response.data.contents) {
                return parseRSS(response.data.contents)
              }
              state.RSSprocess.process.feedbackMsg = i18n.t('feedback.emptyContents')
              state.RSSprocess.process.processState = 'failed'
              throw new Error('Empty response contents')
            })
            .then(({ items, title }) => {
              const feedID = state.RSSprocess.feeds.length + 1
              state.RSSprocess.feeds.push({ id: feedID, title: title, url: url })
              addPostToState(feedID, items, state.RSSprocess.posts)

              state.RSSprocess.process.processState = 'success'
              state.RSSprocess.process.contentUploaded = true
              state.RSSprocess.process.feedbackMsg = i18n.t('feedback.successLoadRSS')
            })
            .catch((error) => {
              if (error.response || error.request) {
                state.RSSprocess.process.feedbackMsg = i18n.t('feedback.networkError')
              }
              state.RSSprocess.process.processState = 'failed'
              console.error('Error:', error)
            })
            .finally(() =>
              state.RSSprocess.process.processState = 'filling',
            )
          form.reset()
          inputArea.focus()
        }

        state.RSSprocess.process.isValidUrl = isValue
      })
  })
  updatePosts(state)
}
export { state, init }
