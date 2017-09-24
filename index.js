const path = require("path");
const fs = require("fs");
const merge = require("lodash/merge");
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

  if (!options.include) {
    options.include = [ "**/*.json", "**/*.yml", "**/*.yaml" ]
  }

  let baseDirectory = path.dirname(this.resource); // this is the absolute path to the index.js in the top level locales dir

  //alls sub directories match to languages
  let resBundle = {}, lang, files, basefiles, overridefiles;
  //const langDirs = inOverrideMode ? subdirsbase : subdirs;
  const langDirs = enumerateLangDirs(baseDirectory)
  for (let i = 0, len = langDirs.length; i < len; i++) {
    //all files within the sub directory map to namespaces
    lang = langDirs[ i ];
    resBundle[ lang ] = {};

    const fullLangPath = path.join(baseDirectory, lang)
    const filesToAdd = findAll(options.include, fullLangPath);
    for (let j = 0, len2 = filesToAdd.length; j < len2; j++) {
      const fullPath = filesToAdd[ j ];
      const extname = path.extname(fullPath);
      const basename = path.basename(fullPath, extname);
      const content = fs.readFileSync(fullPath);
      const fileData = JSON.parse(content);
      resBundle[ lang ] = fileData;
      this.addDependency(fullPath);
    }

    this.addContextDependency(fullLangPath);
  }
  return "module.exports = " + JSON.stringify(resBundle);
}