const path = require('path')
const chai = require('chai')
const expect = chai.expect
const loader = require('../index')

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
        expect(resStore.en.foo.test).to.be.equal('app foo.test en')
        expect(resStore.en.main.sub.subsub.slugslug).to.be.equal('app sub.subsub.slugsub en')
        expect(resStore[ 'zh-cn' ].foo.test).to.be.equal('app foo.test zh-cn')
        expect(resStore[ 'zh-cn' ].main.sub.subsub.slugslug).to.be.equal('app sub.subsub.slugsub zh-cn')
      })

      it('should merge app over any libraries', function () {
        thisScope.query = '?{overrides: ["../node_modules/lib/locales"]}'
        const res = loader.call(thisScope, 'index.js')
        const resStore = eval(res)
        expect(resStore.en.main.sub.test).to.be.equal('lib sub.test en')
        expect(resStore.en.main.sub.subsub.test).to.be.equal('lib sub.subsub.test en')
        expect(resStore.en.main.sub.slug).to.be.equal('app sub.slug en')
        expect(resStore.en.main.sub.subsub.slugslug).to.be.equal('app sub.subsub.slugsub en')

        expect(resStore[ 'zh-cn' ].main.sub.test).to.be.equal('lib sub.test zh-cn')
        expect(resStore[ 'zh-cn' ].main.sub.subsub.test).to.be.equal('lib sub.subsub.test zh-cn')
        expect(resStore[ 'zh-cn' ].main.sub.slug).to.be.equal('app sub.slug zh-cn')
        expect(resStore[ 'zh-cn' ].main.sub.subsub.slugslug).to.be.equal('app sub.subsub.slugsub zh-cn')
      })
    })
  })
})