Package.describe({
  name: 'webantic:linter',
  version: '1.0.9',
  summary: 'A linter for eslint',
  git: 'https://github.com/webantic/meteor-linter',
  documentation: 'README.md'
})

Package.registerBuildPlugin({
  name: 'linter',
  sources: ['lib/lint_linter.js'],
  npmDependencies: {
    'eslint': '4.3.0',
    'eslint-config-standard': '10.2.1',
    'eslint-plugin-import': '2.7.0',
    'eslint-plugin-meteor': '4.1.6',
    'eslint-plugin-node': '5.1.1',
    'eslint-plugin-promise': '3.5.0',
    'eslint-plugin-standard': '3.0.1',
    'babel-eslint': '7.2.3',
    'babel-preset-env': '1.6.0',
    'babel-preset-es2015': '6.24.1'
  }
})

Npm.depends({
  'eslint': '4.3.0',
  'eslint-config-standard': '10.2.1',
  'eslint-plugin-import': '2.7.0',
  'eslint-plugin-meteor': '4.1.6',
  'eslint-plugin-node': '5.1.1',
  'eslint-plugin-promise': '3.5.0',
  'eslint-plugin-standard': '3.0.1',
  'babel-eslint': '7.2.3',
  'babel-preset-env': '1.6.0',
  'babel-preset-es2015': '6.24.1'
})

Package.onUse(function (api) {
  api.use('isobuild:linter-plugin@1.0.0')
})
