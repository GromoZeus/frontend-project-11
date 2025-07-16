// Модуль для обновления пользовательского интерфейса на основе состояния приложения.

import { snapshot } from 'valtio/vanilla'

const renderPosts = (obj) => {
  const postSection = document.querySelector('.posts')
  postSection.innerHTML = ''
  const cardDiv = document.createElement('div')
  cardDiv.className = 'card border-0'

  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'

  const cardTitle = document.createElement('h2')
  cardTitle.className = 'card-title h4'
  cardTitle.textContent = 'Посты'

  cardBody.appendChild(cardTitle)
  cardDiv.appendChild(cardBody)

  const ulElement = document.createElement('ul')
  ulElement.className = 'list-group border-0 rounded-0'

  obj.RSSprocess.posts.forEach((item) => {
    const liElement = document.createElement('li')
    liElement.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

    const linkElement = document.createElement('a')
    linkElement.href = item.link
    linkElement.className = obj.readPostsID.includes(item.postID) ? 'fw-normal link-secondary' : 'fw-bold'
    linkElement.setAttribute('data-id', item.postID)
    linkElement.setAttribute('target', '_blank')
    linkElement.setAttribute('rel', 'noopener noreferrer')
    linkElement.textContent = item.title

    const buttonElement = document.createElement('button')
    buttonElement.type = 'button'
    buttonElement.className = 'btn btn-outline-primary btn-sm'
    buttonElement.setAttribute('data-id', item.postID)
    buttonElement.setAttribute('data-bs-toggle', 'modal')
    buttonElement.setAttribute('data-bs-target', '#modal')
    buttonElement.textContent = 'Просмотр'

    liElement.appendChild(linkElement)
    liElement.appendChild(buttonElement)

    ulElement.prepend(liElement)
  })

  cardDiv.appendChild(ulElement)
  postSection.appendChild(cardDiv)
}

const renderFeeds = (obj) => {
  const feedSection = document.querySelector('.feeds')
  feedSection.innerHTML = ''
  const cardDiv = document.createElement('div')
  cardDiv.className = 'card border-0'

  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'

  const cardTitle = document.createElement('h2')
  cardTitle.className = 'card-title h4'
  cardTitle.textContent = 'Фиды'

  cardBody.appendChild(cardTitle)
  cardDiv.appendChild(cardBody)

  const ulElement = document.createElement('ul')
  ulElement.className = 'list-group border-0 rounded-0'

  obj.RSSprocess.feeds.forEach((item) => {
    const liElement = document.createElement('li')
    liElement.className = 'list-group-item border-0 border-end-0'

    const heading = document.createElement('h3')
    heading.className = 'h6 m-0'
    heading.textContent = item.title

    const paragraph = document.createElement('p')
    paragraph.className = 'm-0 small text-black-50'
    paragraph.textContent = item.description

    liElement.appendChild(heading)
    liElement.appendChild(paragraph)
    ulElement.appendChild(liElement)
  })

  cardDiv.appendChild(ulElement)
  feedSection.appendChild(cardDiv)
}

export default (state) => {
  const form = document.querySelector('form')
  const feedbackSect = document.querySelector('.feedback')
  const button = document.querySelector('button[type="submit"]')

  const obj = snapshot(state)

  if (obj.RSSprocess.process.isValidUrl) {
    form.elements.url.classList.remove('is-invalid')
  }
  else {
    form.elements.url.classList.add('is-invalid')
  }

  if (obj.RSSprocess.process.processState === 'processing') {
    button.disabled = true
  }
  else {
    button.disabled = false
  }

  if (obj.RSSprocess.process.processState === 'success') {
    feedbackSect.classList.replace('text-danger', 'text-success')
  }
  else if (obj.RSSprocess.process.processState === 'failed') {
    feedbackSect.classList.replace('text-success', 'text-danger')
  }

  if (obj.RSSprocess.process.contentUploaded) {
    renderPosts(obj)
    renderFeeds(obj)
  }

  feedbackSect.textContent = obj.RSSprocess.process.feedbackMsg

  const modal = document.getElementById('modal')

  modal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget
    const recipient = button.getAttribute('data-id')
    const modalTitle = modal.querySelector('.modal-title')
    const modalBodyInput = modal.querySelector('.modal-body')
    const recipientInt = parseInt(recipient)
    const post = obj.RSSprocess.posts.find(item => item.postID === recipientInt)

    modalTitle.textContent = post?.title
    modalBodyInput.textContent = post?.description

    if (!state.readPostsID.includes(recipientInt)) {
      state.readPostsID.push(recipientInt)
    }
  })
}
