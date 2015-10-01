var fs = require('fs');
var path = require('path');

var chai = require('chai');
var expect = chai.expect;

var loader = require('../../index');

describe("i18next loader basic testing", function () {
    // <SETUP> ///////////////////////////////////////
    beforeEach(function (done) {
        //mock webpack loader this scope
        var emptFn = function () {};
        thisScope = {
            addDependency: emptFn,
            addContextDependency: emptFn,
            cacheable: emptFn,
            resource: path.join(__dirname, "../data/i18n/index.js")
        }
        done();
    });

    afterEach(function (done) {
        done();
    });
    // </SETUP> ///////////////////////////////////////


    // <TESTS> ///////////////////////////////////////
    it("should generate a resStore structure", function () {
        var res = loader.call(thisScope, "index.js");
        var resStore = eval(res);
        expect(resStore.dev).to.be.an('object');
        expect(resStore.de).to.be.an('object');
        expect(resStore.en).to.be.an('object');
        expect(resStore.fr).to.be.an('object');
    });

    it("should have the correct sub structures", function () {
        var res = loader.call(thisScope, "index.js");
        var resStore = eval(res);

        expect(resStore.dev.main.test).to.be.a('string');
        expect(resStore.dev.main.test).to.be.equal('Dev dev dev!');

        expect(resStore.de.main.test).to.be.a('string');
        expect(resStore.de.main.test).to.be.equal('Das ist ein Test!');

        expect(resStore.en.main.test).to.be.a('string');
        expect(resStore.en.main.test).to.be.equal('This is a test!');

        expect(resStore.fr.main.test).to.be.a('string');
        expect(resStore.fr.main.test).to.be.equal('Ceci est un test!');
    });

    it("should process files that satisfy regular expression from include parameter", function () {
        thisScope.query = '?include=\\.json$';
        thisScope.addDependency = function(path) {
            expect(path).to.not.contain('main.nonjson');
        };

        var res = loader.call(thisScope, "index.js");
    });

    it("should not process files that satisfy regular expression from exclude parameter", function () {
        thisScope.query = '?exclude=\\.nonjson$';
        thisScope.addDependency = function(path) {
            expect(path).to.not.contain('main.nonjson');
        };

        var res = loader.call(thisScope, "index.js");
    });
});
