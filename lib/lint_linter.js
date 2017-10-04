// @ts-check
/* globals Npm, Plugin */

var eslint = Npm.require('eslint')
var CLIEngine = eslint.CLIEngine

var CONFIG_FILE = '.eslintrc'
var IGNORE_FILE = '.eslintignore'

// @ts-ignore
Plugin.registerLinter({
  extensions: ['js'],
  filenames: [CONFIG_FILE, IGNORE_FILE]
}, function () {
  var linter = new ESLinter()
  return linter
})

var ESLinter = (function () {
  function ESLinter () {
    this._cache = {}
  }

  ESLinter.prototype.processFilesForPackage = function (files, options) {
    var self = this

    var packageName = files[0].getPackageName()
    if (!this._cache.hasOwnProperty(packageName)) {
      this._cache[packageName] = {
        files: {}
      }
    }
    var cache = this._cache[packageName]

    var config = this.getConfig(packageName, cache, files)
    if (config === false) {
      return
    }

    var ignores = this.getIgnores(packageName, cache, files)

    var cli = new CLIEngine({
      baseConfig: config,
      ignorePattern: ignores
    })

    files.forEach(function (file) {
      var baseName = file.getBasename()
      if (baseName === CONFIG_FILE || baseName === IGNORE_FILE) {
        return
      }

      // skip files we've already linted
      var path = file.getPathInPackage()
      var cacheKey = JSON.stringify([path, file.getArch()])
      if (cache.files.hasOwnProperty(cacheKey) && cache.files[cacheKey].hash === file.getSourceHash()) {
        self.reportErrors(file, cache.files[cacheKey].errors)
        return
      }

      var source = file.getContentsAsString()
      var errors
      try {
        errors = cli.executeOnText(source, path).results || []
      } catch (ex) {
        errors = []
      } finally {
        self.verifyTsCheck(source, errors)
      }

      if (errors.length) {
        self.reportErrors(file, errors)
      }

      cache.files[cacheKey] = {
        errors: errors,
        hash: file.getSourceHash()
      }
    })
  }

  ESLinter.prototype.getConfig = function (packageName, cache, files) {
    var configs = files.filter(function (file) {
      return file.getBasename() === CONFIG_FILE
    })

    if (configs.length > 1) {
      configs[0].error({
        message: 'Found multiple ' + CONFIG_FILE + ' files in package ' + packageName + ': ' +
          configs.map(function (c) { return c.getPathInPackage() }).join(', ')
      })

      return false
    }

    if (configs.length) {
      var newConfigString = configs[0].getContentsAsString()
      if (cache.configString !== newConfigString) {
        // Reset cache
        cache.files = {}
        cache.configString = newConfigString
      }
    } else if (cache.configString !== '{}') {
      // Reset cache
      cache.files = {}
      cache.configString = '{}'
    }

    try {
      var config = JSON.parse(cache.configString)
    } catch (ex) {
      configs[0].error({
        message: 'Failed to parse ' + configs[0].getPathInPackage() + ': not valid JSON: ' + ex.message
      })

      return false
    }

    return config
  }

  ESLinter.prototype.getIgnores = function (packageName, cache, files) {
    var ignoreFiles = files.filter(function (file) {
      return file.getBasename() === IGNORE_FILE
    })

    if (ignoreFiles.length > 1) {
      ignoreFiles[0].error({
        message: 'Found multiple ' + IGNORE_FILE + ' files in package ' + packageName + ': ' +
          ignoreFiles.map(function (c) { return c.getPathInPackage() }).join(', ')
      })

      return false
    }

    if (ignoreFiles.length) {
      var newIgnoreString = ignoreFiles[0].getContentsAsString()
      if (cache.ignoreString !== newIgnoreString) {
        // Reset cache
        cache.files = {}
        cache.ignoreString = newIgnoreString
      }
    } else if (cache.ignoreString !== '') {
      // Reset cache
      cache.files = {}
      cache.ignoreString = ''
    }

    return cache.ignoreString.split('\n').filter(function (element) { return element !== '' })
  }

  ESLinter.prototype.verifyTsCheck = function (source, errors) {
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

  ESLinter.prototype.reportErrors = function (file, errors) {
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

  return ESLinter
})()
