Package.describe({
  name: 'webantic:linter',
  version: '2.0.0',
  summary: 'A linter for eslint',
  git: 'https://github.com/webantic/meteor-linter',
  documentation: 'README.md'
})

Package.registerBuildPlugin({
  name: 'linter',
  sources: ['lib/lint_linter.js'],
  npmDependencies: {
    'eslint': '4.19.1',
    'eslint-config-standard': '11.0.0',
    'eslint-plugin-import': '2.12.0',
    'eslint-plugin-meteor': '4.2.2',
    'eslint-plugin-node': '6.0.1',
    'eslint-plugin-promise': '3.7.0',
    'eslint-plugin-standard': '3.1.0',
    'babel-eslint': '8.2.3'
  }
})

Npm.depends({
  'eslint': '4.19.1',
  'eslint-config-standard': '11.0.0',
  'eslint-plugin-import': '2.12.0',
  'eslint-plugin-meteor': '4.2.2',
  'eslint-plugin-node': '6.0.1',
  'eslint-plugin-promise': '3.7.0',
  'eslint-plugin-standard': '3.1.0',
  'babel-eslint': '8.2.3'
})

Package.onUse(function (api) {
  api.use('isobuild:linter-plugin@1.0.0')
})
