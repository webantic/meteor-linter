Package.describe({
  name: 'webantic:linter',
  version: '1.0.2',
  summary: 'A linter for eslint',
  git: 'https://github.com/webantic/meteor-linter',
  documentation: 'README.md'
})

Package.registerBuildPlugin({
  name: 'linter',
  sources: ['lib/lint_linter.js'],
  npmDependencies: {
    'eslint': '4.3.0'
  }
})

Npm.depends({
  'eslint': '4.3.0'
})

Package.onUse(function (api) {
  api.use('isobuild:linter-plugin@1.0.0')
})
