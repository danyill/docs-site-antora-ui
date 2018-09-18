;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    const nestedNavs = document.querySelectorAll('.js-nav-nested')

    // find and expand list if there's a nested active link
    for (let i = 0; i < nestedNavs.length; i++) {
      let nestedLinks = nestedNavs[i].nextElementSibling.querySelectorAll('.nav-link')

      for (let i = 0; i < nestedLinks.length; i++) {
        if (nestedLinks[i].classList.contains('active')) {
          let thisList = nestedLinks[i]
          while (!thisList.classList.contains('nav-list')) {
            thisList = thisList.parentNode
          }
          thisList.previousElementSibling.classList.add('expanded')
        }
      }
    }
  })
})()
