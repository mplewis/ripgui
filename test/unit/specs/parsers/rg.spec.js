import { stripIndent } from 'common-tags'

import parse from '@/parsers/rg'

describe('parse', function () {
  context('with no input', function () {
    const input = '\n'

    it('returns an empty array', function () {
      expect(parse(input)).to.eql([])
    })
  })

  context('with multiple items', function () {
    const input = stripIndent`
      package.json-96-    "eslint-plugin-standard": "^3.0.1",
      package.json:97:    "eslint-plugin-vue": "^4.0.0-beta.0",
      package.json-98-    "extract-text-webpack-plugin": "^3.0.0",
      --
      README.md-27-
      README.md:28:This project was generated with electron-vue.
      --
      test/unit/index.js:1:import Vue from 'vue'
      test/unit/index.js-2-Vue.config.devtools = false
    `

    it('returns parsed results for each file', function () {
      expect(parse(input)).to.eql([
        {
          file: 'package.json',
          lines: [
            {
              num: 96,
              exact: false,
              content: '    "eslint-plugin-standard": "^3.0.1",'
            },
            {
              num: 97,
              exact: true,
              content: '    "eslint-plugin-vue": "^4.0.0-beta.0",'
            },
            {
              num: 98,
              exact: false,
              content: '    "extract-text-webpack-plugin": "^3.0.0",'
            }
          ]
        },
        {
          file: 'README.md',
          lines: [
            { num: 27, exact: false, content: '' },
            {
              num: 28,
              exact: true,
              content: 'This project was generated with electron-vue.'
            }
          ]
        },
        {
          file: 'test/unit/index.js',
          lines: [
            { num: 1, exact: true, content: "import Vue from 'vue'" },
            { num: 2, exact: false, content: 'Vue.config.devtools = false' }
          ]
        }
      ])
    })
  })
})
