import * as express from 'express'
import { Message } from '@wemaintain/api-interfaces'
import { config } from 'dotenv'
import { Databricks } from '@wemaintain/databricks'
import { DatasetBuilder } from './app/dataset-builder'

config()
const app = express()

const greeting: Message = { message: 'Welcome to api!' }

app.get('/api', (req, res) => {
  res.send(greeting)
})

app.get('/build', async (req, res) => {
  const data = await DatasetBuilder.build('FR')
  data.writeToFile('dataset.json')
  res.send(data)
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
