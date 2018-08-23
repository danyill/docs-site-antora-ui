document.addEventListener('DOMContentLoaded', () => {
  const body = document.body
  const navToggle = body.querySelectorAll('.js-nav-toggle')
  const nav = body.querySelector('.js-nav')

  const openNav = (e) => {
    clickThru(e)
    nav.classList.add('active')
    body.classList.add('no-scroll')
  }

  const closeNav = () => {
    nav.classList.remove('active')
    body.classList.remove('no-scroll')
  }

  const clickThru = (e) => e.stopPropagation()

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
