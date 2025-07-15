import { proxy, subscribe } from 'valtio/vanilla'
import axios from 'axios'
import i18n from 'i18next'
import content from './locales/content.js'
import updateUI from './view.js'
import validateUrl from './validate.js'
import parseRSS from './parser.js'

export default () => {
  i18n.init({
    lng: 'ru',
    resources: {
      ru: content,
    },
  })

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

  const updatePosts = () => {
    const feedPromises = state.RSSprocess.feeds.map(feedUrl =>
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feedUrl.url)}`)
        .then((response) => {
          if (response.data.contents) {
            return parseRSS(response.data.contents, state)
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
        setTimeout(() => updatePosts(), 5000),
      )
  }

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
    validateUrl(url, state)
      .then((isValue) => {
        if (isValue) {
          const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`
          axios.get(proxyUrl)
            .then((response) => {
              if (response.data.contents) {
                return parseRSS(response.data.contents, state)
              }
              state.RSSprocess.process.feedbackMsg = i18n.t('feedback.emptyContents')
              state.RSSprocess.process.processState = 'failed'
              throw new Error('Empty response contents')
            })
            .then(({ items, title }) => {
              const feedID = state.RSSprocess.feeds.length + 1
              state.RSSprocess.feeds.push({
                id: feedID,
                title: title,
                url: url,
              })
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
  updatePosts()
}
