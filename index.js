const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 5000
const Job = require('cron').CronJob
const fetch = require('node-fetch')

const listeners = []

app.get('/health', (req, res) => {
  res.send('OK')
})

app.post('/subscribe', bodyParser.json(), (req, res) => {
  console.log(req.body)
  const job = new Job(req.body.data.pattern, function () {
    console.log('sending with ', req.body.endpoint)
    fetch(req.body.endpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify({
        eventType: 'schedule',
        cloudEventsVersion: '0.1',
        contentType: 'application/vnd.oms.object+json',
        eventID: req.body.id,
        data: {
          pattern: req.body.data.pattern,
          ticked: true
        }
      })
    })
  }, null, true, 'Europe/Amsterdam')

  listeners.push({
    id: req.body.id,
    endpoint: req.body.endpoint,
    job
  })

  res.send('Subscribed')
})

app.post('/unsubscribe', bodyParser.json(), (req, res) => {
  const idx = listeners.findIndex(j => j.id === req.body.id)
  if (idx !== -1) {
    listeners[idx].job.stop()
    listeners.splice(idx, 1)
  }
  res.send('Unsubscribed')
})

app.listen(port, () => console.log(`listening on port ${port}!`))