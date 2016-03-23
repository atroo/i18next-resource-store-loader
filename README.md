# i18next-resource-store-loader

`npm install i18next-resource-store-loader`

This loader generates the `resStore` config needed for **i18next** to avoid loading language resources via extra HTTP requests. It generates this config given a directory.

## Usage

In this example we will assume the following file structure:

```
└── app
    └── src
        ├── assets
        │   └── i18n
        │       ├── index.js
        │       ├── de
        │       │   └── translation.json
        │       └── en
        │           └── translation.json
        └── js
            └── main.js
```

Use the loader in the following way:

```javascript
// File: main.js
var i18n = require("i18next");
var resBundle = require(
  "i18next-resource-store-loader!../assets/i18n/index.js"
);

i18n.init({
  resources: resBundle
});

// Use the resources as documented on i18next.com
i18n.t("key");
```

For older versions of i18n < 2.X, use the old property names while setting up i18n
 ```javascript
 // File: main.js
 var i18n = require("i18next-client");
  var resBundle = require(
    "i18next-resource-store-loader!../assets/i18n/index.js"
  );
  		  
  i18n.init({
   resStore: resBundle
  });
  		  
 // Use the resources as documented on i18next.com	
 // e.g. 'translation' namespace
 i18n.t("translation:key");		
 ```

And you're done! The `index.js` can be empty, it's just needed to point the loader to the root directory of the locales.

## Advanced Usage

### Filter
You can filter files in your file structure using include and exclude parameters:

```javascript
// will only load files with json extension
var resBundle = require("i18next-resource-store-loader" +
                        "?include=\\.json$!../assets/i18n/index.js");
```

```javascript
// will skip files with json extension
var resBundle = require("i18next-resource-store-loader" +
                        "?exclude=\\.json$!../assets/i18n/index.js");
```

### Override
In cases of customized applications it may be handy to have an easy way to replace particular parts of the res store bundle with customized values. The loader supports that by two query parameters.

```javascript
// will replace everyhting from base with what is existent in override
var resBundle = require("i18next-resource-store-loader" +
                        "?overrideDir=override&baseDir=base!../assets/i18n/index.js");
```
This configures the loader to work on a file structure like the following:

```
└── app
    └── src
        ├── assets
        │   └── i18n
        │       ├── index.js
        │       ├── base
        │       │   ├── de
        │       │   │   └── translation.json
        │       │   └── en
        │       │       └── translation.json
        │       └── override		
        │           └── en
        │               └── translation.json
        │
        └── js
            └── main.js
```

Everthing from base/en/translation.js will be overridden with stuff noted in override/en/translation.js - partial overrides are possible.
