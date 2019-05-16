;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelectorAll('.js-nav-toggle')
    const nav = document.querySelector('.js-nav')
    const backdrop = document.querySelector('.modal-backdrop')

    const openNav = (e) => {
      clickThru(e)
      nav.classList.add('active')
      document.body.classList.add('no-scroll', 'mobile')
      backdrop.classList.add('show', 'mobile')
    }

    const closeNav = (e) => {
      nav.classList.remove('active')
      document.body.classList.remove('no-scroll', 'mobile')
      backdrop.classList.remove('show', 'mobile')
    }

    const clickThru = (e) => {
      e.stopPropagation()
      // don't prevent link behavior if this is a link
      if (!e.target.href) e.preventDefault()
    }

    for (let i = 0; i < navToggle.length; i++) {
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
