import { createSelector } from '@reduxjs/toolkit'
import { DatasetState } from './dataset.slice'

const selectSlice = (state: any) => state.dataset as DatasetState

export const selectCountry = createSelector([selectSlice], (slice) => slice.country)
export const selectEngineers = createSelector([selectSlice], (slice) => slice.engineers)
export const selectEngineerById = createSelector(
  [selectSlice, (state, id: number | string) => id],
  (slice, id) => slice.engineers.find((e) => e.mechanic_id === id.toString())
)
export const selectBuildings = createSelector([selectSlice], (slice) => slice.buildings)
export const selectDevices = createSelector([selectSlice], (slice) => slice.devices)

export const selectSolution = createSelector([selectSlice], (slice) => slice.solution)
