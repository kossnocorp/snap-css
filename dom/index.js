// XXX: The script requires fetch and Promise!

if (typeof module === 'object') {
  module.exports = {
    snapCSSFromDOM,
    snapCSSFromDOMOnLoad
  }
} else if (typeof window === 'object') {
  window.snapCSSFromDOM = snapCSSFromDOM
  window.snapCSSFromDOMOnLoad = snapCSSFromDOMOnLoad
}

function snapCSSFromDOMOnLoad (win) {
  return promiseLoad(win)
    .then(function () { return snapCSSFromDOM(win) })
}

function promiseLoad (win) {
  return new Promise (function (resolve, reject) {
    if (win.document.readyState === 'complete') {
      resolve()
    } else {
      win.addEventListener('load', resolve)
    }
  })
}

function snapCSSFromDOM (win) {
  return Promise.all(toArray(win.document.styleSheets).map(function (sheet) {
    return new Promise(function (resolve, reject) {
      if (sheet.cssRules) {
        resolve(toArray(sheet.cssRules)
          .map(function (rule) { return rule.cssText })
          .join('\n'))
      } else {
        fetch(sheet.href)
          .then(function (resp) { return resp.text() })
          .then(resolve)
      }
    })
  }))
    .then(function (cssChunks) {
      return cssChunks
        .reduce(function (acc, chunk) { return acc + chunk }, '')
    })
}

function toArray (iterable) {
  return Array.prototype.slice.apply(iterable)
}
