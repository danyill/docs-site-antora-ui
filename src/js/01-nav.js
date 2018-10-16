;(() => {
  'use strict'

  // navigation
  const nav = document.querySelector('.js-nav')
  const navLists = nav.querySelectorAll('.js-nav-list')
  const navLink = nav.querySelectorAll('.js-nav-link')
  let navListsHeights = []
  let navListItems
  let navListItemHeight

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
  }

  // setup toggle events
  for (let i = 0; i < navLink.length; i++) {
    navLink[i].addEventListener('click', (e) => toggleNav(e, navLists, navListsHeights))
    navLink[i].addEventListener('touchend', (e) => toggleNav(e, navLists, navListsHeights))
  }

  const showNav = () => {
    const nav = document.querySelector('.js-nav .nav-list')
    if (!nav.classList.contains('loaded')) nav.classList.add('loaded')
  }

  const toggleNav = (e, navLists, navListsHeights, thisProduct, thisVersion) => {
    let noTransition = false
    let thisTarget = e.target
    let thisList
    let thisIndex
    let collapse

    // when navigating on page load
    if (e.type === 'DOMContentLoaded') {
      // check if there's a pinned version
      const loadVersion = thisVersion || localStorage.getItem(`ms-docs-${thisProduct}`)
      if (loadVersion) {
        thisList = nav.querySelector(`[data-product="${thisProduct}"][data-version="${loadVersion}"]`)
      } else {
        thisList = nav.querySelector(`.js-nav-list[data-product="${thisProduct}"]`)
      }
      noTransition = true
    } else if (thisTarget.classList.contains('js-nav-link')) {
      // if navigating via sidebar
      let thisWrapper = thisTarget.parentElement
      let thisNavLi = thisWrapper.parentElement
      thisList = thisNavLi.querySelector('[data-pinned]') || thisWrapper.nextElementSibling
      collapse = thisNavLi.classList.contains('active') || false
      analytics.track('Toggled Nav', {
        url: thisTarget.innerText,
      })
    } else {
      // if navigation via version select
      thisList = nav.querySelector(`[data-product="${thisProduct}"][data-version="${thisVersion}"]`)
      // used for disabling transition during version change
      noTransition = true
    }

    for (let i = 0; i < navLists.length; i++) {
      // if transition disabled on load, re-enable
      if (noTransition) {
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

    // close any open popovers
    closePopovers()

    // if there's no list, stop here
    if (!thisList) return

    // make current element active if not collapsing
    if (!collapse) {
      thisList.style.maxHeight = `${navListsHeights[thisIndex]}px`
      thisList.style.opacity = '1'
      thisList.parentNode.classList.add('active')
      if (noTransition) thisList.classList.add('transition-opacity-only')
    }

    // finish load transition
    if (e.type === 'DOMContentLoaded') {
      showNav()
      scrollToActive(thisList)
    }
  }

  // this scrolls the navbar to the current page…
  // really this doesn't work great b/c the nav should not reload when the page changes (singe-page)
  const scrollToActive = (thisList) => {
    const activeLinks = thisList.querySelectorAll('.nav-link.active')
    for (let i = 0; i < activeLinks.length; i++) {
      let thisList = activeLinks[i].parentNode
      while (thisList.style.opacity === '1') {
        thisList = thisList.parentNode
      }
      document.querySelector('.js-nav').scrollTo({
        behavior: 'smooth',
        top: thisList.offsetTop - (window.innerHeight / 2) + 65, // scroll to center; 65 is the header height
      })
      break
    }
  }

  // version popovers
  // tippy plugin https://atomiks.github.io/tippyjs/
  const versionsTrigger = document.querySelectorAll('[data-trigger="versions"]')
  const versionsPopover = document.querySelectorAll('[data-popover="versions"]')

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
    analytics.track('Version Pinned', {
      product: thisProduct,
      version: thisVersion,
    })
  }

  for (let i = 0; i < versionsTrigger.length; i++) {
    tippy(versionsTrigger[i], {
      duration: [0, 150],
      flip: false,
      html: versionsPopover[i],
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
      zIndex: 14, // same as z-nav-mobile
    })

    // if a version has been pinned
    setPin(versionsTrigger[i].getAttribute('data-trigger-product'), versionsTrigger[i])
  }

  const closePopovers = (instance) => {
    const popper = document.querySelector('.tippy-popper')
    if (popper) popper._tippy.hide()
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
    e.stopPropagation()
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
    if (thisProduct !== '') {
      toggleNav(e, navLists, navListsHeights, thisProduct)
    }
    showNav()
  })
})()
