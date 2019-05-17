;(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    var navToggle = document.querySelectorAll('.js-nav-toggle')
    var nav = document.querySelector('.js-nav')
    var backdrop = document.querySelector('.modal-backdrop')

    var openNav = function (e) {
      clickThru(e)
      nav.classList.add('active')
      document.body.classList.add('no-scroll', 'mobile')
      backdrop.classList.add('show', 'mobile')
    }

    var closeNav = function (e) {
      nav.classList.remove('active')
      document.body.classList.remove('no-scroll', 'mobile')
      backdrop.classList.remove('show', 'mobile')
    }

    var clickThru = function (e) {
      e.stopPropagation()
      // don't prevent link behavior if this is a link
      if (!e.target.href) e.preventDefault()
    }

    for (var i = 0; i < navToggle.length; i++) {
      navToggle[i].addEventListener('click', openNav)
      navToggle[i].addEventListener('touchend', openNav)
    }

    document.body.addEventListener('click', closeNav)
    document.body.addEventListener('touchend', closeNav)

    // prevent clicks inside nav from closing nav
    nav.addEventListener('click', clickThru)
    nav.addEventListener('touchend', clickThru)
  })
})()
