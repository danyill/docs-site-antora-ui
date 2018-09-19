;(() => {
  window.ATL_JQ_PAGE_PROPS = {
    'triggerFunction': (showCollectorDialog) => {
      document.querySelector('.jira').addEventListener('click', (e) => {
        e.preventDefault()
        showCollectorDialog()
      })
    },
  }
})()
