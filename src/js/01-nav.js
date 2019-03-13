;(() => {
  'use strict'

  function buildNavTree (parent, group, version, items, level) {
    var navList = document.createElement('ol')
    navList.className = level === 1 ? 'nav-list parent js-nav-list' : 'nav-list'
    navList.style.maxHeight = 0
    navList.dataset.product = group
    navList.dataset.version = version
    items.forEach(function (item) {
      var currentUrl = window.location.pathname
      var active = item.url === currentUrl
      var navItem = document.createElement('li')
      navItem.className = active ? 'nav-li active' : 'nav-li'
      if (active) navList.style.maxHeight = 'none'
      navItem.dataset.depth = level
      var navLink = document.createElement('a')
      navLink.className = 'flex shrink align-center link nav-link' + (active ? ' active' : '') +
        (item.items ? ' nav-nested js-nav-nested' : '')
      navLink.href = relativize(currentUrl, item.url)
      navLink.innerHTML = item.content
      navItem.appendChild(navLink)
      if (item.items) buildNavTree(navItem, group, version, item.items, level + 1)
      navList.appendChild(navItem)
    })
    parent.appendChild(navList)
  }

  function relativize (from, to) {
    if (!from || to.charAt() === '#') return to
    var hash = ''
    var hashIdx = to.indexOf('#')
    if (~hashIdx) {
      hash = to.substr(hashIdx)
      to = to.substr(0, hashIdx)
    }
    if (from === to) {
      return hash || (to.charAt(to.length - 1) === '/' ? './' : to.substr(to.lastIndexOf('/') + 1))
    } else {
      return (relativePath(from.slice(0, from.lastIndexOf('/')), to) || '.') +
        (to.charAt(to.length - 1) === '/' ? '/' + hash : hash)
    }
  }

  function relativePath (from, to) {
    var fromParts = trimArray(from.split('/'))
    var toParts = trimArray(to.split('/'))
    for (var i = 0, len = Math.min(fromParts.length, toParts.length), sharedPathLength = len; i < len; i++) {
      if (fromParts[i] !== toParts[i]) {
        sharedPathLength = i
        break
      }
    }
    var outputParts = []
    for (var remain = fromParts.length - sharedPathLength; remain > 0; remain--) outputParts.push('..')
    return outputParts.concat(toParts.slice(sharedPathLength)).join('/')
  }

  function trimArray (arr) {
    var start = 0
    var length = arr.length
    for (; start < length; start++) {
      if (arr[start]) break
    }
    if (start === length) return []
    for (var end = length; end > 0; end--) {
      if (arr[end - 1]) break
    }
    return arr.slice(start, end)
  }

  // populate navigation
  ;(function (data) {
    var groupList = document.createElement('ol')
    groupList.className = 'nav-list'
    data.forEach(function (group) {
      var groupItem = document.createElement('li')
      groupItem.className = group.url === window.location.pathname ? 'nav-li active' : 'nav-li'
      groupItem.dataset.depth = '0'
      var groupHeading = document.createElement('div')
      groupHeading.className = 'flex align-center justify-justified'
      var groupLink = document.createElement('a')
      groupLink.className = 'flex grow strong link nav-link nav-heading js-nav-link'
      groupLink.tabindex = '0'
      var groupIcon = document.createElement('img')
      groupIcon.className = 'icon no-pointer'
      groupIcon.src = '/_/img/icons/' + group.name + '.svg'
      groupLink.appendChild(groupIcon)
      groupLink.appendChild(document.createTextNode(' '))
      groupLink.appendChild(document.createTextNode(group.title))
      groupHeading.appendChild(groupLink)
      if (group.versions.length > 1) {
        var currentVersion = group.versions[0].version
        var versionButton = document.createElement('button')
        versionButton.className = 'flex align-center shrink button versions'
        versionButton.dataset.trigger = 'versions'
        versionButton.dataset.triggerProduct = group.name
        var versionLabel = document.createElement('span')
        versionLabel.className = 'js-versions-text'
        versionLabel.appendChild(document.createTextNode(currentVersion))
        versionButton.appendChild(versionLabel)
        versionButton.appendChild(document.createTextNode(' '))
        var versionCaret = document.createElement('img')
        // FIXME icon color is wrong; should match text color
        versionCaret.src = '/_/img/icons/chevron.svg'
        // FIXME update CSS to remove this hardcoded style
        versionCaret.style.width = '15px'
        versionButton.appendChild(versionCaret)
        var versionMenu = document.createElement('div')
        versionMenu.className = 'popover js-version-popover'
        versionMenu.dataset.popover = 'versions'
        versionMenu.dataset.popoverProduct = group.name
        var currentVersionList = document.createElement('ol')
        currentVersionList.className = 'ol'
        var currentVersionHeading = document.createElement('li')
        currentVersionHeading.className = 'li-heading'
        currentVersionHeading.appendChild(document.createTextNode('Current version'))
        currentVersionList.appendChild(currentVersionHeading)
        var currentVersionItem = document.createElement('li')
        currentVersionItem.className = 'flex align-center justify-justified li js-version'
        currentVersionItem.dataset.product = group.name
        currentVersionItem.dataset.version = currentVersion
        currentVersionItem.appendChild(document.createTextNode(currentVersion))
        currentVersionList.appendChild(currentVersionItem)
        versionMenu.appendChild(currentVersionList)
        var previousVersionsList = document.createElement('ol')
        var previousVersionsHeading = document.createElement('li')
        previousVersionsHeading.className = 'li-heading'
        previousVersionsHeading.appendChild(document.createTextNode('Previous versions'))
        previousVersionsList.appendChild(previousVersionsHeading)
        group.versions.forEach(function (version, idx) {
          if (idx) {
            var previousVersionItem = document.createElement('li')
            previousVersionItem.className = 'flex align-center justify-justified li js-version'
            previousVersionItem.dataset.product = group.name
            previousVersionItem.dataset.version = version.version
            previousVersionItem.appendChild(document.createTextNode(version.version))
            previousVersionsList.appendChild(previousVersionItem)
          }
          versionMenu.appendChild(previousVersionsList)
        })
        versionButton.appendChild(versionMenu)
        groupHeading.appendChild(versionButton)
      }
      groupItem.appendChild(groupHeading)
      group.versions.forEach(function (version) {
        if (version.items.length) buildNavTree(groupItem, group.name, version.version, version.items, 1)
      })
      groupList.appendChild(groupItem)
    })
    document.querySelector('nav.nav').appendChild(groupList)
  })(window.siteNavigationData || [])

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
    let thisTarget = e.target
    let thisList
    let thisIndex
    let collapse

    // when navigating on page load
    if (e.type === 'DOMContentLoaded') {
      // check if there's a pinned version
      const loadVersion = thisVersion || localStorage.getItem(`ms-docs-${thisProduct}`)
      if (loadVersion) {
        if (thisVersion) {
          localStorage.setItem(`ms-docs-${thisProduct}`, loadVersion)
          setPin(thisProduct, document.querySelector(`[data-trigger-product="${thisProduct}"]`), thisVersion)
        }
        thisList = nav.querySelector(`[data-product="${thisProduct}"][data-version="${loadVersion}"]`)
      } else {
        thisList = nav.querySelector(`.js-nav-list[data-product="${thisProduct}"]`)
      }
    } else if (thisTarget.classList.contains('js-nav-link')) {
      // if navigating via sidebar
      let thisWrapper = thisTarget.parentElement
      let thisNavLi = thisWrapper.parentElement
      thisList = thisNavLi.querySelector('[data-pinned]') || thisWrapper.nextElementSibling
      collapse = thisNavLi.classList.contains('active') || false
      //analytics.track('Toggled Nav', {
      //  url: thisTarget.innerText,
      //})
    } else {
      // if navigation via version select
      thisList = nav.querySelector(`[data-product="${thisProduct}"][data-version="${thisVersion}"]`)
    }

    for (let i = 0; i < navLists.length; i++) {
      // make other elements inactive
      navLists[i].parentNode.classList.remove('active')
      navLists[i].style.maxHeight = 0
      navLists[i].style.opacity = 0

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
      thisList.style.opacity = 1
      thisList.parentNode.classList.add('active')
    }

    // finish load transition
    if (e.type === 'DOMContentLoaded') {
      showNav()
      scrollToActive(thisList)
    }
  }

  const scrollToActive = (thisList) => {
    const activeLink = thisList.querySelector('.nav-link.active')
    var midpoint = (nav.offsetHeight - nav.offsetTop) / 2
    var adjustment = activeLink.offsetTop + (activeLink.offsetHeight / 2) - midpoint
    if (adjustment > 0) nav.scrollTop = adjustment
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
    //analytics.track('Version Pinned', {
    //  product: thisProduct,
    //  version: thisVersion,
    //})
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
  const currentProduct = document.querySelector('meta[name="dcterms.subject"]').content
  if (currentProduct) {
    let currentVersion
    for (let i = 0, l = versionsTrigger.length; i < l; i++) {
      if (versionsTrigger[i].dataset.triggerProduct === currentProduct) {
        currentVersion = document.querySelector('meta[name="dcterms.identifier"]').content
        break
      }
    }
    toggleNav({ type: 'DOMContentLoaded' }, navLists, navListsHeights, currentProduct, currentVersion)
  } else {
    showNav()
  }
})()
