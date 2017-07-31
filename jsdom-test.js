const jsdom = require('jsdom')

jsdom.env({
  html: '<input />',
  done: (err, win) => {
    if (err) {
      console.error(err)
    }
    console.log(win.document.querySelector(':optional'))
  }
})
