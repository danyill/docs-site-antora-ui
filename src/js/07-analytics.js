;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    const gitHubLinks = document.querySelectorAll('.js-github')
    const trackGitHub = () => {
      analytics.track('Clicked GitHub Link', {
        url: window.location.href,
      })
    }

    for (let i = 0; i < gitHubLinks.length; i++) {
      gitHubLinks[i].addEventListener('click', trackGitHub)
      gitHubLinks[i].addEventListener('touchend', trackGitHub)
    }
  })
})()
