import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import express from 'express'
import App from '../src'
import path from 'path'

const HTML = ({ children, scripts, initialState }) => {
  return (
    <html>
      <head>
        <title>React Reformed</title>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css' />
      </head>
      <body>
        <div id='root' dangerouslySetInnerHTML={{ __html: children }} />
        <script dangerouslySetInnerHTML={{ __html: (
          `window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}`
        )}} />
        {scripts.map((src) => (
          <script key={src} src={src} />
        ))}
      </body>
    </html>
  )
}

const app = express()

app.use(express.static(path.resolve(__dirname, '../dist')))

app.get('/', (req, res) => {
  const initialState = {
    form: {
      model: {
        username: 'bob',
        password: '',
        checkboxes: ['foo']
      }
    }
  }

  const html = `<!doctype html>` + renderToStaticMarkup(
    <HTML scripts={['/app.js']} initialState={initialState}>
      {renderToString(<App initialModel={initialState.form.model} />)}
    </HTML>
  )
  res.send(html)
})

app.listen(3000)
