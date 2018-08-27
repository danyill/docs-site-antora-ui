;(() => {
  'use strict'

  const versionsTrigger = document.querySelector('[data-trigger="versions"]')
  const versionsPopover = document.querySelector('[data-popover="versions"]')

  // this is a plugin https://atomiks.github.io/tippyjs/
  // eslint-disable-next-line no-undef
  tippy(versionsTrigger, {
    duration: [0, 150],
    flip: false,
    html: versionsPopover,
    interactive: true,
    offset: '-40, 5',
    onHide (instance) {
      this.classList.add('hide')
      this.classList.remove('shown')
    },
    onShow (instance) {
      this.classList.remove('hide')
    },
    onShown (instance) {
      this.classList.add('shown')
    },
    placement: 'bottom',
    theme: 'popover-versions',
    trigger: 'click',
    zIndex: 11, // same as z-nav
  })
})()
