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

// setLocale({
//   string: {
//     url: i18n.t('feedback.invalidUrl'),
//   },
//   mixed: {
//     notOneOf: i18n.t('feedback.duplicateUrl'),
//   },
// })

const validateUrl = (url) => {
  setLocale({
    string: {
      url: i18n.t('feedback.invalidUrl'),
    },
    mixed: {
      notOneOf: i18n.t('feedback.duplicateUrl'),
    },
  })

  state.process.processState = 'processing'
  console.log(state.process.processState)
  const schemaUrl = string()
    .url()
    // .test('no-duplicates', url => !state.feeds.includes(url))
    .notOneOf(state.feeds.map(item => item.url))

  return schemaUrl.validate(url)
    .then(() => {
      state.process.feedbackMsg = ''
      return true
    })
    .catch((err) => {
      state.process.feedbackMsg = err.message
      state.process.processState = 'failed'
      return false
    })
}

const parseRSS = (dataRSS) => {
  // Извлекаем чистую base64 часть (если есть префикс data:...)
  const codedString = dataRSS.includes(',')
    ? dataRSS.split(',')[1]
    : dataRSS

  // Декодируем base64
  const decodedString = atob(codedString)

  // Парсим XML
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(decodedString, 'application/xml')

  const channel = xmlDoc.querySelector('channel')
  const title = channel.querySelector('title').textContent
  const items = xmlDoc.querySelectorAll('item')

  // Проверяем на ошибки парсинга
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    state.process.feedbackMsg = i18n.t('feedback.parserError')
    state.process.processState = 'failed'
    throw new Error(`XML parsing error: ${parserError.textContent}`)
  }

  return { title, items }
}

const updatePosts = (state) => {
  // Собираем промисы для всех RSS-лент
  const feedPromises = state.feeds.map(feedUrl =>
    axios.get(`https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(feedUrl.url)}`)
      .then((response) => {
        if (response.data.contents) {
          return parseRSS(response.data.contents)
        }
        throw new Error('Empty response contents')
      })
      .then(({ items }) => {
        const currentPosts = state.posts
        const postsLinks = currentPosts.map(post => post.link)
        console.log(state)

        items.forEach((item) => {
          const itemLink = item.querySelector('link').textContent
          if (!postsLinks.includes(itemLink)) {
            addPostToState(feedUrl.id, item, state.posts)
          }
        })
      })
      .catch((error) => {
        console.error(`Ошибка в RSS ${feedUrl.url}:`, error)
      }),
  )

  // Ждём завершения всех промисов, затем запускаем следующий цикл
  Promise.all(feedPromises)
    .finally(() =>
      setTimeout(() => updatePosts(state), 5000), // Следующая проверка через 5 сек
    )
}

const addPostToState = (feedID, itemXML, postsState) => {
  const postID = state.posts.length + 1
  const itemTitle = itemXML.querySelector('title').textContent
  const itemLink = itemXML.querySelector('link').textContent
  const itemDesc = itemXML.querySelector('description').textContent

  postsState.push({
    feedID: feedID,
    postID: postID,
    title: itemTitle,
    link: itemLink,
    description: itemDesc,
  })
}

// const addPostsState = (feedID, postXML, postsState) => {
//   postXML.forEach((item, index) => {
//     const itemTitle = item.querySelector('title').textContent
//     const itemLink = item.querySelector('link').textContent
//     const itemDesc = item.querySelector('description').textContent

//     postsState.push({ feedID: feedID, postID: index + 1, title: itemTitle, link: itemLink, description: itemDesc })
//   })
// }

// const form = document.querySelector('form')
// const feedbackSect = document.querySelector('.feedback')
// const button = document.querySelector('button')

const state = proxy({
  // process: {
  //   isValidUrl: true,
  //   feedbackMsg: '',
  // },
  feeds: [],
  posts: [],
  process: {
    processState: 'filling', // 'processing', 'failed', 'success'
    isValidUrl: true,
    feedbackMsg: '',
  },
})

