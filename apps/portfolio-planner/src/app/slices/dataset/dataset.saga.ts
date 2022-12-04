import { APIProblem, APIProblemJob, APIProblemVehicle } from '@wemaintain/api-interfaces'
import { call, select, takeEvery, put } from 'typed-redux-saga'
import { PortfolioAPI } from '../../lib/portfolio-api'
import { selectBuildings, selectCountry, selectDevices, selectEngineers } from './dataset.selectors'
import {
  runOptimizer,
  setBuildings,
  setCountry,
  setDevices,
  setEngineers,
  setSolution,
} from './dataset.slice'

function* changeCountry() {
  console.log('Changing country - fetching new dataset')
  const country = yield* select(selectCountry)
  const dataset = yield* call(PortfolioAPI.getDataset, country)
  yield* put(setBuildings(dataset.buildings))
  yield* put(setDevices(dataset.devices))
  yield* put(setEngineers(dataset.engineers))
}

function* optimize() {
  const country = yield* select(selectCountry)
  const devices = yield* select(selectDevices)
  const buildings = yield* select(selectBuildings)
  const engineers = yield* select(selectEngineers)

  // Pick the first 100 devices
  const jobs = devices.slice(0, 100).map((d) => {
    const building = buildings.find((b) => b.building_id.toString() === d.building_id)
    if (!building) {
      throw new Error('Device ID ' + d.device_id + ' has no building')
    }

    let location
    if (building.latitude < 40) {
      //@TODO - Dirty fix, we've got a problem with the dataset (lat/lng reversed)
      location = { lat: building.longitude, lng: building.latitude }
    } else {
      location = { lat: building.latitude, lng: building.longitude }
    }

    return {
      device_id: d.device_id,
      building_id: d.building_id,
      location: location,
      duration: 900,
    } as APIProblemJob
  })

  // Pick the first 3 engineers
  const vehicles = engineers.slice(0, 3).map((e) => {
    return {
      mechanic_id: e.mechanic_id,
      location: { lat: 48.864716, lng: 2.349 },
    } as APIProblemVehicle
  })

  const solution = yield* call(PortfolioAPI.optimize, {
    country,
    jobs,
    vehicles,
    dayOptions: {
      numberOfDays: 3,
      dayStartHour: 9,
      dayEndHour: 18,
      increaseCostEachDay: true,
    },
  } as APIProblem)

  yield* put(setSolution(solution))
}

export function* datasetSaga() {
  yield* takeEvery(setCountry, changeCountry)
  yield* put(setCountry('FR'))

  yield* takeEvery(runOptimizer, optimize)
  // yield* takeEvery(getEvents, fetchEvents)
  // yield* takeEvery(confirmBooking, bookMeeting)
}
