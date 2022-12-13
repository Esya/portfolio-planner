import { APIProblem, APIProblemJob, APIProblemVehicle } from '@wemaintain/api-interfaces'
import { call, select, takeEvery, put } from 'typed-redux-saga'
import { PortfolioAPI } from '../../lib/portfolio-api'
import { selectBuildings, selectCountry, selectAllEngineers } from './dataset.selectors'

import { runOptimizer, setBuildings, setCountry, setEngineers, setStats } from './dataset.slice'
import { setSolution } from '../results/results.slice'

function* changeCountry() {
  console.log('Changing country - fetching new dataset')
  const country = yield* select(selectCountry)
  const dataset = yield* call(PortfolioAPI.getDataset, country)
  yield* put(setBuildings(dataset.buildings))
  yield* put(setEngineers(dataset.engineers))
  yield* put(setStats(dataset.stats))
}

function* optimize() {
  const country = yield* select(selectCountry)
  const buildings = yield* select(selectBuildings)
  const engineers = yield* select(selectAllEngineers)

  // OPTIONS
  const maxEngineers = 3000
  const maxBuildings = 10000
  const limitToExistingPortfolio = true

  const vehicles = engineers.slice(0, maxEngineers).map((e) => {
    return {
      mechanic_id: e.mechanic_id,
      location: { lat: e.latitude, lng: e.longitude },
    } as APIProblemVehicle
  })

  const engineersIDs = vehicles.map((v) => v.mechanic_id.toString())

  const jobs: APIProblemJob[] = buildings
    .filter((b) => {
      if (!limitToExistingPortfolio) {
        // Do not filter
        return true
      }

      // Otherwise, keep building only if one device is attached to one of our engineers
      return b.devices.filter((d) => engineersIDs.includes(d.mechanic_id.toString())).length > 0
    })
    .slice(0, maxBuildings)
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
