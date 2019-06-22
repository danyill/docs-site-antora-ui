;(function () {
  'use strict'

  function buildNav (nav, data, page, path) {
    var groupList = document.createElement('ol')
    groupList.className = 'nav-list'
    var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chevron.setAttribute('class', 'svg') // className property is read-only on an SVG
    chevron.setAttribute('viewBox', '0 0 30 30')
    chevron.setAttribute('width', '30')
    chevron.setAttribute('height', '30')
    var chevronPath = document.createElementNS(chevron.namespaceURI, 'path')
    chevronPath.setAttribute(
      'd',
      'M15.003 21.284L6.563 9.232l1.928-.516 6.512 9.299 6.506-9.299 1.928.516-8.434 12.052z'
    )
    chevron.appendChild(chevronPath)
    var pageGroup, pageGroupItem
    data.splice(0, data.length).forEach(function (group) {
      var groupItem = document.createElement('li')
      var active, groupData
      if ((pageGroup = group.name === page.product)) {
        pageGroupItem = groupItem
        !path.active.length && group.url === page.url && (active = true) && path.active.push(groupItem)
      } else {
        groupData = JSON.stringify(group)
      }
      groupItem.className = active ? 'nav-li active' : 'nav-li'
      groupItem.dataset.depth = 0
      groupItem.dataset.product = group.name
      var groupHeading = document.createElement('div')
      groupHeading.className = 'flex align-center justify-justified'
      var groupLink = document.createElement('a')
      groupLink.className = 'flex grow strong link nav-link nav-heading'
      var groupIcon = document.createElement('img')
      groupIcon.className = 'icon no-pointer'
      groupIcon.src = page.uiRootPath + '/img/icons/' + group.name + '.svg'
      groupLink.appendChild(groupIcon)
      groupLink.appendChild(document.createTextNode(' ' + group.title))
      groupHeading.appendChild(groupLink)
      if (group.versions.length > 1) {
        var currentVersion = group.versions[0].version
        var versionButton = document.createElement('button')
        versionButton.className = 'flex align-center shrink button versions'
        versionButton.dataset.product = group.name
        var versionLabel = document.createElement('span')
        versionLabel.className = 'version-label'
        versionLabel.appendChild(document.createTextNode(currentVersion))
        versionButton.appendChild(versionLabel)
        versionButton.appendChild(document.createTextNode(' '))
        versionButton.appendChild(chevron.cloneNode(true))
        var versionMenu = document.createElement('div')
        versionMenu.className = 'popover version-popover'
        var currentVersionList = document.createElement('ol')
        currentVersionList.className = 'ol'
        var currentVersionHeading = document.createElement('li')
        currentVersionHeading.className = 'li-heading'
        currentVersionHeading.appendChild(document.createTextNode('Current version'))
        currentVersionList.appendChild(currentVersionHeading)
        var currentVersionItem = document.createElement('li')
        currentVersionItem.className = 'flex align-center justify-justified li version'
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
        group.versions.forEach(function (version, versionIdx) {
          if (versionIdx) {
            var previousVersionItem = document.createElement('li')
            previousVersionItem.className = 'flex align-center justify-justified li version'
            previousVersionItem.dataset.product = group.name
            previousVersionItem.dataset.version = version.version
            previousVersionItem.appendChild(document.createTextNode(version.version))
            previousVersionsList.appendChild(previousVersionItem)
          }
          versionMenu.appendChild(previousVersionsList)
        })
        versionButton.appendChild(versionMenu)
        groupHeading.appendChild(versionButton)
        setPinnedVersion(versionButton, group.name, undefined, groupItem)
        if (pageGroup) {
          initVersionSelector(versionButton, versionMenu)
        } else {
          var buildNavForGroupAndInitVersionSelector = function () {
            versionButton.removeEventListener('click', buildNavForGroupAndInitVersionSelector)
            versionButton.removeEventListener('touchend', buildNavForGroupAndInitVersionSelector)
            buildNavForGroupLazy(groupData)
            initVersionSelector(versionButton, versionMenu, true)
          }
          versionButton.addEventListener('click', buildNavForGroupAndInitVersionSelector)
          versionButton.addEventListener('touchend', buildNavForGroupAndInitVersionSelector)
        }
      }
      groupItem.appendChild(groupHeading)
      if (pageGroup) {
        groupLink.addEventListener('click', toggleNav)
        groupLink.addEventListener('touchend', toggleNav)
        buildNavForGroup(nav, groupItem, group, page, { active: path.active, current: [groupItem] })
        initVersionSelector(versionButton, versionMenu)
      } else {
        var buildNavForGroupAndToggle = function (e) {
          groupLink.removeEventListener('click', buildNavForGroupAndToggle)
          groupLink.removeEventListener('touchend', buildNavForGroupAndToggle)
          buildNavForGroupLazy(groupData)
          toggleNav(e)
          groupLink.addEventListener('click', toggleNav)
          groupLink.addEventListener('touchend', toggleNav)
        }
        groupLink.addEventListener('click', buildNavForGroupAndToggle)
        groupLink.addEventListener('touchend', buildNavForGroupAndToggle)
      }
      groupList.appendChild(groupItem)
    })
    nav.appendChild(groupList)
    // NOTE we could do this when navigation is built if we appended children to parent eagerly
    if (path.active.length) {
      path.active.forEach(function (it) {
        it.classList.add('active')
        if (it.parentNode.classList.contains('parent')) it.parentNode.style.display = ''
      })
    } else {
      pageGroupItem.classList.add('active')
    }
  }

  function buildNavForGroupLazy (groupData) {
    var nav = getNav()
    var start = +new Date()
    var group = JSON.parse(groupData)
    console.log(+new Date() - start)
    var groupItem = nav.querySelector('.nav-li[data-product="' + group.name + '"]')
    buildNavForGroup(nav, groupItem, group, getPage())
  }

  function buildNavForGroup (nav, groupItem, group, page, path) {
    if (groupItem.classList.contains('loaded')) return
    groupItem.classList.add('loaded')
    group.versions.forEach(function (version) {
      // NOTE we're only considering the items in the first menu
      var items = ((version.sets || [])[0] || {}).items || []
      if (items.length) buildNavTree(nav, groupItem, group.name, version.version, items, 1, page, path)
    })
  }

  function buildNavTree (nav, parent, group, version, items, level, page, path) {
    var navList = document.createElement('ol')
    navList.className = 'nav-list parent'
    if (level === 1) {
      if (!(group === page.product && version === page.version)) navList.style.display = 'none'
      navList.dataset.product = group
      navList.dataset.version = version
    } else if (!parent.classList.contains('active')) {
      navList.style.display = 'none'
    }
    items.forEach(function (item) {
      var navItem = document.createElement('li')
      var active
      if (path && !path.active.length && item.url === page.url && group === page.product && version === page.version) {
        active = true
        path.current.concat(navItem).forEach(function (activeItem) { path.active.push(activeItem) })
      }
      navItem.className = active ? 'nav-li active' : 'nav-li'
      navItem.dataset.depth = level
      if (item.items) {
        var navToggle = document.createElement('button')
        navToggle.className = 'subnav-toggle'
        navItem.appendChild(navToggle)
        navToggle.addEventListener('click', toggleSubnav)
        navToggle.addEventListener('touchend', toggleSubnav)
      }
      if (item.url) {
        var navLink = document.createElement('a')
        navLink.className =
          'flex shrink align-center link nav-link' +
          (active ? ' active' : '') +
          (item.items ? ' nav-nested' : '')
        if (item.urlType === 'external') {
          navLink.href = item.url
          navLink.target = '_blank'
        } else {
          navLink.href = relativize(page.url, item.url)
        }
        navLink.innerHTML = item.content
        navItem.appendChild(navLink)
      } else {
        var navHeading = document.createElement('span')
        navHeading.className = 'flex grow align-center nav-heading' + (item.items ? ' nav-nested' : '')
        var navHeadingSpan = document.createElement('span')
        navHeadingSpan.className = 'span'
        navHeadingSpan.innerHTML = item.content
        navHeading.appendChild(navHeadingSpan)
        navItem.appendChild(navHeading)
      }
      if (item.items) {
        buildNavTree(nav, navItem, group, version, item.items, level + 1, page, path && {
          active: path.active,
          current: path.current.concat(navItem),
        })
      }
      navList.appendChild(navItem)
    })
    return parent.appendChild(navList)
  }

  function toggleNav (e, thisProduct, thisVersion, nav) {
    nav = nav || getNav()
    var thisList, groupItem
    if (!e) { // on page load (when navigating from the location bar)
      if (thisProduct) {
        var listQuery = '.nav-list[data-product="' + thisProduct + '"]'
        var productVersionSelector = nav.querySelector('button[data-product="' + thisProduct + '"]')
        if (productVersionSelector) {
          setPinnedVersion(productVersionSelector, thisProduct, thisVersion)
          listQuery += '[data-version="' + thisVersion + '"]'
        }
        thisList = nav.querySelector(listQuery)
        scrollToActive(nav, thisList)
        // NOTE scroll to active again on load in case images shifted the layout
        window.addEventListener('load', function scrollToActiveOnLoad () {
          window.removeEventListener('load', scrollToActiveOnLoad)
          scrollToActive(nav, thisList)
        })
      }
      nav.querySelector('.nav-list').classList.add('loaded')
    } else if (e.target.classList.contains('nav-link')) { // when toggling a group in the sidebar
      var groupHeadingWrapper = e.target.parentNode
      groupItem = groupHeadingWrapper.parentNode
      var pinnedNavList =
        groupItem.querySelector('.nav-list[data-version="' + groupItem.dataset.pinnedVersion + '"]') ||
        groupHeadingWrapper.nextElementSibling
      pinnedNavList.style.display = groupItem.classList.toggle('active') ? '' : 'none'
      tippy.hideAll()
      window.analytics && window.analytics.track('Toggled Nav', { url: e.target.innerText.trim() })
    } else if (thisProduct && thisVersion) { // when changing the selected version
      groupItem = nav.querySelector('.nav-li[data-product="' + thisProduct + '"]')
      var navLists = groupItem.querySelectorAll('.nav-list')
      for (var i = 0, l = navLists.length; i < l; i++) navLists[i].style.display = 'none'
      groupItem.querySelector('.nav-list[data-version="' + thisVersion + '"]').style.display = ''
      groupItem.classList.add('active')
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

  function scrollToActive (nav, thisList) {
    var focusElement = thisList.querySelector('.nav-link.active') || thisList.previousSibling
    var navRect = nav.getBoundingClientRect()
    var midpoint = (navRect.height - navRect.top) / 2
    var adjustment = focusElement.offsetTop + focusElement.offsetHeight / 2 - midpoint
    if (adjustment > 0) nav.scrollTop = adjustment
  }

  function setPinnedVersion (thisTrigger, thisProduct, thisVersion, groupItem) {
    var analytics
    if (thisVersion) {
      localStorage.setItem('ms-docs-' + thisProduct, thisVersion)
      analytics = window.analytics
    } else if (!(thisVersion = localStorage.getItem('ms-docs-' + thisProduct))) {
      return
    }
    (groupItem || thisTrigger.parentNode.parentNode).dataset.pinnedVersion = thisVersion
    thisTrigger.querySelector('.version-label').textContent = thisVersion
    analytics && analytics.track('Version Pinned', { product: thisProduct, version: thisVersion })
  }

  function initVersionSelector (versionButton, versionMenu, show) {
    return tippy(versionButton, {
      content: versionMenu,
      role: 'menu',
      duration: [0, 150],
      flip: false,
      interactive: true,
      showOnInit: show,
      offset: '-40, 5',
      onHide: function (instance) {
        instance.popper.classList.add('hide')
        instance.popper.classList.remove('shown')
      },
      onHidden: function (instance) {
        unbindVersionEvents(instance.popper)
      },
      onShow: function (instance) {
        instance.hide()
        instance.popper.classList.remove('hide')
      },
      onShown: function (instance) {
        bindVersionEvents(instance.popper)
        instance.popper.classList.add('shown')
      },
      placement: 'bottom',
      theme: 'popover-versions',
      touchHold: true, // maps touch as click (for some reason)
      trigger: 'click',
      zIndex: 14, // same as z-nav-mobile
    })
  }

  function switchVersion (e) {
    var thisTippy = document.querySelector('.tippy-popper')._tippy
    var thisProduct = e.target.dataset.product
    var thisVersion = e.target.dataset.version
    setPinnedVersion(thisTippy.reference, thisProduct, thisVersion)
    toggleNav(e, thisProduct, thisVersion)
    thisTippy.hide()
    cancelEvent(e)
  }

  function bindVersionEvents (popover) {
    var versions = popover.querySelectorAll('.version')
    for (var i = 0, l = versions.length; i < l; i++) {
      versions[i].addEventListener('click', switchVersion)
      versions[i].addEventListener('touchend', cancelEvent)
    }
  }

  function unbindVersionEvents (popover) {
    var versions = popover.querySelectorAll('.version')
    for (var i = 0, l = versions.length; i < l; i++) {
      versions[i].removeEventListener('click', switchVersion)
      versions[i].removeEventListener('touchend', cancelEvent)
    }
  }

  function cancelEvent (e) {
    e.stopPropagation()
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
      return (
        (computeRelativePath(from.slice(0, from.lastIndexOf('/')), to) || '.') +
        (to.charAt(to.length - 1) === '/' ? '/' + hash : hash)
      )
    }
  }

  function computeRelativePath (from, to) {
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

  function getPage () {
    var pageProductMeta, head
    if ((pageProductMeta = (head = document.head).querySelector('meta[name=page-component]'))) {
      return {
        product: pageProductMeta.getAttribute('content'),
        version: head.querySelector('meta[name=page-version]').getAttribute('content'),
        url: head.querySelector('meta[name=page-url]').getAttribute('content'),
        uiRootPath: document.getElementById('site-script').dataset.uiRootPath,
      }
    }
  }

  function getNav () {
    return document.querySelector('nav.nav')
  }

  var page = getPage()
  if (page) {
    var nav = getNav()
    buildNav(nav, window.siteNavigationData || [], page, { active: [], current: [] })
    toggleNav(undefined, page.product, page.version, nav)
  }
})()
