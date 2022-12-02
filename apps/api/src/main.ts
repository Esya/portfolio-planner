import * as express from 'express'
import * as cors from 'cors'

import { DatasetResponse, Message } from '@wemaintain/api-interfaces'
import { config } from 'dotenv'
import { DatasetBuilder } from './app/dataset-builder'
import { Engine } from './app/engine'

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
app.get('/solve', async (req, res) => {
  const output = await Engine.solve({
    plan: {
      jobs: [
        {
          id: 'job-1',
          services: [{ places: [{ duration: 3600, location: { lat: 48.85428, lng: 2.49141 } }] }],
        },
      ],
    },
    fleet: {
      profiles: [{ name: 'car' }],
      vehicles: [
        {
          vehicleIds: ['v1', 'v2'],
          typeId: 'm1',
          costs: { fixed: 0, distance: 1, time: 1 },
          profile: { matrix: 'car' },
          capacity: [100000],
          shifts: [
            {
              start: { earliest: '2022-12-02T09:00:00Z', location: { lat: 48.86776, lng: 2.29286 } },
              end: { latest: '2022-12-02T17:00:00Z', location: { lat: 48.86776, lng: 2.29286 } },
            },
          ],
        },
      ],
    },
  })
  res.send(output)
})

const port = process.env.port || 3333
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api')
})
server.on('error', console.error)
