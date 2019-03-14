;(() => {
  'use strict'

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
    for (var i = 0, l = Math.min(fromParts.length, toParts.length), sharedPathLength = l; i < l; i++) {
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

  function buildNavTree (nav, parent, group, version, items, level) {
    var navList = document.createElement('ol')
    navList.className = level === 1 ? 'nav-list parent js-nav-list' : 'nav-list'
    navList.style.display = 'none'
    navList.dataset.product = group
    navList.dataset.version = version
    items.forEach(function (item) {
      var currentUrl = window.location.pathname
      // FIXME prefer active group item over match anywhere else in tree (currently first encountered wins)
      var active = !nav.foundActive && item.url === currentUrl ? (nav.foundActive = true) : false
      var navItem = document.createElement('li')
      navItem.className = active ? 'nav-li active' : 'nav-li'
      navItem.dataset.depth = level
      var navLink = document.createElement('a')
      navLink.className = 'flex shrink align-center link nav-link' + (active ? ' active' : '') +
        (item.items ? ' nav-nested js-nav-nested' : '')
      navLink.href = relativize(currentUrl, item.url)
      navLink.innerHTML = item.content
      navItem.appendChild(navLink)
      if (item.items) buildNavTree(nav, navItem, group, version, item.items, level + 1)
      navList.appendChild(navItem)
    })
    parent.appendChild(navList)
  }

  // populate navigation
  ;(function (nav, data) {
    var groupList = document.createElement('ol')
    groupList.className = 'nav-list'
    data.forEach(function (group) {
      var groupItem = document.createElement('li')
      var active = !nav.foundActive && group.url === window.location.pathname ? (nav.foundActive = true) : false
      groupItem.className = active ? 'nav-li active' : 'nav-li'
      groupItem.dataset.depth = 0
      var groupHeading = document.createElement('div')
      groupHeading.className = 'flex align-center justify-justified'
      var groupLink = document.createElement('a')
      groupLink.className = 'flex grow strong link nav-link nav-heading js-nav-link'
      groupLink.tabindex = 0
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
        if (version.items.length) buildNavTree(nav, groupItem, group.name, version.version, version.items, 1)
      })
      groupList.appendChild(groupItem)
    })
    nav.appendChild(groupList)
    // QUESTION can we do this during the build? (we'd have to append child to parent eagerly)
    const activeItem = nav.querySelector('.nav-li.active')
    let ancestor = activeItem
    while ((ancestor = ancestor.parentNode) && ancestor !== groupList) {
      if (ancestor.classList.contains('nav-li')) {
        ancestor.classList.add('active')
      } else if (ancestor.classList.contains('nav-list')) {
        ancestor.style.display = ''
      }
    }
    if (activeItem.firstChild.classList.contains('nav-nested')) {
      const activeNavSublist = activeItem.lastChild
      activeNavSublist.style.display = ''
    }
  })(document.querySelector('nav.nav'), window.siteNavigationData || [])

  // navigation
  const nav = document.querySelector('.js-nav')
  const navLists = nav.querySelectorAll('.js-nav-list')
  const navLinks = nav.querySelectorAll('.js-nav-link')

  // setup toggle events
  for (let i = 0, l = navLinks.length; i < l; i++) {
    navLinks[i].addEventListener('click', (e) => toggleNav(e, navLists))
    navLinks[i].addEventListener('touchend', (e) => toggleNav(e, navLists))
  }

  const revealNav = () => {
    nav.querySelector('.nav-list').classList.add('loaded')
  }

  const toggleNav = (e, navLists, thisProduct, thisVersion) => {
    let thisList

    // when navigating on page load
    if (e.type === 'DOMContentLoaded') {
      if (thisVersion) {
        localStorage.setItem(`ms-docs-${thisProduct}`, thisVersion)
        setPin(thisProduct, document.querySelector(`[data-trigger-product="${thisProduct}"]`), thisVersion)
        thisList = nav.querySelector(`[data-product="${thisProduct}"][data-version="${thisVersion}"]`)
      } else {
        thisList = nav.querySelector(`[data-product="${thisProduct}"]`)
      }
      scrollToActive(thisList)
      revealNav()
    } else {
      const thisTarget = e.target
      let collapse
      if (thisTarget.classList.contains('js-nav-link')) {
        // if navigating via sidebar
        const thisWrapper = thisTarget.parentElement
        const thisNavLi = thisWrapper.parentElement
        thisList = thisNavLi.querySelector('[data-pinned]') || thisWrapper.nextElementSibling
        collapse = thisNavLi.classList.contains('active')
        //analytics.track('Toggled Nav', {
        //  url: thisTarget.innerText,
        //})
      } else {
        // if navigation via version select
        thisList = nav.querySelector(`[data-product="${thisProduct}"][data-version="${thisVersion}"]`)
      }

      for (let i = 0, l = navLists.length; i < l; i++) {
        // make other elements inactive
        navLists[i].parentNode.classList.remove('active')
        navLists[i].style.display = 'none'
      }

      // close any open popovers
      closePopovers()

      // make current element active if not collapsing
      if (thisList && !collapse) {
        thisList.style.display = ''
        thisList.parentNode.classList.add('active')
      }
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
      for (let i = 0, l = navLists.length; i < l; i++) {
        const listProduct = navLists[i].dataset.product
        const listVersion = navLists[i].dataset.version
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

  for (let i = 0, l = versionsTrigger.length; i < l; i++) {
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
    setPin(versionsTrigger[i].dataset.triggerProduct, versionsTrigger[i])
  }

  const closePopovers = (instance) => {
    const popper = document.querySelector('.tippy-popper')
    if (popper) popper._tippy.hide()
  }

  // changing versions
  const changeVersion = (e) => {
    const thisTippy = document.querySelector('.tippy-popper')._tippy
    const thisTarget = e.target
    const thisProduct = thisTarget.dataset.product
    const thisVersion = thisTarget.dataset.version
    // save version
    localStorage.setItem(`ms-docs-${thisProduct}`, thisVersion)
    // update pins
    setPin(thisProduct, thisTippy.reference, thisVersion)
    // update nav
    toggleNav(e, navLists, thisProduct, thisVersion)
    // close the popover
    thisTippy.hide()
    e.stopPropagation()
  }

  const bindEvents = (popover) => {
    const versions = popover.querySelectorAll('.js-version')
    for (let i = 0, l = versions.length; i < l; i++) {
      versions[i].addEventListener('click', changeVersion)
      versions[i].addEventListener('touchend', changeVersion)
    }
  }

  const unbindEvents = (popover) => {
    const versions = popover.querySelectorAll('.js-version')
    for (let i = 0, l = versions.length; i < l; i++) {
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
    toggleNav({ type: 'DOMContentLoaded' }, navLists, currentProduct, currentVersion)
  } else {
    revealNav()
  }
})()
