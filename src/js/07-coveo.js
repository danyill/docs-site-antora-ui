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
      const facetElement = document.querySelector('.CoveoFacet[data-title="Source"]')
      const facetInstance = Coveo.get(facetElement)
      facetInstance.selectValue('mulesoft docs staging')
    })

    // modal setup
    const backdrop = document.querySelector('.modal-backdrop')

    // show/hide coveo search
    const searchTrigger = body.querySelector('.js-search-trigger')
    const searchUI = body.querySelector('.js-search-ui')
    const showCoveo = () => {
      backdrop.classList.add('show')
      body.classList.add('no-scroll')
      searchUI.classList.add('show')
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

    // prevent clicks on nav from closing
    root.addEventListener('click', clickThru)
    root.addEventListener('touchend', clickThru)

    // init
    Coveo.init(root)
  })
})()
