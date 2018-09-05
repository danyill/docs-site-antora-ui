;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    // coveo setup
    const body = document.body
    const root = body.querySelector('.js-coveo')
    Coveo.SearchEndpoint.endpoints['default'] = new Coveo.SearchEndpoint({
      restUri: 'https://platform.cloud.coveo.com/rest/search',
      accessToken: 'xxfb311f5b-4798-4ee9-b059-bd0cbc971104',
    })
    root.addEventListener('buildingQuery', (e) => {
      const facetElement = body.querySelector('.CoveoFacet[data-title="Source"]')
      const facetInstance = Coveo.get(facetElement)
      facetInstance.selectValue('mulesoft docs staging')
    })

    // modal setup
    const backdrop = body.querySelector('.modal-backdrop')
    const nav = body.querySelector('.js-nav')

    // show/hide coveo search
    const searchTrigger = body.querySelector('.js-search-trigger')
    const searchUI = body.querySelector('.js-search-ui')
    const searchClose = body.querySelector('.js-search-close')
    const showCoveo = () => {
      backdrop.classList.add('show')
      backdrop.classList.remove('mobile')
      body.classList.add('no-scroll')
      body.classList.remove('mobile')
      searchUI.classList.add('show')
      nav.classList.remove('active')
      body.querySelector('.CoveoSearchbox input').focus()
    }
    const hideCoveo = () => {
      backdrop.classList.remove('show')
      body.classList.remove('no-scroll')
      searchUI.classList.remove('show')
    }
    const clickThru = (e) => e.stopPropagation()

    searchTrigger.addEventListener('click', showCoveo)
    searchTrigger.addEventListener('touchend', showCoveo)
    body.addEventListener('click', hideCoveo)
    body.addEventListener('touchend', hideCoveo)
    searchClose.addEventListener('click', hideCoveo)
    searchClose.addEventListener('touchend', hideCoveo)
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) hideCoveo()
    })

    // prevent clicks on nav from closing
    root.addEventListener('click', clickThru)
    root.addEventListener('touchend', clickThru)

    // init
    Coveo.init(root)
  })
})()