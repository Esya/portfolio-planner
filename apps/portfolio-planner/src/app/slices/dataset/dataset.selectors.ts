import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../store/configureStore'
import { BuildingAdapter, DatasetState, EngineersAdapter } from './dataset.slice'

const selectSlice = (state: any) => state.dataset as DatasetState

export const selectCountry = createSelector([selectSlice], (slice) => slice.country)
export const selectStats = createSelector([selectSlice], (slice) => slice.stats)
export const { selectAll: selectAllEngineers, selectById: selectEngineerById } =
  EngineersAdapter.getSelectors<RootState>((state) => state.dataset.engineers)

export const { selectAll: selectBuildings } = BuildingAdapter.getSelectors<RootState>(
  (state) => state.dataset.buildings
)
