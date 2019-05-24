;(function () {
  'use strict'

  var analytics = window.analytics || { track: function () {} }

  document.addEventListener('DOMContentLoaded', function () {
    var gitHubLinks = document.querySelectorAll('.js-github')
    var trackGitHub = function () {
      analytics.track('Clicked GitHub Link', {
        url: window.location.href,
      })
    }

    for (var i = 0; i < gitHubLinks.length; i++) {
      gitHubLinks[i].addEventListener('click', trackGitHub)
      gitHubLinks[i].addEventListener('touchend', trackGitHub)
    }
  })
})()
