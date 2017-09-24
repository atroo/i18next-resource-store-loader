/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Robert Krüger
*/
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const globAll = require('glob-all');

const loaderUtils = require('loader-utils');

function enumerateLangDirs (dir) {
  return fs.readdirSync(dir).filter(function (file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

//https://github.com/jpillora/node-glob-all#usage
function findAll (globs, cwd) {
  const globArray = (Array.isArray(globs) ? globs : [ globs ])
  return globAll.sync(globArray, { cwd, realpath: true })
}

module.exports = function (indexContent) {
	this.cacheable && this.cacheable();
  const options = loaderUtils.getOptions(this) || {};

	let include;
	if (options.include) {
		include = new RegExp(options.include);
	}
	let exclude;
	if (options.exclude) {
		exclude = new RegExp(options.exclude);
	}

	let baseDirectory = path.dirname(this.resource); // this is the absolute path to the index.js in the top level locales dir
	//let overrideDirectory, overrideBaseDirectory, inOverrideMode = false;
	//if (options.overrideDir) {
	//	if (!options.baseDir) {
	//		throw ("overrideDir can not be used without configuring a base dir");
	//	}
	//	overrideDirectory = path.join(baseDirectory, options.overrideDir);
	//	overrideBaseDirectory = path.join(baseDirectory, options.baseDir);
	//	inOverrideMode = true;
	//}
  //
	//let subdirs, subdirsbase, subdirsoverride;
	//if (!inOverrideMode) {
		subdirs = enumerateLangDirs(baseDirectory);
	//} else {
	//	subdirsbase = enumerateLangDirs(overrideBaseDirectory);
	//	try {
	//		const overriderDir = fs.readdirSync(overrideDirectory);
	//		subdirsoverride = overriderDir.filter(function (file) {
	//			return fs.statSync(path.join(overrideDirectory, file)).isDirectory();
	//		});
	//	} catch (e) {
	//		//if the override dir does not exist we go back to normal mode but on the base path
	//		inOverrideMode = false;
	//		baseDirectory = overrideBaseDirectory;
	//		subdirs = subdirsbase;
	//	}
	//}

	//alls sub directories match to languages
	let resBundle = {}, lang, files, basefiles, overridefiles;
	//const langDirs = inOverrideMode ? subdirsbase : subdirs;
	const langDirs = enumerateLangDirs(baseDirectory)
	for (let i = 0, len = langDirs.length; i < len; i++) {
		//all files within the sub directory map to namespaces
		lang = langDirs[i];
		resBundle[lang] = {};
		//get sub files
		//if (!inOverrideMode) {
			files = fs.readdirSync(path.join(baseDirectory, lang)).filter(function (file) {
				const filePath = path.join(lang, file);
				return fs.statSync(path.join(baseDirectory, lang, file)).isFile() && (!include || include.test(filePath)) && (!(exclude && exclude.test(filePath)));
			});
		//} else {
		//	basefiles = fs.readdirSync(path.join(overrideBaseDirectory, '/', lang)).filter(function (file) {
		//		const filePath = path.join(lang, file);
		//		return fs.statSync(path.join(overrideBaseDirectory, '/', lang, file)).isFile() && (!include || include.test(filePath)) && (!(exclude && exclude.test(filePath)));
		//	});
		//}

		let filename, extname, basename, content, overrideContent, pathstring, overridePathstring, fileData, overrideData, overrideFileExists;
		//const filesToAdd = inOverrideMode ? basefiles : files;
    //const baseDefiningDirectory = inOverrideMode ? overrideBaseDirectory : baseDirectory;
    const filesToAdd = files;
		const baseDefiningDirectory = baseDirectory;
		for (let j = 0, len2 = filesToAdd.length; j < len2; j++) {
			filename = filesToAdd[j];
			pathstring = path.join(baseDefiningDirectory, lang, filename);
			extname = path.extname(pathstring);
			basename = path.basename(pathstring, extname);
			content = fs.readFileSync(pathstring);
			fileData = JSON.parse(content);
			//if (inOverrideMode) {
			//	overrideFileExists = true;
			//	//here we apply the data from the override dir if existent
			//	overridePathstring = path.join(overrideDirectory, '/', lang, filename);
			//	try {
			//		fs.statSync(overridePathstring).isFile();
			//	} catch (e) {
			//		overrideFileExists = false;
			//	}
			//	if (overrideFileExists) {
			//		overrideContent = fs.readFileSync(overridePathstring);
			//		overrideData = JSON.parse(overrideContent);
			//		fileData = _.merge(fileData, overrideData);
			//		this.addDependency(overridePathstring);
			//	}
			//}
			resBundle[lang][basename] = fileData;
			this.addDependency(pathstring);
		}

		//if (!inOverrideMode) {
			this.addContextDependency(path.join(baseDirectory, lang));
		//} else {
		//	this.addContextDependency(path.join(overrideBaseDirectory, lang));
		//	this.addContextDependency(path.join(overrideDirectory, lang));
		//}
	}
	return "module.exports = " + JSON.stringify(resBundle);
}