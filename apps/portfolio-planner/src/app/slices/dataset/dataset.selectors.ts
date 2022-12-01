import { createSelector } from '@reduxjs/toolkit'
import { DatasetState } from './dataset.slice'

const selectSlice = (state: any) => state.dataset as DatasetState

export const selectCountry = createSelector([selectSlice], (slice) => slice.country)
export const selectEngineers = createSelector([selectSlice], (slice) => slice.engineers)
