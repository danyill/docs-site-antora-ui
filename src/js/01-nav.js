;(() => {
  'use strict'

  // navigation
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

  const toggleNav = (e, navLists, navListsHeights, thisProduct, thisVersion) => {
    let changingVersion = false
    let thisTarget = e.target
    let thisList
    let thisIndex

    // when navigating on page load
    if (e.type === 'DOMContentLoaded') {
      thisList = document.querySelector(`.js-nav-list[data-product="${thisProduct}"]`)
    } else if (thisTarget.classList.contains('js-nav-link')) {
      // if navigating via sidebar
      let thisWrapper = thisTarget.parentElement
      thisList = thisWrapper.parentElement.querySelector('[data-pinned]') || thisWrapper.nextElementSibling
    } else {
      // if navigation via version select
      thisList = document.querySelector(`[data-product="${thisProduct}"][data-version="${thisVersion}"]`)
      // used for disabling transition during version change
      changingVersion = true
    }

    for (let i = 0; i < navLists.length; i++) {
      // if transition disabled on load, re-enable
      if (changingVersion) {
        navLists[i].classList.add('transition-opacity-only')
      } else if (navLists[i].classList.contains('transition-opacity-only')) {
        navLists[i].classList.remove('transition-opacity-only')
      }

      // make other elements inactive
      navLists[i].parentNode.classList.remove('active')
      navLists[i].style.maxHeight = null
      navLists[i].style.opacity = '0'

      // check if list matches active target
      if (navLists[i] === thisList) {
        thisIndex = i
      }
    }

    // make current element active
    thisList.style.maxHeight = `${navListsHeights[thisIndex]}px`
    thisList.style.opacity = '1'
    thisList.parentNode.classList.add('active')
    if (changingVersion) thisList.classList.add('transition-opacity-only')
    closePopovers()
  }

  // version popovers
  // tippy plugin https://atomiks.github.io/tippyjs/
  const versionsTrigger = document.querySelectorAll('[data-trigger="versions"]')
  const versionsPopover = document.querySelectorAll('[data-popover="versions"]')
  const pinTrigger = document.querySelectorAll('[data-trigger="pin"]')

  const setPin = (thisProduct, thisTrigger, thisVersion) => {
    const savedVersion = localStorage.getItem(`ms-docs-${thisProduct}`)
    if (savedVersion) {
      thisTrigger.querySelector('.js-versions-text').textContent = savedVersion
      for (let i = 0; i < navLists.length; i++) {
        const listProduct = navLists[i].getAttribute('data-product')
        const listVersion = navLists[i].getAttribute('data-version')
        if (thisProduct === listProduct && savedVersion === listVersion) {
          navLists[i].setAttribute('data-pinned', true)
        }
      }
    }
  }

  for (let i = 0; i < versionsTrigger.length; i++) {
    tippy(versionsTrigger[i], {
      duration: [0, 150],
      flip: false,
      html: versionsPopover[i],
      interactive: true,
      offset: '-40, 5',
      onHide (instance) {
        this.classList.add('hide')
        this.classList.remove('shown')
        unbindEvents(this)
      },
      onShow (instance) {
        closePopovers(instance)
        this.classList.remove('hide')
        bindEvents(this)
      },
      onShown (instance) {
        this.classList.add('shown')
      },
      placement: 'bottom',
      theme: 'popover-versions',
      trigger: 'click',
      zIndex: 11, // same as z-nav
    })

    // if a version has been pinned
    setPin(versionsTrigger[i].getAttribute('data-trigger-product'), versionsTrigger[i])
  }

  tippy(pinTrigger, {
    duration: [0, 0],
    offset: '0, 20',
    placement: 'right',
    theme: 'tooltip',
  })

  const closePopovers = (instance) => {
    versionsTrigger.forEach((popper) => {
      if (!instance) {
        popper._tippy.hide()
      } else if (popper !== instance.popper) {
        popper._tippy.hide()
      }
    })
  }

  // changing versions
  const changeVersion = (e) => {
    const thisTippy = document.querySelector('.tippy-popper')._tippy
    const thisTarget = e.target
    const thisProduct = thisTarget.getAttribute('data-product')
    const thisVersion = thisTarget.getAttribute('data-version')
    // save version
    localStorage.setItem(`ms-docs-${thisProduct}`, thisVersion)
    // update pins
    setPin(thisProduct, thisTippy.reference, thisVersion)
    // update nav
    toggleNav(e, navLists, navListsHeights, thisProduct, thisVersion)
    // close the popover
    thisTippy.hide()
  }

  const bindEvents = (popover) => {
    const versions = popover.querySelectorAll('.js-version')
    for (let i = 0; i < versions.length; i++) {
      versions[i].addEventListener('click', changeVersion)
      versions[i].addEventListener('touchend', changeVersion)
    }
  }

  const unbindEvents = (popover) => {
    const versions = popover.querySelectorAll('.js-version')
    for (let i = 0; i < versions.length; i++) {
      versions[i].removeEventListener('click', changeVersion)
      versions[i].removeEventListener('touchend', changeVersion)
    }
  }

  // open current nav on load
  window.addEventListener('DOMContentLoaded', (e) => {
    const thisProduct = window.location.pathname.replace(/^\/([^/]*).*$/, '$1')
    if (thisProduct !== '') toggleNav(e, navLists, navListsHeights, thisProduct)
  })
})()
