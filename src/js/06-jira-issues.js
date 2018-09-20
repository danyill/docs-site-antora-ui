;(() => {
  window.ATL_JQ_PAGE_PROPS = {
    'triggerFunction': (showCollectorDialog) => {
      document.querySelector('.js-jira').addEventListener('click', (e) => {
        e.preventDefault()
        showCollectorDialog()
      })
    },
  }
})()
