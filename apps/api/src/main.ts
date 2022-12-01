import * as express from 'express'
import * as cors from 'cors'

import { DatasetResponse, Message } from '@wemaintain/api-interfaces'
import { config } from 'dotenv'
import { Databricks } from '@wemaintain/databricks'
import { DatasetBuilder } from './app/dataset-builder'

config()
const app = express()
app.use(cors())

const greeting: Message = { message: 'Welcome to api!' }

app.get('/api', (req, res) => {
  res.send(greeting)
})

app.get('/build/:countryCode', async (req, res) => {
  const data = await DatasetBuilder.build(req.params.countryCode)
  data.writeToFile()
  res.send()
})

app.get('/dataset/:countryCode', async (req, res) => {
  const data = await DatasetBuilder.loadFromFile(req.params.countryCode)
  res.send({
    buildings: data.buildings,
    devices: data.devices,
    engineers: data.engineers,
  } as DatasetResponse)
})

app.get('/compute', async (req, res) => {
  const data = await DatasetBuilder.loadFromFile('dataset.json')
  data.computeDistanceMatrix()
  res.send(data)
})

app.get('/databricks', async (req, res) => {
  const db = new Databricks()
  const result = await db.doQuery(
    'SELECT * FROM portfolio_planner.active_devices WHERE country = "FR" LIMIT 10'
  )
  res.send(result)
})

const port = process.env.port || 3333
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api')
})
server.on('error', console.error)
