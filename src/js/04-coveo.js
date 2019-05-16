;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    // coveo setup
    const root = document.querySelector('.js-coveo')
    let coveoInit = false

    Coveo.SearchEndpoint.endpoints['default'] = new Coveo.SearchEndpoint({
      restUri: 'https://platform.cloud.coveo.com/rest/search',
      accessToken: 'xx3ba020b0-d9b5-4339-bc0e-92fe79a681e7',
    })
    root.addEventListener('buildingQuery', (e) => {
      e.detail.queryBuilder.pipeline = 'doc-query-pipeline'
    })

    // modal setup
    const backdrop = document.querySelector('.modal-backdrop')
    const nav = document.querySelector('.js-nav')

    // show/hide coveo search
    const searchTrigger = document.querySelector('.js-search-trigger')
    const searchUI = document.querySelector('.js-search-ui')
    const searchClose = document.querySelector('.js-search-close')
    const showCoveo = () => {
      if (!coveoInit) {
        Coveo.init(root)
        coveoInit = true
      }
      backdrop.classList.add('show')
      backdrop.classList.remove('mobile')
      document.body.classList.add('no-scroll')
      document.body.classList.remove('mobile')
      searchUI.classList.add('show')
      nav.classList.remove('active')

      tippy.hideAll()

      analytics.track('Clicked Open Search')
    }
    const hideCoveo = (e) => {
      // NOTE quick hack to prevent click event from bubbling from tippy popper (despite being told not to)
      if (e.target.classList.contains('js-version')) return
      backdrop.classList.remove('show')
      document.body.classList.remove('no-scroll')
      searchUI.classList.remove('show')
    }
    const clickThru = (e) => e.stopPropagation()

    searchTrigger.addEventListener('click', showCoveo)
    searchTrigger.addEventListener('touchend', showCoveo)
    window.addEventListener('click', hideCoveo)
    window.addEventListener('touchend', hideCoveo)
    searchClose.addEventListener('click', hideCoveo)
    searchClose.addEventListener('touchend', hideCoveo)
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) hideCoveo(e)
    })

    // prevent clicks on nav from closing
    root.addEventListener('click', clickThru)
    root.addEventListener('touchend', clickThru)
  })
})()
