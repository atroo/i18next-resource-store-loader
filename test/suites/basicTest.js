const fs = require('fs');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const loader = require('../../index');

describe("basic", function () {
  [ 'yaml', 'json' ].forEach((type) => {
    context(type, () => {
      beforeEach(function (done) {
        //mock webpack loader this scope
        const emptFn = function () {};
        thisScope = {
          addDependency: emptFn,
          addContextDependency: emptFn,
          cacheable: emptFn,
          resource: path.join(__dirname, `../data/basic-${type}/index.js`)
        }
        done();
      });

      it("should generate a resStore structure", function () {
        const res = loader.call(thisScope, "index.js");
        const resStore = eval(res);
        expect(resStore.dev).to.be.an('object');
        expect(resStore.de).to.be.an('object');
        expect(resStore.en).to.be.an('object');
        expect(resStore.fr).to.be.an('object');
      });

      it("should have the correct sub structures", function () {
        const res = loader.call(thisScope, "index.js");
        const resStore = eval(res);

        expect(resStore.dev.main.test).to.be.a('string');
        expect(resStore.dev.main.test).to.be.equal('Dev dev dev!');

        expect(resStore.de.main.test).to.be.a('string');
        expect(resStore.de.main.test).to.be.equal('Das ist ein Test!');

        expect(resStore.en.main.test).to.be.a('string');
        expect(resStore.en.main.test).to.be.equal('This is a test!');

        expect(resStore.fr.main.test).to.be.a('string');
        expect(resStore.fr.main.test).to.be.equal('Ceci est un test!');
      });

      it("should process include", function () {
        //thisScope.query = '?include=\\.json$';
        thisScope.query = '?{include: ["**/*.json"]}';
        thisScope.addDependency = function (path) {
          expect(path).to.not.contain('main.nonjson');
        };

        const res = loader.call(thisScope, "index.js");
      });

      it("should not process files that are excluded", function () {
        thisScope.query = `?{include: ["**/*.${type}", "!**/exclude.${type}"]}`;
        thisScope.addDependency = function (path) {
          expect(path).to.not.contain('exclude.json');
        };

        const res = loader.call(thisScope, "index.js");
      });
    })
  });
})