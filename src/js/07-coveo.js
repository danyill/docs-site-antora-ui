;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    // coveo setup
    const root = document.querySelector('.js-coveo')
    Coveo.SearchEndpoint.endpoints['default'] = new Coveo.SearchEndpoint({
      restUri: 'https://platform.cloud.coveo.com/rest/search',
      accessToken: 'xxfb311f5b-4798-4ee9-b059-bd0cbc971104',
    })

    // show/hide coveo search
    const searchTrigger = document.querySelector('.js-search-trigger')
    const searchUI = document.querySelector('.js-search-ui')
    const showCoveo = () => {
      searchUI.classList.toggle('show')
    }

    searchTrigger.addEventListener('click', showCoveo)
    searchTrigger.addEventListener('touchend', showCoveo)

    // init
    Coveo.init(root)
  })
})()
