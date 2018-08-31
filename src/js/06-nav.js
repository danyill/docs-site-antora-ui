;(() => {
  'use strict'

  const navLists = document.querySelectorAll('.js-nav-list')
  let navListsHeights = []
  let navListItems
  let navListItemHeight
  let navLink

  // calculate list height and set height on initial list
  for (let i = 0; i < navLists.length; i++) {
    // get all list items and reset height
    navListItems = navLists[i].querySelectorAll('li')
    navListItemHeight = 0

    // get height of all list items
    for (let x = 0; x < navListItems.length; x++) {
      navListItemHeight += navListItems[x].offsetHeight
      navListsHeights[i] = navListItemHeight
    }

    // set initial active list height
    if (navLists[i].classList.contains('active')) {
      navLists[i].style.transition = 'none'
      navLists[i].style.maxHeight = `${navListsHeights[i]}px`
    }

    // setup toggle events
    navLink = navLists[i].parentElement.querySelector('.js-nav-link')
    navLink.addEventListener('click', (e) => toggleNav(e, navLists, navListsHeights))
    navLink.addEventListener('touchend', (e) => toggleNav(e, navLists, navListsHeights))
  }

  const toggleNav = (e, navLists, navListsHeights) => {
    const thisList = e.target.parentElement.nextElementSibling
    let thisIndex

    for (let i = 0; i < navLists.length; i++) {
      // if transition disabled on load, re-enable
      if (navLists[i].style.transition) {
        navLists[i].style.transition = null
      }

      // make other elements inactive
      navLists[i].parentNode.classList.remove('active')
      navLists[i].style.maxHeight = null

      // check if list matches active target
      if (navLists[i] === thisList) {
        thisIndex = i
      }
    }

    // make current element active
    thisList.style.maxHeight = `${navListsHeights[thisIndex]}px`
    thisList.parentNode.classList.add('active')
  }
})()
