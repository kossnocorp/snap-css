import test from 'ava'
import fsp from 'fs-promise'
import path from 'path'
import express from 'express'
import getPort from 'get-port'
import {snapCSSFromDOM, snapCSSFromDOMOnLoad} from '.'
import ChromeDriver from 'appium-chromedriver'

test.beforeEach.cb(t => {
  getPort()
    .then(port => {
      t.context.port = port

      const app = express()
      t.context.app = app

      app.get('/', (req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <link rel='stylesheet' href='http://localhost:${port}/css' />
              <style>
                .inline {
                  color: red;
                }
              </style>
            </head>
            <body></body>
          </html>
        `)
      })

      app.get('/css', (req, res) => {
        res.setHeader('Content-Type', 'text/css')
        res.send(
`.wow {
  color: red;
}`)
      })

      app.listen(port, t.end)
    })
})

test.afterEach(t => {
  t.context.app.close && t.context.app.close()
})

test.beforeEach(async t => {
  t.context.driver = new ChromeDriver()
  await t.context.driver.start({browserName: 'chrome'})
})

test.afterEach(async t => {
  await t.context.driver.stop()
})

test(async t => {
  const domScript = await fsp.readFile(path.resolve(process.cwd(), 'dom/index.js'))
  await t.context.driver.sendCommand(`/session/:session/url`, 'POST', {
    url: `http://localhost:${t.context.port}`
  })
  await t.context.driver.sendCommand(`/session/:session/execute`, 'POST', {
    script: domScript.toString(),
    args: []
  })
  const resp = await t.context.driver.sendCommand(`/session/:session/execute_async`, 'POST', {
    script: `
      window.snapCSSFromDOMOnLoad(window).then(arguments[0])
    `,
    args: []
  })
  t.is(resp, '.wow { color: red; }.inline { color: red; }')
})

function wait (timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}
