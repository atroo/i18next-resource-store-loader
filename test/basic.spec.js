const path = require('path')
const chai = require('chai')
const assert = chai.assert
const loader = require('../index')

describe('basic', function () {
  [ 'yaml', 'json' ].forEach((type) => {
    context(type, () => {
      beforeEach(function (done) {
        //mock webpack loader this scope
        const emptFn = function () {}
        thisScope = {
          addDependency: emptFn,
          addContextDependency: emptFn,
          cacheable: emptFn,
          resource: path.join(__dirname, `./data/basic-app-${type}/locales/index.js`)
        }
        done()
      })

      function assertCommon (resStore) {
        assert.strictEqual(resStore.dev.main.test, 'Dev dev dev!')
        assert.strictEqual(resStore.de.main.test, 'Das ist ein Test!')
        assert.strictEqual(resStore.en.main.test, 'This is a test!')
        assert.strictEqual(resStore.fr.main.test, 'Ceci est un test!')
      }

      it('should generate the structure', function () {
        const res = loader.call(thisScope, 'index.js')
        const resStore = eval(res)
        assertCommon(resStore)
      })

      it('should process include', function () {
        thisScope.query = `?{include: ['**/*.json']}`
        thisScope.addDependency = function (path) {
          assert.notInclude(path, 'main.nonjson')
        }

        const res = loader.call(thisScope, 'index.js')
      })

      it('should not process files that are excluded', function () {
        thisScope.query = `?{include: ['**/*.${type}', '!**/exclude.${type}']}`
        thisScope.addDependency = function (path) {
          assert.notInclude(path, 'exclude.json')
        }

        const res = loader.call(thisScope, 'index.js')
        const resStore = eval(res)
        assert.strictEqual(resStore.de.main.foo, undefined)
        assertCommon(resStore)
      })
    })
  })
})