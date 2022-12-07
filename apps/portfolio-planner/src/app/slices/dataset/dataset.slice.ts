import { createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { APISolution, DatasetBuilding, DatasetDevice, DatasetEngineer } from '@wemaintain/api-interfaces'

export const EngineersAdapter = createEntityAdapter<DatasetEngineer>({
  selectId: (engineer) => engineer.mechanic_id,
})

export const BuildingAdapter = createEntityAdapter<DatasetBuilding>({
  selectId: (building) => building.building_id,
})

export interface DatasetState {
  country: 'FR' | 'UK' | 'SG'
  buildings: EntityState<DatasetBuilding>
  engineers: EntityState<DatasetEngineer>
}

const initialState: DatasetState = {
  country: 'FR',
  buildings: BuildingAdapter.getInitialState(),
  engineers: EngineersAdapter.getInitialState(),
}

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<string>) => {
      state.country = action.payload as 'FR' | 'UK' | 'SG'
    },
    setBuildings: (state, action: PayloadAction<DatasetBuilding[]>) => {
      BuildingAdapter.setAll(state.buildings, action.payload)
    },
    setEngineers: (state, action: PayloadAction<DatasetEngineer[]>) => {
      EngineersAdapter.setAll(state.engineers, action.payload)
    },
    runOptimizer: (state, action: PayloadAction<undefined>) => {},
  },
})

// Action creators are generated for each case reducer function
export const { setCountry, setEngineers, setBuildings, runOptimizer } = datasetSlice.actions

export default datasetSlice.reducer
