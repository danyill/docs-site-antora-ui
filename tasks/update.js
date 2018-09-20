'use strict'
const https = require('https')
const fs = require('fs')

const headerPath = 'https://www.mulesoft.com/api/header?searchbox=false'
const headerFileName = 'header.hbs'
const footerPath = 'https://www.mulesoft.com/api/footer'
const footerFileName = 'footer-content.hbs'
const dependencies = 'https://www.mulesoft.com/api/dependencies'

function getHbs (url, fileName) {
  https.get(url, function (response) {
    let body = ''
    response.on('data', function (d) {
      body += d
    })
    response.on('end', function () {
      const parsed = JSON.parse(body).data
      fs.writeFileSync('src/partials/' + fileName, parsed)
    })
  })
};

function getDependencies (url, type) {
  https.get(url, function (response) {
    let body = ''
    response.on('data', function (d) {
      body += d
    })
    response.on('end', function () {
      const parsed = JSON.parse(body).data
      let styleLink = ''
      let scriptLink = ''
      for (let i = 0; i < parsed.styles.length; i++) {
        styleLink += `<link rel="stylesheet" href="${parsed.styles[i]}" type="text/css">`
      }
      for (let i = 0; i < parsed.scripts.length; i++) {
        scriptLink += `<script src="${parsed.scripts[i]}"></script>`
      }
      fs.writeFileSync('src/partials/marketing-scripts.hbs', scriptLink)
      fs.writeFileSync('src/partials/marketing-styles.hbs', styleLink)
    })
  })
};

module.exports = () => {
  getHbs(headerPath, headerFileName)
  getHbs(footerPath, footerFileName)
  getDependencies(dependencies)
}
