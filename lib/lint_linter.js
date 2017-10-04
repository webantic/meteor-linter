// @ts-check
/* globals Npm, Plugin */

debugger

var eslint = Npm.require('eslint')
var CLIEngine = eslint.CLIEngine
var cli = new CLIEngine({})

var CONFIG_FILES = ['.eslintrc', '.eslintignore']

// @ts-ignore
Plugin.registerLinter({
  extensions: ['js'],
  filenames: CONFIG_FILES
}, function () {
  var linter = new ESLinter()
  return linter
})

function ESLinter () {
  this._cache = {}
}

ESLinter.prototype.processFilesForPackage = function (files, options) {
  // Assumes that this method gets called once per package.
  var packageName = files[0].getPackageName()
  if (!this._cache.hasOwnProperty(packageName)) {
    this._cache[packageName] = {
      files: {}
    }
  }

  var cache = this._cache[packageName]

  files.forEach(function (file) {
    var baseName = file.getBasename()
    if (CONFIG_FILES.indexOf(baseName) !== -1) {
      return
    }

    // skip files we've already linted
    var path = file.getPathInPackage()
    var cacheKey = JSON.stringify([path, file.getArch()])
    if (cache.files.hasOwnProperty(cacheKey) && cache.files[cacheKey].hash === file.getSourceHash()) {
      reportErrors(file, cache.files[cacheKey].errors)
      return
    }

    var source = file.getContentsAsString()
    var errors
    try {
      errors = cli.executeOnText(source, path).results || []
    } catch (ex) {
      errors = []
    } finally {
      verifyTsCheck(source, errors)
    }

    if (errors.length) {
      reportErrors(file, errors)
    }

    cache.files[cacheKey] = {
      errors: errors,
      hash: file.getSourceHash()
    }
  })

  function verifyTsCheck (source, errors) {
    if (source.indexOf('// @ts-check')) {
      if (!errors.length) {
        errors.push({messages: []})
      }
      errors[errors.length - 1].errorCount++
      errors[errors.length - 1].messages.push({
        message: 'file does not start with "// @ts-check"',
        line: 1,
        column: 1
      })
    }
  }

  function reportErrors (file, errors) {
    errors.forEach(function (result) {
      if (result.errorCount) {
        result.messages.forEach(function (message) {
          file.error({
            message: message.message,
            line: message.line,
            column: message.column
          })
        })
      }
    })
  }
}
