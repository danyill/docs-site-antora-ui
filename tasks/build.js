'use strict'

const babel = require('gulp-babel')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const concat = require('gulp-concat')
const cssnano = require('cssnano')
const fs = require('fs')
const imagemin = require('gulp-imagemin')
const map = require('map-stream')
const merge = require('merge-stream')
const mkdirp = require('mkdirp')
const path = require('path')
const postcss = require('gulp-postcss')
const postcssCalc = require('postcss-calc')
const postcssPresetEnv = require('postcss-preset-env')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')
const uglify = require('gulp-uglify')
const vfs = require('vinyl-fs')

module.exports = (src, dest, preview) => {
  const opts = { base: src, cwd: src }
  const postcssPlugins = [
    postcssImport(),
    postcssUrl([
      {
        filter: '**/~typeface-*/files/*',
        url: (asset) => {
          const relpath = asset.pathname.substr(1)
          const abspath = path.resolve('node_modules', relpath)
          const basename = path.basename(abspath)
          const destpath = path.join(dest, 'font', basename)
          if (!fs.existsSync(destpath)) {
            const dirname = path.dirname(destpath)
            if (!fs.existsSync(dirname)) {
              mkdirp.sync(dirname)
            }
            fs.copyFileSync(abspath, destpath)
          }
          return path.join('..', 'font', basename)
        },
      },
    ]),
    postcssCalc(),
    postcssPresetEnv({
      autoprefixer: {
        browsers: ['last 2 versions'],
      },
      features: {
        'custom-media-queries': true,
        'nesting-rules': true,
      },
    }),
    cssnano({ preset: 'default' }),
  ]

  return merge([
    vfs
      .src('js/+([0-9])-*.js', opts)
      .pipe(babel({
        babelrc: false,
        presets: ['@babel/env'],
      }))
      // .pipe(uglify())
      .pipe(concat('js/site.js')),

    vfs
      .src('js/vendor/highlight.js', Object.assign({ read: false }, opts))
      .pipe(
        // see https://gulpjs.org/recipes/browserify-multiple-destination.html
        map((file, next) => {
          file.contents = browserify(file.relative, { basedir: src, detectGlobals: false }).bundle()
          next(null, file)
        })
      )
      .pipe(buffer())
      .pipe(uglify()),

    vfs.src('js/vendor/*.min.js', opts),

    vfs.src('css/site.css', opts).pipe(postcss(postcssPlugins)),

    vfs.src('css/vendor/*.css', opts),

    vfs.src('font/*.woff*(2)', opts),

    vfs.src('img/**/*.{jpg,ico,png,svg}', opts).pipe(imagemin([
      imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
    ])),

    vfs.src('*.{html,yml}', opts),

    vfs.src('helpers/*.js', opts),

    vfs.src('layouts/*.hbs', opts),

    vfs.src('partials/*.hbs', opts),

  ]).pipe(vfs.dest(dest))
}
