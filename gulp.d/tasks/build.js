'use strict'

const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const concat = require('gulp-concat')
const cssnano = require('cssnano')
const fs = require('fs-extra')
const imagemin = require('gulp-imagemin')
const { obj: map } = require('through2')
const merge = require('merge-stream')
const ospath = require('path')
const path = ospath.posix
const postcss = require('gulp-postcss')
const postcssCalc = require('postcss-calc')
const postcssImport = require('postcss-import')
const postcssPresetEnv = require('postcss-preset-env')
const postcssUrl = require('postcss-url')
const uglify = require('gulp-uglify')
const vfs = require('vinyl-fs')

module.exports = (src, dest, preview) => () => {
  const opts = { base: src, cwd: src }
  const postcssPlugins = [
    postcssImport(),
    postcssUrl([
      {
        filter: '**/~typeface-*/files/*',
        url: (asset) => {
          const relpath = asset.pathname.substr(1)
          const abspath = require.resolve(relpath)
          const basename = ospath.basename(abspath)
          const destpath = ospath.join(dest, 'font', basename)
          if (!fs.pathExistsSync(destpath)) fs.copySync(abspath, destpath)
          return path.join('..', 'font', basename)
        },
      },
    ]),
    postcssCalc(),
    postcssPresetEnv({
      autoprefixer: { browsers: ['last 2 versions'] },
      features: {
        'custom-media-queries': true,
        'nesting-rules': true,
      },
    }),
    preview ? () => {} : cssnano({ preset: 'default' }),
  ]

  return merge(
    vfs
      .src('js/+([0-9])-*.js', opts)
      .pipe(uglify())
      .pipe(concat('js/site.js')),
    vfs
      .src('js/vendor/*.js', Object.assign({ read: false }, opts))
      .pipe(
        // see https://gulpjs.org/recipes/browserify-multiple-destination.html
        map((file, enc, next) => {
          if (file.relative.endsWith('.bundle.js')) {
            file.contents = browserify(file.relative, { basedir: src, detectGlobals: false }).bundle()
            file.path = file.path.slice(0, file.path.length - 10) + '.js'
          }
          next(null, file)
        })
      )
      .pipe(buffer())
      .pipe(uglify()),
    vfs
      .src([require.resolve('popper.js/dist/umd/popper.min.js'), require.resolve('tippy.js/umd/index.min.js')], opts)
      .pipe(concat('js/vendor/tippy.js')),
    vfs.src('css/site.css', opts).pipe(postcss(postcssPlugins)),
    vfs.src('font/*.woff*(2)', opts),
    vfs
      .src('img/**/*.{jpg,ico,png,svg}', opts)
      .pipe(
        imagemin([
          imagemin.gifsicle(),
          imagemin.jpegtran(),
          imagemin.optipng(),
          imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
        ])
      ),
    vfs.src('helpers/*.js', opts),
    vfs.src('layouts/*.hbs', opts),
    vfs.src('partials/*.hbs', opts)
  ).pipe(vfs.dest(dest))
}
