/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Robert Krüger
*/
var path = require("path");
var fs = require("fs");
var _ = require("lodash");

var loaderUtils = require('loader-utils');

module.exports = function (indexContent) {
	this.cacheable && this.cacheable();

	var options = loaderUtils.parseQuery(this.query);

	var include;
	if (options.include) {
		include = new RegExp(options.include);
	}
	var exclude;
	if (options.exclude) {
		exclude = new RegExp(options.exclude);
	}

	var baseDirectory = path.dirname(this.resource);
	var overrideDirectory, overrideBaseDirectory, inOverrideMode = false;
	if (options.overrideDir) {
		if (!options.baseDir) {
			throw ("overrideDir can not be used without configuring a base dir");
		}
		overrideDirectory = path.join(baseDirectory, options.overrideDir);
		overrideBaseDirectory = path.join(baseDirectory, options.baseDir);
		inOverrideMode = true;
	}

	var subdirs, subdirsbase, subdirsoverride;
	if (!inOverrideMode) {
		subdirs = fs.readdirSync(baseDirectory).filter(function (file) {
			return fs.statSync(path.join(baseDirectory, file)).isDirectory();
		});
	} else {
		subdirsbase = fs.readdirSync(overrideBaseDirectory).filter(function (file) {
			return fs.statSync(path.join(overrideBaseDirectory, file)).isDirectory();
		});
		try {
			var overriderDir = fs.readdirSync(overrideDirectory);
			subdirsoverride = overriderDir.filter(function (file) {
				return fs.statSync(path.join(overrideDirectory, file)).isDirectory();
			});
		} catch (e) {
			//if the override dir does not exist we go back to normal mode but on the base path
			inOverrideMode = false;
			baseDirectory = overrideBaseDirectory;
			subdirs = subdirsbase;
		}
	}

	//alls sub directories match to languages
	var resBundle = {},
		dirname, files, basefiles, overridefiles;
	var languageDefiningDirectories = inOverrideMode ? subdirsbase : subdirs;
	for (var i = 0, len = languageDefiningDirectories.length; i < len; i++) {
		//all files within the sub directory map to namespaces
		dirname = languageDefiningDirectories[i];
		resBundle[dirname] = {};
		//get sub files
		if (!inOverrideMode) {
			files = fs.readdirSync(path.join(baseDirectory, dirname)).filter(function (file) {
				var filePath = path.join(dirname, file);
				return fs.statSync(path.join(baseDirectory, dirname, file)).isFile() && (!include || include.test(filePath)) && (!(exclude && exclude.test(filePath)));
			});
		} else {
			basefiles = fs.readdirSync(path.join(overrideBaseDirectory, '/', dirname)).filter(function (file) {
				var filePath = path.join(dirname, file);		
				return fs.statSync(path.join(overrideBaseDirectory, '/', dirname, file)).isFile() && (!include || include.test(filePath)) && (!(exclude && exclude.test(filePath)));
			});
		}

		var filename, extname, basename, content, overrideContent, pathstring, overridePathstring, fileData, overrideData, overrideFileExists;
		var filesToAdd = inOverrideMode ? basefiles : files;
		var baseDefiningDirectory = inOverrideMode ? overrideBaseDirectory : baseDirectory;
		for (var j = 0, len2 = filesToAdd.length; j < len2; j++) {
			filename = filesToAdd[j];
			pathstring = path.join(baseDefiningDirectory, dirname, filename);
			extname = path.extname(pathstring);
			basename = path.basename(pathstring, extname);
			content = fs.readFileSync(pathstring);
			fileData = JSON.parse(content);
			if (inOverrideMode) {
				overrideFileExists = true;
				//here we apply the data from the override dir if existent
				overridePathstring = path.join(overrideDirectory, '/', dirname, filename);
				try {
					fs.statSync(overridePathstring).isFile();
				} catch (e) {
					overrideFileExists = false;
				}
				if (overrideFileExists) {
					overrideContent = fs.readFileSync(overridePathstring);
					overrideData = JSON.parse(overrideContent);
					fileData = _.merge(fileData, overrideData);
					this.addDependency(overridePathstring);
				}
			}
			resBundle[dirname][basename] = fileData;
			this.addDependency(pathstring);
		}

		if (!inOverrideMode) {
			this.addContextDependency(path.join(baseDirectory, dirname));
		} else {
			this.addContextDependency(path.join(overrideBaseDirectory, dirname));
			this.addContextDependency(path.join(overrideDirectory, dirname));
		}
	}
	return "module.exports = " + JSON.stringify(resBundle);
}