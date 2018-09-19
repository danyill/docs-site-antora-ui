;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    const nestedNavs = document.querySelectorAll('.js-nav-nested')

    // find and expand list if there's a nested active link
    for (let i = 0; i < nestedNavs.length; i++) {
      let nestedLinks = nestedNavs[i].nextElementSibling.querySelectorAll('.nav-link')

      for (let i = 0; i < nestedLinks.length; i++) {
        if (nestedLinks[i].classList.contains('active')) {
          // get this active list & expand it
          let thisList = nestedLinks[i]
          while (!thisList.classList.contains('nav-list')) {
            thisList = thisList.parentNode
          }
          thisList.previousElementSibling.classList.add('expanded')

          // check if this is a nested, nested list
          const thisListParent = thisList.parentNode.parentNode
          if (!thisListParent.classList.contains('parent')) {
            thisListParent.previousElementSibling.classList.add('expanded')
          }

          // check if this is a nested, nested, nested list
          const thisListParentParent = thisListParent.parentNode.parentNode
          if (!thisListParentParent.classList.contains('parent')) {
            thisListParentParent.previousElementSibling.classList.add('expanded')
          }
        }
      }
    }
  })
})()
