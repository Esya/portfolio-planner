import { APIProblem, APIProblemJob, APIProblemVehicle } from '@wemaintain/api-interfaces'
import { call, select, takeEvery, put } from 'typed-redux-saga'
import { PortfolioAPI } from '../../lib/portfolio-api'
import { selectBuildings, selectCountry, selectAllEngineers } from './dataset.selectors'

import { runOptimizer, setBuildings, setCountry, setEngineers } from './dataset.slice'
import { MapPoint, setGeojsons, setPoints } from '../map/map.slice'
import { setSolution } from '../results/results.slice'

function* changeCountry() {
  console.log('Changing country - fetching new dataset')
  const country = yield* select(selectCountry)
  const dataset = yield* call(PortfolioAPI.getDataset, country)
  yield* put(setBuildings(dataset.buildings))
  yield* put(setEngineers(dataset.engineers))
}

function* optimize() {
  const country = yield* select(selectCountry)
  const buildings = yield* select(selectBuildings)
  const engineers = yield* select(selectAllEngineers)

  // Pick the first 100 devices
  const jobs: APIProblemJob[] = buildings
    .slice(0, 30000)
    .map((building) => {
      let location: { lat: number; lng: number }
      if (building.latitude < 40) {
        //@TODO - Dirty fix, we've got a problem with the dataset (lat/lng reversed)
        location = { lat: building.longitude, lng: building.latitude }
      } else {
        location = { lat: building.latitude, lng: building.longitude }
      }

      return (
        building.devices
          // @TODO These devices have duplicate... FIX!
          .filter((d) => !['4900', '4901', '4902'].includes(d.device_id))
          .map((d) => {
            return {
              building_id: building.building_id.toString(),
              device_id: d.device_id,
              location: location,
              duration: 900,
            } as APIProblemJob
          })
      )
    })
    .flat()
  // const jobs = devices.slice(1000, 1800).map((d) => {
  //   const building = buildings.find((b) => b.building_id.toString() === d.building_id)
  //   if (!building) {
  //     throw new Error('Device ID ' + d.device_id + ' has no building')
  //   }

  //   let location
  //   if (building.latitude < 40) {
  //     //@TODO - Dirty fix, we've got a problem with the dataset (lat/lng reversed)
  //     location = { lat: building.longitude, lng: building.latitude }
  //   } else {
  //     location = { lat: building.latitude, lng: building.longitude }
  //   }

  //   return {
  //     device_id: d.device_id,
  //     building_id: d.building_id,
  //     location: location,
  //     duration: 900,
  //   } as APIProblemJob
  // })

  // Pick the first 3 engineers
  const vehicles = engineers.slice(0, 3000).map((e) => {
    return {
      mechanic_id: e.mechanic_id,
      location: { lat: e.latitude, lng: e.longitude },
    } as APIProblemVehicle
  })

  try {
    const solution = yield* call(PortfolioAPI.optimize, {
      country,
      jobs,
      vehicles,
      // dayOptions: {
      //   numberOfDays: 5,
      //   dayStartHour: 9,
      //   dayEndHour: 18,
      //   increaseCostEachDay: true,
      // },
    } as APIProblem)

    // Tentative - draw geojson
    const polylines: any[] = []
    solution.vehicles.forEach((v) => {
      v.tours.forEach((t) => {
        polylines.push(t.geometry)
      })
    })

    yield* put(setSolution(solution))
  } catch (e) {
    //@TODO - Display the error
    console.error(e)
    return
  }
}

export function* datasetSaga() {
  yield* takeEvery(setCountry, changeCountry)
  yield* put(setCountry('FR'))

  yield* takeEvery(runOptimizer, optimize)
  // yield* takeEvery(getEvents, fetchEvents)
  // yield* takeEvery(confirmBooking, bookMeeting)
}
