var fs = require('fs');
var path = require('path');

var chai = require('chai');
var expect = chai.expect;

var loader = require('../../index');

describe("i18next loader override testing", function () {
	// <SETUP> ///////////////////////////////////////
	beforeEach(function (done) {
		//mock webpack loader this scope
		var emptFn = function () {};
		thisScope = {
			addDependency: emptFn,
			addContextDependency: emptFn,
			cacheable: emptFn,
			resource: path.join(__dirname, "../data/i18nOverride/index.js")
		}
		done();
	});

	afterEach(function (done) {
		done();
	});
	// </SETUP> ///////////////////////////////////////


	// <TESTS> ///////////////////////////////////////
	it("should generate a resStore structure", function () {
		thisScope.query = '?overrideDir=override&baseDir=base';
		var res = loader.call(thisScope, "index.js");
		var resStore = eval(res);
		expect(resStore.en).to.be.an('object');
		expect(resStore.en.main.test).to.be.equal('This is an overridden test!');
	});

	it("should not fail if the proided override dir does not exist", function () {
		thisScope.query = '?overrideDir=overrideNotExisting&baseDir=base';
		var res = loader.call(thisScope, "index.js");
		var resStore = eval(res);
		expect(resStore.en).to.be.an('object');
		expect(resStore.en.main.test).to.be.equal('This is a test!');
	});

	it("if there is not corresponding override folder just keep the base", function () {
		thisScope.query = '?overrideDir=overrideNotExisting&baseDir=base';
		var res = loader.call(thisScope, "index.js");
		var resStore = eval(res);
		expect(resStore.en).to.be.an('object');
		expect(resStore.en.lonesome.test).to.be.equal('i am lonley');
	});

	it("it should parcially override subobjects", function () {
		thisScope.query = '?overrideDir=override&baseDir=base';
		var res = loader.call(thisScope, "index.js");
		var resStore = eval(res);
		expect(resStore.en).to.be.an('object');
		expect(resStore.en.main.sub).to.be.an('object');
		expect(resStore.en.main.sub.test).to.be.equal('i stay untouched');
		expect(resStore.en.main.sub.subsub.test).to.be.equal('i stay untouched');
		expect(resStore.en.main.sub.slug).to.be.equal('i am an overridden sub');
		expect(resStore.en.main.sub.subsub.slugslug).to.be.equal('i am an overridden sub sub');
	});
});