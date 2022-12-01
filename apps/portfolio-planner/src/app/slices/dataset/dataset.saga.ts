import { call, select, takeEvery, put } from 'typed-redux-saga'
import { PortfolioAPI } from '../../lib/portfolio-api'
import { selectCountry } from './dataset.selectors'
import { setBuildings, setCountry, setDevices, setEngineers } from './dataset.slice'

function* changeCountry() {
  console.log('Changing country - fetching new dataset')
  const country = yield* select(selectCountry)
  const dataset = yield* call(PortfolioAPI.getDataset, country)
  yield* put(setBuildings(dataset.buildings))
  yield* put(setDevices(dataset.devices))
  yield* put(setEngineers(dataset.engineers))
}

export function* datasetSaga() {
  yield* takeEvery(setCountry, changeCountry)
  yield* put(setCountry('FR'))
  // yield* takeEvery(getEvents, fetchEvents)
  // yield* takeEvery(confirmBooking, bookMeeting)
}
