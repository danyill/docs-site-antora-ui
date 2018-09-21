;(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body
    const navToggle = body.querySelectorAll('.js-nav-toggle')
    const nav = body.querySelector('.js-nav')
    const backdrop = document.querySelector('.modal-backdrop')

    const openNav = (e) => {
      clickThru(e)
      nav.classList.add('active')
      body.classList.add('no-scroll', 'mobile')
      backdrop.classList.add('show', 'mobile')
    }

    const closeNav = () => {
      nav.classList.remove('active')
      body.classList.remove('no-scroll', 'mobile')
      backdrop.classList.remove('show', 'mobile')
    }

    const clickThru = (e) => {
      e.stopPropagation()
      // don't prevent link behavior if this is a link
      if (!e.target.href) e.preventDefault()
    }

    // navtoggle listeners
    for (let i = 0; i < navToggle.length; i++) {
      navToggle[i].addEventListener('click', openNav)
      navToggle[i].addEventListener('touchend', openNav)
    }

    // body listener
    body.addEventListener('click', closeNav)
    body.addEventListener('touchend', closeNav)

    // prevent clicks on nav from closing
    nav.addEventListener('click', clickThru)
    nav.addEventListener('touchend', clickThru)
  })
})()
