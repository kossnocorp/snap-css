const postcss = require('postcss')
const jsdom = require('jsdom')
const cssPrettify = require('postcss-prettify/dist/format')

module.exports = function (css, html) {
  return createWindow(html)
    .then(win => {
      // Empty HTML means empty CSS.
      if (win.document.body.innerHTML.trim() === '') {
        return ''
      }

      const cssRoot = postcss.parse(css)
      const usedAnimations = new Set()
      // Cache queries, as HTML is static.
      const queryCache = {}

      cssRoot.walkRules(removeUnused.bind(null, win.document, queryCache))
      cssRoot.walkDecls('animation', decl => {
        decl.value.split(' ')
          .filter(v => !/^\d/.test(v))
          .forEach(animation => usedAnimations.add(animation))
      })
      cssRoot.walkAtRules('keyframes', removeUnusedAnimations.bind(null, usedAnimations))
      cssRoot.walkRules(removeEmpty)
      cssRoot.walkAtRules(removeEmpty)
      cssRoot.walk(cssPrettify)

      return cssRoot.toResult().css.trim()
    })
}

// Pseudo classes that belongs to the root,
// hence must always present.
const globalPseudoClasses = new Set([
])

// TODO: Sort classes alphabetically
const strippedPseudoClasses = new Set([
  'fullscreen',
  'active',
  'hover',
  'focus',
  'checked',
  'default',
  'root',
  'scope',
  'target',
  'visited'
])

const pseudoSelectors = new Set([
  'after',
  'before',
  'first-letter',
  'first-line'
])

function removeUnused (doc, cache, rule) {
  const matchesDoc = rule.selector.split(',').find(selector => {
    // Preserve keyframes for now.
    // Unused animations will cleared later.
    if (rule.parent.name == 'keyframes') {
      return true
    }

    // Replace ::-moz-whatever with an empty string to preserve relevant
    // pseudo selectors.
    const bareSelector = selector.replace(/::?(-\w+-)?[^\s]+/g, () => '').trim() || '*'

    if (cache[bareSelector] === undefined) { // querySelector returns null for empty
      try {
        cache[bareSelector] = doc.querySelector(bareSelector)
      } catch (err) {
        cache[bareSelector] = err
      }
    }

    if (cache[bareSelector] === null || cache[bareSelector] instanceof Error) {
      return false
    } else {
      return true
    }
  })

  if (!matchesDoc) {
    rule.remove()
  }
}

function removeUnusedAnimations (usedAnimations, atRule) {
  if (!usedAnimations.has(atRule.params)) {
    atRule.remove()
  }
}

function removeEmpty (rule) {
  if (rule.nodes.length === 0) {
    rule.remove()
  }
}

function createWindow (html) {
  return new Promise(resolve => jsdom.env({
    html,
    done: (err, win) => {
      if (err) {
        reject(err)
      } else {
        resolve(win)
      }
    }
  }))
}
