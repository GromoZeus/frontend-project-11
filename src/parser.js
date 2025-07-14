import i18n from 'i18next'

export default (dataRSS, state) => {
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
