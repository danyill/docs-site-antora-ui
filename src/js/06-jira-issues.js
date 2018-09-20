;(() => {
  // open jira dialog
  window.ATL_JQ_PAGE_PROPS = {
    'triggerFunction': (showCollectorDialog) => {
      document.querySelector('.js-jira').addEventListener('click', (e) => {
        e.preventDefault()
        showCollectorDialog()
      })
      document.querySelector('.js-jira').addEventListener('touchend', (e) => {
        e.preventDefault()
        showCollectorDialog()
      })
    },
  }

  // saying thanks
  const thanksSection = document.querySelector('.js-thanks-section')
  const thanksTrigger = thanksSection.querySelector('.js-thanks')
  const sayThanks = () => thanksSection.classList.add('flip')

  document.addEventListener('DOMContentLoaded', () => {
    thanksTrigger.addEventListener('click', sayThanks)
    thanksTrigger.addEventListener('touchend', sayThanks)
  })
})()
