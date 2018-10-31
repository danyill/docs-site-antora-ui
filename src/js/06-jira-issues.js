;(() => {
  'use strict'

  // track not helpful
  const trackNotHelpful = () => {
    analytics.track('Clicked Helpful No', {
      title: document.title,
      url: window.location.href,
    })
  }

  // open jira dialog
  window.ATL_JQ_PAGE_PROPS = {
    'triggerFunction': (showCollectorDialog) => {
      document.querySelector('.js-jira').addEventListener('click', (e) => {
        e.preventDefault()
        showCollectorDialog()
        trackNotHelpful()
      })
      document.querySelector('.js-jira').addEventListener('touchend', (e) => {
        e.preventDefault()
        showCollectorDialog()
        trackNotHelpful()
      })
    },
    fieldValues: {
      description: 'URL: ' + window.location.href,
    },
  }

  // saying thanks
  const thanksSection = document.querySelector('.js-thanks-section')
  const thanksTrigger = thanksSection.querySelector('.js-thanks')
  const sayThanks = () => {
    thanksSection.classList.add('flip')
    analytics.track('Clicked Helpful Yes', {
      title: document.title,
      url: window.location.href,
    })
  }

  document.addEventListener('DOMContentLoaded', () => {
    thanksTrigger.addEventListener('click', sayThanks)
    thanksTrigger.addEventListener('touchend', sayThanks)
  })
})()
