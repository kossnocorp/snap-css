# SnapCSS

SnapCSS is a tool that extracts all related CSS rules for the given HTML:

```js
const snapCSS = require('snap-css')
const css = '.red { color: red } .green { color: green } .blue { color: blue }'
const html = '<div class='green'>OK</div>'
console.log(snapCSS(css, html))
//=> '.green { color: green }'
```

It also provides functionality to scrap loaded CSS from real DOM:

```js
const {snapCSSFromDOMOnLoad} = require('snap-css/dom')
snapCSSFromDOMOnLoad(window)
  .then(console.log)
  //=> '.red { color: red } .green { color: green } .blue { color: blue }'
```

See [how it works](#how-it-works).

## Installation

```bash
npm install snap-css --save
```

or

```bash
yarn add snap-css
```

## How it Works?

SnapCSS uses [PostCSS](https://postcss.org) to process the given CSS code.
It walks through every rule and check the query (e.g. `div .class` or `:hover span`)
against HTML loaded into a JSDOM instance using following algorithm:

- Replace pseudo-classes and pseudo-selectors with empty string before perforimg a query,
  so that `div:hover span` turns into `div span`, `:active` into `*`, etc.
- Perform every selector and remove the rules that don't match the DOM.
- Keep all at-rules (e.g. `@page`, `@m.edia`, etc)
- Remove unused `@keyframe` animations and empty rules i.e. empty `@media`.
- Format CSS using `postcss-prettify`.

Since the HTML is static, SnapCSS caches every query performed against it,
so it allows process repeating queries in the most performant way possible.

It's possible to get false-positive rules, like:

```js
const snapCSS = require('snap-css')
const css = 'div:empty { color: red }'
const html = '<div>Not empty!</div>'
console.log(snapCSS(css, html))
//=> 'div:empty { color: red }'
```

The problem here is that JSDOM doesn't perfectly match the spec, so some selectors
i.e. `:optional` doesn't work as intended, so that it could lead to false-negative
captures which are worse than false-positive because otherwise, means missing styles.

If a selector causes an exception (due to an incorrect or unsupported syntax),
the rule will be ignored.

Please [report an issue](https://github.com/kossnocopr/snap-css/issues/new)
if you found a false-negative scenario, so we can improve the library.

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
