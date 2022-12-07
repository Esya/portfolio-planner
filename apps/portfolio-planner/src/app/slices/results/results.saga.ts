import { put, select, takeEvery } from 'typed-redux-saga'
import { getState } from '../../store/configureStore'
import { selectBuildings, selectEngineerById } from '../dataset/dataset.selectors'
import { MapPoint, MapPolyline, setMarkers, setPoints, setPolylines } from '../map/map.slice'
import { selectHighlihtedEngineer, selectSolution } from './results.seslectors'
import { highlightEngineer } from './results.slice'

function* highlightEngineerSaga() {
  const id = yield* select(selectHighlihtedEngineer)
  if (!id) return

  const solution = yield* select(selectSolution)

  const vehicle = solution!.vehicles.find((v) => v.mechanic_id === id)
  const engineer = yield* select(selectEngineerById, id)
  if (!engineer || !vehicle) {
    return
  }

  const home = { lat: engineer.latitude, lng: engineer.longitude }
  yield* put(setMarkers([home]))

  const polylines: MapPolyline[] = []
  const points: MapPoint[] = []

  // Display results
  vehicle.tours.forEach((tour) => {
    const stops = tour.steps.map((step) => step.location)
    const newPoints = stops.map((l) => ({ lat: l[0], lng: l[1], color: '#0000ff' }))
    points.push(...newPoints)
    polylines.push({ path: newPoints })
  })
  yield* put(setPolylines(polylines))

  // Also set historical buildings from dataset
  const buildings = yield* select(selectBuildings)
  const previousBuildings = buildings
    .filter((b) => b.devices.filter((d) => d.mechanic_id.toString() === id).length > 0)
    .map((b) => ({ lat: b.latitude, lng: b.longitude, color: '#ff0000' }))

  yield* put(setPoints([...points, ...previousBuildings]))
}

export function* resultsSaga() {
  yield* takeEvery(highlightEngineer, highlightEngineerSaga)
}
