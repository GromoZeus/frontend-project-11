// Модуль для парсинга XML-контента RSS-ленты и извлечения данных о постах и фидах.

import i18n from 'i18next'

export default (dataRSS, state) => {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(dataRSS, 'application/xml')

    const channel = xmlDoc.querySelector('channel')
    const title = channel.querySelector('title').textContent
    const description = channel.querySelector('description').textContent
    const items = xmlDoc.querySelectorAll('item')

    return { title, description, items }
  }
  catch (parserError) {
    state.RSSprocess.process.feedbackMsg = i18n.t('feedback.parserError')
    state.RSSprocess.process.processState = 'failed'
    throw new Error(`XML parsing error: ${parserError.textContent}`)
  }
}
