const path = require('path')
const chai = require('chai')
const expect = chai.expect
const loader = require('../../index')

describe("override", function () {
  beforeEach(function (done) {
    //mock webpack loader this scope
    const emptFn = function () {}
    thisScope = {
      addDependency: emptFn,
      addContextDependency: emptFn,
      cacheable: emptFn,
      resource: path.join(__dirname, "../data/override-app/locales/index.js")
    }
    done()
  })

  afterEach(function (done) {
    done()
  })

  it("should generate the structure", function () {
    thisScope.query = '?{overrides: ["../node_modules/lib/locales"]}'
    const res = loader.call(thisScope, "index.js")
    const resStore = eval(res)
    expect(resStore.en).to.be.an('object')
    expect(resStore[ "zh-cn" ]).to.be.an('object')
    expect(resStore.en.main.test).to.be.equal('This is an overridden test!')
    expect(resStore[ "zh-cn" ].main.test).to.be.equal('This is an overridden test!')
  })

  it("should keep the base if not overridden", function () {
    //thisScope.query = '?overrideDir=overrideNotExisting&baseDir=base'
    const res = loader.call(thisScope, "index.js")
    const resStore = eval(res)
    expect(resStore.en).to.be.an('object')
    expect(resStore.en.lonesome.test).to.be.equal('i am lonely')
    expect(resStore[ "zh-cn" ]).to.be.an('object')
    expect(resStore[ "zh-cn" ].lonesome.test).to.be.equal('i am lonely')
  })

  it("should partially override sub-objects", function () {
    thisScope.query = '?{overrides: ["../node_modules/lib/locales"]}'
    const res = loader.call(thisScope, "index.js")
    const resStore = eval(res)
    expect(resStore.en).to.be.an('object')
    expect(resStore.en.main.sub).to.be.an('object')
    expect(resStore.en.main.sub.test).to.be.equal('i stay untouched')
    expect(resStore.en.main.sub.subsub.test).to.be.equal('i stay untouched')
    expect(resStore.en.main.sub.slug).to.be.equal('i am an overridden sub')
    expect(resStore.en.main.sub.subsub.slugslug).to.be.equal('i am an overridden sub sub')

    expect(resStore[ "zh-cn" ]).to.be.an('object')
    expect(resStore[ "zh-cn" ].main.sub).to.be.an('object')
    expect(resStore[ "zh-cn" ].main.sub.test).to.be.equal('i stay untouched')
    expect(resStore[ "zh-cn" ].main.sub.subsub.test).to.be.equal('i stay untouched')
    expect(resStore[ "zh-cn" ].main.sub.slug).to.be.equal('i am an overridden sub')
    expect(resStore[ "zh-cn" ].main.sub.subsub.slugslug).to.be.equal('i am an overridden sub sub')
  })
})