require('isomorphic-fetch')

import * as express from 'express'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { Server } from 'socket.io'
import { createServer } from 'http'

import {
  APIProblem,
  DatasetResponse,
  EngineersStatsRequest,
  EngineersStatsResponse,
  Message,
} from '@wemaintain/api-interfaces'
import { config } from 'dotenv'
import { DatasetBuilder } from './app/dataset-builder'
import { VRPEngine } from './app/engines/vrp/vrp-engine'
import { VroomEngine } from './app/engines/vroom/vroom-engine'
import { EngineersStats } from './app/stats/engineers-stats'

config()
const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))

const greeting: Message = { message: 'Welcome to api!' }

app.get('/api', (req, res) => {
  res.send(greeting)
})

app.get('/build/:countryCode', async (req, res) => {
  const data = await DatasetBuilder.build(req.params.countryCode)
  data.writeToFile()
  // await data.computeDistanceMatrix()
  res.send()
})

app.get('/dataset/:countryCode', async (req, res) => {
  const data = await DatasetBuilder.loadFromFile(req.params.countryCode)
  res.send({
    buildings: data.buildings,
    engineers: data.engineers,
  } as DatasetResponse)
})

app.get('/solve-dummy', async (req, res) => {
  const problem = VRPEngine.dummyProblem()
  const output = await VRPEngine.solve(problem)
  res.send(output)
})

app.post('/engineers-stats', async (req, res) => {
  try {
    const input = req.body as EngineersStatsRequest
    const [fromHome, betweenDevices] = await Promise.all([
      EngineersStats.fromHome(input),
      EngineersStats.betweenDevices(input),
    ])
    return { fromHome, betweenDevices } as EngineersStatsResponse
  } catch (e) {
    res.status(500).send(e)
  }
})

app.post('/solve-vroom', async (req, res) => {
  try {
    const apiProblem = req.body as APIProblem
    const vroomSolution = await VroomEngine.solve(apiProblem)
    const apiSolution = VroomEngine.convertSolution(vroomSolution)
    res.send(apiSolution)
  } catch (e) {
    res.status(500).send(e)
  }
})

app.post('/solve-vrp', async (req, res) => {
  const apiProblem = req.body as APIProblem
  const vrpProblem = await VRPEngine.convertProblem(apiProblem)
  const vrpSolution = await VRPEngine.solve(vrpProblem)
  const apiSolution = await VRPEngine.convertSolution(vrpSolution)
  res.send(apiSolution)
})

const port = process.env.port || 3333
const httpServer = createServer(app)
const io = new Server(httpServer)
httpServer.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api')
})
