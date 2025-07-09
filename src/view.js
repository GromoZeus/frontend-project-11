import { snapshot } from 'valtio/vanilla'

const renderPosts = (obj) => {
  const postSection = document.querySelector('.posts')
  postSection.innerHTML = ''
  // Создаем основной div с классами card border-0
  const cardDiv = document.createElement('div')
  cardDiv.className = 'card border-0'

  // Создаем внутренний div с классом card-body
  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'

  // Создаем заголовок h2 с классами card-title h4
  const cardTitle = document.createElement('h2')
  cardTitle.className = 'card-title h4'
  cardTitle.textContent = 'Посты'

  // Собираем структуру
  cardBody.appendChild(cardTitle)
  cardDiv.appendChild(cardBody)

  // Создаем элемент ul с классами list-group border-0 rounded-0
  const ulElement = document.createElement('ul')
  ulElement.className = 'list-group border-0 rounded-0'

  obj.posts.forEach((item) => {
    const liElement = document.createElement('li')
    liElement.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

    // Создаем элемент <a> с атрибутами
    const linkElement = document.createElement('a')
    linkElement.href = item.link
    linkElement.className = obj.readPostsID.includes(item.postID) ? 'fw-normal, link-secondary' : 'fw-bold'
    linkElement.setAttribute('data-id', item.postID)
    linkElement.setAttribute('target', '_blank')
    linkElement.setAttribute('rel', 'noopener noreferrer')
    linkElement.textContent = item.title

    // Создаем кнопку с атрибутами
    const buttonElement = document.createElement('button')
    buttonElement.type = 'button'
    buttonElement.className = 'btn btn-outline-primary btn-sm'
    buttonElement.setAttribute('data-id', item.postID)
    buttonElement.setAttribute('data-bs-toggle', 'modal')
    buttonElement.setAttribute('data-bs-target', '#modal')
    buttonElement.textContent = 'Просмотр'

    // Добавляем элементы в <li>
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
  // Создаем основной div с классами card border-0
  const cardDiv = document.createElement('div')
  cardDiv.className = 'card border-0'

  // Создаем внутренний div с классом card-body
  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'

  // Создаем заголовок h2 с классами card-title h4
  const cardTitle = document.createElement('h2')
  cardTitle.className = 'card-title h4'
  cardTitle.textContent = 'Фиды'

  // Собираем структуру
  cardBody.appendChild(cardTitle)
  cardDiv.appendChild(cardBody)

  // Создаем основной элемент <ul> с классами
  const ulElement = document.createElement('ul')
  ulElement.className = 'list-group border-0 rounded-0'

  obj.feeds.forEach((item) => {
    // Создаем элемент <li> с классами
    const liElement = document.createElement('li')
    liElement.className = 'list-group-item border-0 border-end-0'

    // Создаем заголовок <h3> с классами и текстом
    const heading = document.createElement('h3')
    heading.className = 'h6 m-0'
    console.log(item.title)
    heading.textContent = item.title

    // Создаем параграф <p> с классами и текстом
    const paragraph = document.createElement('p')
    paragraph.className = 'm-0 small text-black-50'
    paragraph.textContent = 'This is a constantly updating lorem ipsum feed'

    // Добавляем элементы в структуру
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

  if (obj.process.isValidUrl) {
    form.elements.url.classList.remove('is-invalid')
  }
  else {
    form.elements.url.classList.add('is-invalid')
  }

  // obj.process.isValidUrl
  //   ? form.elements.url.classList.remove('is-invalid')
  //   : form.elements.url.classList.add('is-invalid')
  // feedbackSect.textContent = obj.process.feedbackMsg

  if (obj.process.processState === 'processing') {
    button.disabled = true
  }
  else {
    button.disabled = false
  }

  // obj.process.processState === 'success'
  //   ? feedbackSect.classList.replace('text-danger', 'text-success')
  //   : feedbackSect.classList.replace('text-success', 'text-danger')

  if (obj.process.processState === 'success') {
    feedbackSect.classList.replace('text-danger', 'text-success')
    renderPosts(obj)
    renderFeeds(obj)
    // const postSection = document.querySelector('.posts')
    // postSection.innerHTML = ''
    // // Создаем основной div с классами card border-0
    // const cardDiv = document.createElement('div')
    // cardDiv.className = 'card border-0'

    // // Создаем внутренний div с классом card-body
    // const cardBody = document.createElement('div')
    // cardBody.className = 'card-body'

    // // Создаем заголовок h2 с классами card-title h4
    // const cardTitle = document.createElement('h2')
    // cardTitle.className = 'card-title h4'
    // cardTitle.textContent = 'Посты'

    // // Собираем структуру
    // cardBody.appendChild(cardTitle)
    // cardDiv.appendChild(cardBody)

    // // Создаем элемент ul с классами list-group border-0 rounded-0
    // const ulElement = document.createElement('ul')
    // ulElement.className = 'list-group border-0 rounded-0'

    // obj.posts.forEach((item) => {
    //   const liElement = document.createElement('li')
    //   liElement.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

    //   // Создаем элемент <a> с атрибутами
    //   const linkElement = document.createElement('a')
    //   linkElement.href = item.link
    //   linkElement.className = 'fw-bold'
    //   linkElement.setAttribute('data-id', item.postID)
    //   linkElement.setAttribute('target', '_blank')
    //   linkElement.setAttribute('rel', 'noopener noreferrer')
    //   linkElement.textContent = item.title

    //   // Создаем кнопку с атрибутами
    //   const buttonElement = document.createElement('button')
    //   buttonElement.type = 'button'
    //   buttonElement.className = 'btn btn-outline-primary btn-sm'
    //   buttonElement.setAttribute('data-id', item.postID)
    //   buttonElement.setAttribute('data-bs-toggle', 'modal')
    //   buttonElement.setAttribute('data-bs-target', '#modal')
    //   buttonElement.textContent = 'Просмотр'

    //   // Добавляем элементы в <li>
    //   liElement.appendChild(linkElement)
    //   liElement.appendChild(buttonElement)

    //   ulElement.appendChild(liElement)
    // })

    // cardDiv.appendChild(ulElement)
    // postSection.appendChild(cardDiv)
  }
  else if (obj.process.processState === 'failed') {
    feedbackSect.classList.replace('text-success', 'text-danger')
  }

  feedbackSect.textContent = obj.process.feedbackMsg

  const modal = document.getElementById('modal')

  modal.addEventListener('show.bs.modal', (event) => {
    // Button that triggered the modal
    const button = event.relatedTarget
    // Extract info from data-bs-* attributes
    const recipient = button.getAttribute('data-id')
    // If necessary, you could initiate an AJAX request here
    // and then do the updating in a callback.
    //
    // Update the modal's content.
    const modalTitle = modal.querySelector('.modal-title')
    const modalBodyInput = modal.querySelector('.modal-body')
    const post = obj.posts.find(item => item.postID === parseInt(recipient))

    modalTitle.textContent = post?.title
    modalBodyInput.textContent = post?.description

    if (!state.readPostsID.includes(parseInt(recipient))) {
      state.readPostsID.push(parseInt(recipient))
    }
  })

  // if (obj.process.processState === 'success') {
  // const feedSection = document.querySelector('.feeds')
  // feedSection.innerHTML = ''
  // // Создаем основной div с классами card border-0
  // const cardDiv = document.createElement('div')
  // cardDiv.className = 'card border-0'

  // // Создаем внутренний div с классом card-body
  // const cardBody = document.createElement('div')
  // cardBody.className = 'card-body'

  // // Создаем заголовок h2 с классами card-title h4
  // const cardTitle = document.createElement('h2')
  // cardTitle.className = 'card-title h4'
  // cardTitle.textContent = 'Фиды'

  // // Собираем структуру
  // cardBody.appendChild(cardTitle)
  // cardDiv.appendChild(cardBody)

  // // Создаем основной элемент <ul> с классами
  // const ulElement = document.createElement('ul')
  // ulElement.className = 'list-group border-0 rounded-0'

  // obj.feeds.forEach((item) => {
  //   // Создаем элемент <li> с классами
  //   const liElement = document.createElement('li')
  //   liElement.className = 'list-group-item border-0 border-end-0'

  //   // Создаем заголовок <h3> с классами и текстом
  //   const heading = document.createElement('h3')
  //   heading.className = 'h6 m-0'
  //   console.log(item.title)
  //   heading.textContent = item.title

  //   // Создаем параграф <p> с классами и текстом
  //   const paragraph = document.createElement('p')
  //   paragraph.className = 'm-0 small text-black-50'
  //   paragraph.textContent = 'This is a constantly updating lorem ipsum feed'

  //   // Добавляем элементы в структуру
  //   liElement.appendChild(heading)
  //   liElement.appendChild(paragraph)
  //   ulElement.appendChild(liElement)
  // })

  // cardDiv.appendChild(ulElement)
  // feedSection.appendChild(cardDiv)
  // }
}
