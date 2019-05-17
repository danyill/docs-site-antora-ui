;(function () {
  'use strict'

  var pageProduct
  var pageVersion
  var pageUrl
  if ((pageProduct = document.head.querySelector('meta[name=page-component]'))) {
    pageProduct = pageProduct.getAttribute('content')
    pageVersion = document.head.querySelector('meta[name=page-version]').getAttribute('content')
    pageUrl = document.head.querySelector('meta[name=page-url]').getAttribute('content')
  } else {
    // QUESTION should we show the navigation on a 404 page?
    return
  }
  var uiRootPath = document.head
    .querySelector('link[rel=stylesheet]')
    .getAttribute('href')
    .match(/^(.*\/|)_(?=\/)/)[0]

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
      return (
        (relativePath(from.slice(0, from.lastIndexOf('/')), to) || '.') +
        (to.charAt(to.length - 1) === '/' ? '/' + hash : hash)
      )
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
    if (level === 1) {
      navList.className = 'nav-list parent js-nav-list'
      if (!(group === pageProduct && version === pageVersion)) navList.style.display = 'none'
      navList.dataset.product = group
      navList.dataset.version = version
    } else {
      navList.className = 'nav-list parent js-nav-list'
      navList.style.display = 'none'
    }
    items.forEach(function (item) {
      // FIXME prefer active group item over match anywhere else in tree (currently first encountered wins)
      var active = !nav.foundActive && item.url === pageUrl ? (nav.foundActive = true) : false
      var navItem = document.createElement('li')
      navItem.className = active ? 'nav-li active' : 'nav-li'
      navItem.dataset.depth = level
      if (item.items) {
        var navToggle = document.createElement('button')
        navToggle.className = 'js-subnav-toggle'
        navItem.appendChild(navToggle)
      }
      if (item.url) {
        var navLink = document.createElement('a')
        navLink.className =
          'flex shrink align-center link nav-link' +
          (active ? ' active' : '') +
          (item.items ? ' nav-nested js-nav-nested' : '')
        if (item.urlType === 'external') {
          navLink.href = item.url
          navLink.target = '_blank'
        } else {
          navLink.href = relativize(pageUrl, item.url)
        }
        navLink.innerHTML = item.content
        navItem.appendChild(navLink)
      } else {
        var navHeading = document.createElement('span')
        navHeading.className = 'flex grow align-center nav-heading' + (item.items ? ' nav-nested js-nav-nested' : '')
        var navHeadingSpan = document.createElement('span')
        navHeadingSpan.className = 'span'
        navHeadingSpan.innerHTML = item.content
        navHeading.appendChild(navHeadingSpan)
        navItem.appendChild(navHeading)
      }
      if (item.items) buildNavTree(nav, navItem, group, version, item.items, level + 1)
      navList.appendChild(navItem)
    })
    parent.appendChild(navList)
    return navList
  }

  // populate navigation
  ;(function (nav, data) {
    var groupList = document.createElement('ol')
    var currentGroupItem
    groupList.className = 'nav-list'
    var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chevron.classList.add('svg')
    chevron.setAttribute('viewBox', '0 0 30 30')
    chevron.setAttribute('width', '30')
    chevron.setAttribute('height', '30')
    var chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    chevronPath.setAttribute(
      'd',
      'M15.003 21.284L6.563 9.232l1.928-.516 6.512 9.299 6.506-9.299 1.928.516-8.434 12.052z'
    )
    chevron.appendChild(chevronPath)
    data.forEach(function (group) {
      var groupItem = document.createElement('li')
      if (group.name === pageProduct) currentGroupItem = groupItem
      var active = !nav.foundActive && group.url === pageUrl ? (nav.foundActive = true) : false
      groupItem.className = active ? 'nav-li active' : 'nav-li'
      groupItem.dataset.depth = 0
      var groupHeading = document.createElement('div')
      groupHeading.className = 'flex align-center justify-justified'
      var groupLink = document.createElement('a')
      groupLink.className = 'flex grow strong link nav-link nav-heading js-nav-link'
      groupLink.tabindex = 0
      var groupIcon = document.createElement('img')
      groupIcon.className = 'icon no-pointer'
      groupIcon.src = uiRootPath + '/img/icons/' + group.name + '.svg'
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
        versionButton.appendChild(chevron.cloneNode(true))
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
        // NOTE we only take the items of the first menu
        var items = ((version.sets || [])[0] || {}).items || []
        if (items.length) buildNavTree(nav, groupItem, group.name, version.version, items, 1)
      })
      groupList.appendChild(groupItem)
    })
    nav.appendChild(groupList)
    // QUESTION can we do this during the build? (we'd have to append child to parent eagerly)
    var activeItem = nav.querySelector('.nav-li.active')
    if (activeItem) {
      var ancestor = activeItem
      while ((ancestor = ancestor.parentNode) && ancestor !== groupList) {
        if (ancestor.classList.contains('nav-li')) {
          ancestor.classList.add('active')
        } else if (ancestor.classList.contains('nav-list')) {
          ancestor.style.display = ''
        }
      }
      if (activeItem.firstChild.classList.contains('js-subnav-toggle')) {
        activeItem.lastChild.style.display = ''
      }
    } else if (currentGroupItem) {
      currentGroupItem.classList.add('active')
    }
  })(document.querySelector('nav.nav'), window.siteNavigationData || [])

  // navigation
  var nav = document.querySelector('.js-nav')
  var navLists = nav.querySelectorAll('.js-nav-list')
  var navLinks = nav.querySelectorAll('.js-nav-link')
  var navToggles = nav.querySelectorAll('.js-subnav-toggle')
  var i, l

  for (i = 0, l = navLinks.length; i < l; i++) {
    navLinks[i].addEventListener('click', function (e) {
      toggleNav(e, navLists)
    })
    navLinks[i].addEventListener('touchend', function (e) {
      toggleNav(e, navLists)
    })
  }

  for (i = 0, l = navToggles.length; i < l; i++) {
    navToggles[i].addEventListener('click', function (e) {
      toggleSubnav(e)
    })
    navToggles[i].addEventListener('touchend', function (e) {
      toggleSubnav(e)
    })
  }

  function revealNav () {
    nav.querySelector('.nav-list').classList.add('loaded')
  }

  function toggleNav (e, navLists, thisProduct, thisVersion) {
    // if navigating from the location bar
    if (e.type === 'DOMContentLoaded') {
      if (thisProduct) {
        var productVersionSelector = document.querySelector(`[data-trigger-product="${thisProduct}"]`)
        if (productVersionSelector) {
          localStorage.setItem(`ms-docs-${thisProduct}`, thisVersion)
          setPin(thisProduct, productVersionSelector, thisVersion)
          scrollToActive(nav.querySelector(`[data-product="${thisProduct}"][data-version="${thisVersion}"]`))
        } else {
          scrollToActive(nav.querySelector(`[data-product="${thisProduct}"]`))
        }
      }
      revealNav()
    } else if (e.target.classList.contains('js-nav-link')) {
      // if navigating via sidebar
      var thisWrapper = e.target.parentElement
      var thisNavLi = thisWrapper.parentElement
      var pinnedList = thisNavLi.querySelector('[data-pinned]') || thisWrapper.nextSibling
      if (thisNavLi.classList.contains('active')) {
        pinnedList.style.display = 'none'
        thisNavLi.classList.remove('active')
      } else {
        pinnedList.style.display = ''
        thisNavLi.classList.add('active')
      }
      tippy.hideAll()
      //analytics.track('Toggled Nav', {
      //  url: thisTarget.innerText,
      //})
    } else {
      // if navigating via version selector
      var thisList = nav.querySelector(`[data-product="${thisProduct}"][data-version="${thisVersion}"]`)

      // make other versions inactive
      // TODO this could be more efficient
      for (var i = 0, l = navLists.length; i < l; i++) {
        if (navLists[i].parentNode === thisList.parentNode) {
          navLists[i].parentNode.classList.remove('active')
          navLists[i].style.display = 'none'
        }
      }

      thisList.style.display = ''
      thisList.parentNode.classList.add('active')

      tippy.hideAll()
    }
  }

  function toggleSubnav (e) {
    var navListParent = e.target.parentNode
    var navList = navListParent.lastChild
    if (navListParent.classList.contains('active')) {
      navList.style.display = 'none'
      navListParent.classList.remove('active')
    } else {
      navList.style.display = ''
      navListParent.classList.add('active')
    }
  }

  function scrollToActive (thisList) {
    var focusElement = thisList.querySelector('.nav-link.active') || thisList.previousSibling
    var midpoint = (nav.offsetHeight - nav.offsetTop) / 2
    var adjustment = focusElement.offsetTop + focusElement.offsetHeight / 2 - midpoint
    if (adjustment > 0) nav.scrollTop = adjustment
  }

  // version popovers
  // tippy plugin https://atomiks.github.io/tippyjs/
  var versionsTrigger = document.querySelectorAll('[data-trigger="versions"]')
  var versionsPopover = document.querySelectorAll('[data-popover="versions"]')

  function setPin (thisProduct, thisTrigger, thisVersion) {
    var savedVersion = localStorage.getItem(`ms-docs-${thisProduct}`)
    if (savedVersion) {
      thisTrigger.querySelector('.js-versions-text').textContent = savedVersion
      for (var i = 0, l = navLists.length; i < l; i++) {
        var listProduct = navLists[i].dataset.product
        var listVersion = navLists[i].dataset.version
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

  for (i = 0, l = versionsTrigger.length; i < l; i++) {
    tippy(versionsTrigger[i], {
      content: versionsPopover[i],
      duration: [0, 150],
      flip: false,
      interactive: true,
      offset: '-40, 5',
      onHide (instance) {
        instance.popper.classList.add('hide')
        instance.popper.classList.remove('shown')
      },
      onHidden (instance) {
        unbindEvents(instance.popper)
      },
      onShow (instance) {
        instance.hide()
        instance.popper.classList.remove('hide')
      },
      onShown (instance) {
        bindEvents(instance.popper)
        instance.popper.classList.add('shown')
      },
      placement: 'bottom',
      theme: 'popover-versions',
      touchHold: true, // maps touch as click (for some reason)
      trigger: 'click',
      zIndex: 14, // same as z-nav-mobile
    })

    // if a version has been pinned
    setPin(versionsTrigger[i].dataset.triggerProduct, versionsTrigger[i])
  }

  // changing versions
  function changeVersion (e) {
    var thisTippy = document.querySelector('.tippy-popper')._tippy
    var thisTarget = e.target
    var thisProduct = thisTarget.dataset.product
    var thisVersion = thisTarget.dataset.version
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

  function cancelEvent (e) {
    e.stopPropagation()
  }

  function bindEvents (popover) {
    var versions = popover.querySelectorAll('.js-version')
    for (var i = 0, l = versions.length; i < l; i++) {
      versions[i].addEventListener('click', changeVersion)
      // NOTE tippy emulates click event on touch device
      versions[i].addEventListener('touchend', cancelEvent)
    }
  }

  function unbindEvents (popover) {
    var versions = popover.querySelectorAll('.js-version')
    for (var i = 0, l = versions.length; i < l; i++) {
      versions[i].removeEventListener('click', changeVersion)
      versions[i].removeEventListener('touchend', cancelEvent)
    }
  }

  toggleNav({ type: 'DOMContentLoaded' }, navLists, pageProduct, pageVersion)
})()
