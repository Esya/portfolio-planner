import * as express from 'express'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'

import { APIProblem, DatasetResponse, Message } from '@wemaintain/api-interfaces'
import { config } from 'dotenv'
import { DatasetBuilder } from './app/dataset-builder'
import { VRPEngine } from './app/engines/vrp/vrp-engine'
import { VRPProblem } from './app/engines/vrp/vrp.interfaces'
import { VroomEngine } from './app/engines/vroom/vroom-engine'

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
    devices: data.devices,
    engineers: data.engineers,
  } as DatasetResponse)
})

//:48.86776,"longitude":2.29286,"country":"FR"},{"building_id":4537,"building_name":"Les Fontaines","latitude":48.85428,"longitude":2.49141,"cou
app.get('/solve-dummy', async (req, res) => {
  const problem = VRPEngine.dummyProblem()
  const output = await VRPEngine.solve(problem)
  res.send(output)
})

app.post('/solve-vroom', async (req, res) => {
  const apiProblem = req.body as APIProblem
  const vroomSolution = await VroomEngine.solve(apiProblem)
  const apiSolution = VroomEngine.convertSolution(vroomSolution)
  res.send(apiSolution)
})

app.post('/solve-vrp', async (req, res) => {
  const apiProblem = req.body as APIProblem
  const problem: VRPProblem = {
    fleet: {
      profiles: [{ name: 'car' }],
      vehicles: apiProblem.vehicles.map((v) => {
        return {
          capacity: [100000],
          costs: { distance: 1, fixed: 1, time: 1 },
          profile: { matrix: 'car', scale: 1 },
          shifts: [
            {
              start: {
                earliest: '2022-12-03T09:00:00Z',
                location: { lat: v.location.lat, lng: v.location.lng },
              },
              end: { latest: '2022-12-03T18:00:00Z', location: { lat: v.location.lat, lng: v.location.lng } },
            },
          ],
          typeId: 'type_' + v.mechanic_id,
          vehicleIds: ['vehicle_' + v.mechanic_id],
        }
      }),
    },
    plan: {
      jobs: apiProblem.jobs.map((j) => {
        return {
          id: `job_${j.building_id}_${j.device_id}`,
          services: [
            {
              places: [{ duration: 3600, location: j.location }],
            },
          ],
        }
      }),
    },
    // objectives: [
    //   [
    //     {
    //       type: 'minimize-cost',
    //     },
    //   ],
    //   [
    //     {
    //       type: 'maximize-tours',
    //     },
    //   ],
    //   [
    //     {
    //       type: 'balance-max-load',
    //     },
    //   ],
    // ],
  }

  const output = await VRPEngine.solve(problem)
  res.send(output)
})

const port = process.env.port || 3333
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api')
})
server.on('error', console.error)
