# i18next-resource-store-loader

``` npm install hapi-webpack-dev-plugin ```

this loader generates the resStore config needed for i18next to avoid loading language ressource via http requests. It generates this config from a directory.

## Usage

Assuming the following Filestructure
``` javascript
-app
 -src
  -assets
   -i18n
    index.js
    -de
     translation.json
    -en
     translation.json
  -js
   main.js
```
Use the loader in the following way

main.js:
``` javascript
var i18n = require("i18next-client");
var resBundle = require("i18next-resource-store-loader!../assets/i18n/index.js");

//i18n
i18n.init({
    resStore: resBundle
});

//use the resources as document at i18next.com
//e.g. translation namespace
i18n.t("translation:key");
```

You can filter files in Filestructure using include and exclude parameters
``` javascript
var resBundle = require("i18next-resource-store-loader?include=\\.json$!../assets/i18n/index.js");
// will load files with json extension only

var resBundle = require("i18next-resource-store-loader?exclude=\\.json$!../assets/i18n/index.js");
// will skip files with json extension
```

And your done. The index.js can be empty, its just needed to point the loader to the locales root directory.
