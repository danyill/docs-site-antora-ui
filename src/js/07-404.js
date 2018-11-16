;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    // coveo setup
    const body = document.body
    const root = body.querySelector('.js-coveo-404')
    Coveo.SearchEndpoint.endpoints['default'] = new Coveo.SearchEndpoint({
      restUri: 'https://platform.cloud.coveo.com/rest/search',
      accessToken: 'xx3ba020b0-d9b5-4339-bc0e-92fe79a681e7',
    })
    root.addEventListener('buildingQuery', (e) => {
      e.detail.queryBuilder.pipeline = 'doc-query-pipeline'
    })

    // init
    Coveo.init(root)
  })
})()
