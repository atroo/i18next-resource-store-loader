const path = require('path')
const chai = require('chai')
const loader = require('../index')
const assert = chai.assert

describe('override', function () {
  [ 'yaml', 'json' ].forEach((type) => {
    context(type, () => {
      beforeEach(function (done) {
        //mock webpack loader this scope
        const emptFn = function () {}
        thisScope = {
          addDependency: emptFn,
          addContextDependency: emptFn,
          cacheable: emptFn,
          resource: path.join(__dirname, `./data/override-app-${type}/locales/index.js`)
        }
        done()
      })

      it('should simply be the the app locales', function () {
        const res = loader.call(thisScope, 'index.js')
        const resStore = eval(res)
        assert.strictEqual(resStore.en.foo.test, 'app foo.test en')
        assert.strictEqual(resStore.en.main.sub.subsub.slugslug, 'app sub.subsub.slugsub en')
        assert.strictEqual(resStore[ 'zh-cn' ].foo.test, 'app foo.test zh-cn')
        assert.strictEqual(resStore[ 'zh-cn' ].main.sub.subsub.slugslug, 'app sub.subsub.slugsub zh-cn')
      })

      it('should merge app over any libraries', function () {
        thisScope.query = '?{overrides: ["../node_modules/lib/locales"]}'
        const res = loader.call(thisScope, 'index.js')
        const resStore = eval(res)
        assert.strictEqual(resStore.en.main.sub.test, 'lib sub.test en')
        assert.strictEqual(resStore.en.main.sub.subsub.test, 'lib sub.subsub.test en')
        assert.strictEqual(resStore.en.main.sub.slug, 'app sub.slug en')
        assert.strictEqual(resStore.en.main.sub.subsub.slugslug, 'app sub.subsub.slugsub en')

        assert.strictEqual(resStore[ 'zh-cn' ].main.sub.test, 'lib sub.test zh-cn')
        assert.strictEqual(resStore[ 'zh-cn' ].main.sub.subsub.test, 'lib sub.subsub.test zh-cn')
        assert.strictEqual(resStore[ 'zh-cn' ].main.sub.slug, 'app sub.slug zh-cn')
        assert.strictEqual(resStore[ 'zh-cn' ].main.sub.subsub.slugslug, 'app sub.subsub.slugsub zh-cn')
      })
    })
  })
})