const init = (state) => {
  // const updateUI = () => {
  //   const form = document.querySelector('form')
  //   const feedbackSect = document.querySelector('.feedback')
  //   const button = document.querySelector('button')

  //   const obj = snapshot(state)

  //   obj.process.isValidUrl
  //     ? form.elements.url.classList.remove('is-invalid')
  //     : form.elements.url.classList.add('is-invalid')
  //   feedbackSect.textContent = obj.process.feedbackMsg

  //   if (obj.process.processState === 'proccessing') {
  //     button.disabled = true
  //   }
  //   else {
  //     button.disabled = false
  //   }

  //   obj.process.processState === 'success'
  //     ? feedbackSect.classList.replace('text-danger', 'text-success')
  //     : feedbackSect.classList.replace('text-success', 'text-danger')

  //   if (obj.process.processState === 'success') {
  //     const postSection = document.querySelector('.posts')
  //     postSection.innerHTML = ''
  //     // Создаем основной div с классами card border-0
  //     const cardDiv = document.createElement('div')
  //     cardDiv.className = 'card border-0'

  //     // Создаем внутренний div с классом card-body
  //     const cardBody = document.createElement('div')
  //     cardBody.className = 'card-body'

  //     // Создаем заголовок h2 с классами card-title h4
  //     const cardTitle = document.createElement('h2')
  //     cardTitle.className = 'card-title h4'
  //     cardTitle.textContent = 'Посты'

  //     // Собираем структуру
  //     cardBody.appendChild(cardTitle)
  //     cardDiv.appendChild(cardBody)

  //     // Создаем элемент ul с классами list-group border-0 rounded-0
  //     const ulElement = document.createElement('ul')
  //     ulElement.className = 'list-group border-0 rounded-0'

  //     obj.posts.forEach((item) => {
  //       const liElement = document.createElement('li')
  //       liElement.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

  //       // Создаем элемент <a> с атрибутами
  //       const linkElement = document.createElement('a')
  //       linkElement.href = item.link
  //       linkElement.className = 'fw-bold'
  //       linkElement.setAttribute('data-id', item.postID)
  //       linkElement.setAttribute('target', '_blank')
  //       linkElement.setAttribute('rel', 'noopener noreferrer')
  //       linkElement.textContent = item.title

  //       // Создаем кнопку с атрибутами
  //       const buttonElement = document.createElement('button')
  //       buttonElement.type = 'button'
  //       buttonElement.className = 'btn btn-outline-primary btn-sm'
  //       buttonElement.setAttribute('data-id', item.postID)
  //       buttonElement.setAttribute('data-bs-toggle', 'modal')
  //       buttonElement.setAttribute('data-bs-target', '#modal')
  //       buttonElement.textContent = 'Просмотр'

  //       // Добавляем элементы в <li>
  //       liElement.appendChild(linkElement)
  //       liElement.appendChild(buttonElement)

  //       ulElement.appendChild(liElement)
  //     })

  //     cardDiv.appendChild(ulElement)
  //     postSection.appendChild(cardDiv)
  //   }

  //   if (obj.process.processState === 'success') {
  //     const feedSection = document.querySelector('.feeds')
  //     feedSection.innerHTML = ''
  //     // Создаем основной div с классами card border-0
  //     const cardDiv = document.createElement('div')
  //     cardDiv.className = 'card border-0'

  //     // Создаем внутренний div с классом card-body
  //     const cardBody = document.createElement('div')
  //     cardBody.className = 'card-body'

  //     // Создаем заголовок h2 с классами card-title h4
  //     const cardTitle = document.createElement('h2')
  //     cardTitle.className = 'card-title h4'
  //     cardTitle.textContent = 'Фиды'

  //     // Собираем структуру
  //     cardBody.appendChild(cardTitle)
  //     cardDiv.appendChild(cardBody)

  //     // Создаем основной элемент <ul> с классами
  //     const ulElement = document.createElement('ul')
  //     ulElement.className = 'list-group border-0 rounded-0'

  //     obj.feeds.forEach((item) => {
  //       // Создаем элемент <li> с классами
  //       const liElement = document.createElement('li')
  //       liElement.className = 'list-group-item border-0 border-end-0'

  //       // Создаем заголовок <h3> с классами и текстом
  //       const heading = document.createElement('h3')
  //       heading.className = 'h6 m-0'
  //       console.log(item.title)
  //       heading.textContent = item.title

  //       // Создаем параграф <p> с классами и текстом
  //       const paragraph = document.createElement('p')
  //       paragraph.className = 'm-0 small text-black-50'
  //       paragraph.textContent = 'This is a constantly updating lorem ipsum feed'

  //       // Добавляем элементы в структуру
  //       liElement.appendChild(heading)
  //       liElement.appendChild(paragraph)
  //       ulElement.appendChild(liElement)
  //     })

  //     cardDiv.appendChild(ulElement)
  //     feedSection.appendChild(cardDiv)
  //   }
  // }

  subscribe(state, () => updateUI(state))

  const form = document.querySelector('form')

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const inputArea = form.elements.url
    const url = inputArea.value.trim()
    validateUrl(url)
      .then((isValue) => {
        if (isValue) {
          // state.process.processState = 'processing'
          // state.feeds.push(url)
          const proxyUrl = `https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(url)}`
          axios.get(proxyUrl)
            .then((response) => {
              if (response.data.contents) {
                return parseRSS(response.data.contents)
              }
              state.process.feedbackMsg = i18n.t('feedback.emptyContents')
              state.process.processState = 'failed'
              throw new Error('Empty response contents')
            })
            // .then(({ title, items }) => {
            //   const feedID = state.feeds.length + 1
            //   state.feeds.push({ id: feedID, title: title, url: url })
            //   return { items, feedID }
            // })
            .then(({ items, title }) => {
              // Теперь можно извлекать данные из RSS
              // const channel = xmlDoc.querySelector('channel')
              // const title = channel.querySelector('title').textContent
              // const items = xmlDoc.querySelectorAll('item')

              // console.log('Заголовок канала:', title)
              const feedID = state.feeds.length + 1
              state.feeds.push({ id: feedID, title: title, url: url })
              // addPostsState(feedID, items, state.posts)
              // updatePosts(state)
              items.forEach(item => addPostToState(feedID, item, state.posts))
              // items.forEach((item, index) => {
              //   const itemTitle = item.querySelector('title').textContent
              //   const itemLink = item.querySelector('link').textContent
              //   const itemDesc = item.querySelector('description').textContent

              //   state.posts.push({ feedID: feedID, postID: index + 1, title: itemTitle, link: itemLink, description: itemDesc })
              // })

              state.process.processState = 'success'
              state.process.feedbackMsg = i18n.t('feedback.successLoadRSS')
              console.log(state.process.processState)
            })
            .catch((error) => {
              state.process.feedbackMsg = i18n.t('feedback.networkError')
              state.process.processState = 'failed'
              console.log(state.process.processState)
              console.error('Error:', error)
            })
          form.reset()
          inputArea.focus()
        }
        state.process.isValidUrl = isValue
      })
    // state.process.processState = 'filling'
    console.log(state.process.processState)
    console.log(state)
  })
  updatePosts(state)
}

export { state, init }
