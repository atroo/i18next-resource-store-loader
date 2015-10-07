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

And you're done! The `index.js` can be empty, it's just needed to point the loader to the root directory of the locales.
