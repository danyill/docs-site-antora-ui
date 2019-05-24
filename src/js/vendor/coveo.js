;(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    // coveo setup
    var config = document.querySelector('script[src$="/vendor/coveo.js"]').dataset
    var root = document.querySelector('.js-coveo')
    var coveoInit

    Coveo.SearchEndpoint.endpoints['default'] = new Coveo.SearchEndpoint({
      restUri: 'https://platform.cloud.coveo.com/rest/search',
      accessToken: config.accessToken,
    })
    root.addEventListener('buildingQuery', function (e) {
      e.detail.queryBuilder.pipeline = config.queryPipeline
    })

    // modal setup
    var backdrop = document.querySelector('.modal-backdrop')
    var nav = document.querySelector('.js-nav')

    // show/hide coveo search
    var searchTrigger = document.querySelector('.js-search-trigger')
    var searchUI = document.querySelector('.js-search-ui')
    var searchClose = document.querySelector('.js-search-close')
    var showCoveo = function () {
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
    var hideCoveo = function (e) {
      backdrop.classList.remove('show')
      document.body.classList.remove('no-scroll')
      searchUI.classList.remove('show')
    }
    var clickThru = function (e) {
      e.stopPropagation()
    }

    searchTrigger.addEventListener('click', showCoveo)
    searchTrigger.addEventListener('touchend', showCoveo)
    window.addEventListener('click', hideCoveo)
    window.addEventListener('touchend', hideCoveo)
    searchClose.addEventListener('click', hideCoveo)
    searchClose.addEventListener('touchend', hideCoveo)
    document.addEventListener('keydown', function (e) {
      if (e.keyCode === 27) hideCoveo(e)
    })

    // prevent clicks on nav from closing
    root.addEventListener('click', clickThru)
    root.addEventListener('touchend', clickThru)
  })
})()
