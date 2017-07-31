import test from 'ava'
import snapCSS from '.'

const css = `
.red {
  color: red;
}

.green {
  color: green;
}

.blue {
  color: blue;
}

span {
  border: 1px solid red;
}

.button:hover {
  color: yellow;
}

@keyframes input-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

input {
  animation: input-animation 5s infinite;
}

.button:hover strong {
  color: red;
}

.button:hover strong:hover {
  color: white;
}
`

test(t => {
  return snapCSS(css, '<div></div>')
    .then(resultCSS => t.is(resultCSS, ''))
})

test(t => {
  return snapCSS(css, '<div><span></span></div>')
    .then(resultCSS => t.is(resultCSS,
`span {
  border: 1px solid red;
}`))
})

test(t => {
  return snapCSS(css, '<div><span class="blue"></span></div>')
    .then(resultCSS => t.is(resultCSS,
`.blue {
  color: blue;
}

span {
  border: 1px solid red;
}`))
})

test(t => {
  return snapCSS(css, '<button class="button"></button>')
    .then(resultCSS => t.is(resultCSS,
`.button:hover {
  color: yellow;
}`))
})

test('supports multiply classes', t => {
  return snapCSS(css, '<button class="button red"></button>')
    .then(resultCSS => t.is(resultCSS,
`.red {
  color: red;
}

.button:hover {
  color: yellow;
}`))
})

test('preserves used animations', t => {
  return snapCSS(css, '<input />')
    .then(resultCSS => t.is(resultCSS,
`@keyframes input-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

input {
  animation: input-animation 5s infinite;
}`))
})

test(t => {
  return snapCSS(css, '<button class="button"><strong></strong></button>')
    .then(resultCSS => t.is(resultCSS,
`.button:hover {
  color: yellow;
}

.button:hover strong {
  color: red;
}

.button:hover strong:hover {
  color: white;
}`))
})

const cssWithPseudoRules = `
:nonsence {
  color: red;
}

::nonsence {
  color: red;
}

:-moz-nonsence {
  color: red;
}

::-moz-nonsence {
  color: red;
}

:nonsence(2x) {
  color: red;
}

::-webkit-nonsence(2x) {
  color: red;
}

div ::-webkit-nonsence(2x) {
  color: red;
}

span ::-webkit-nonsence(2x) {
  color: red;
}

::-webkit-nonsence(2x) div {
  color: red;
}

::-webkit-nonsence(2x) span {
  color: red;
}

div::-webkit-nonsence(2x) div {
  color: red;
}

div::-webkit-nonsence(2x) span {
  color: red;
}
`

test(t => {
  return snapCSS(cssWithPseudoRules, '<div><div></div></div>')
    .then(resultCSS => t.is(resultCSS,
`:nonsence {
  color: red;
}

::nonsence {
  color: red;
}

:-moz-nonsence {
  color: red;
}

::-moz-nonsence {
  color: red;
}

:nonsence(2x) {
  color: red;
}

::-webkit-nonsence(2x) {
  color: red;
}

div ::-webkit-nonsence(2x) {
  color: red;
}

::-webkit-nonsence(2x) div {
  color: red;
}

div::-webkit-nonsence(2x) div {
  color: red;
}`))
})

const cssWithAtRules = `
@page :first {
  color: red;
}

@page :left {
  color :red;
}

@page :right {
  color :red;
}

@media print {
  div {
    color: red;
  }
}

@media screen {
  span {
    color: red;
  }
}

@viewport {
  color: red;
}
`

test(t => {
  return snapCSS(cssWithAtRules, '<div></div>')
    .then(resultCSS => t.is(resultCSS,
`@page :first {
  color: red;
}

@page :left {
  color: red;
}

@page :right {
  color: red;
}

@media print {
  div {
    color: red;
  }
}

@viewport {
  color: red;
}`))
})

test(t => {
  return snapCSS(cssWithAtRules, '')
    .then(resultCSS => t.is(resultCSS, ''))
})
