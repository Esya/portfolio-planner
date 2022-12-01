import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DatasetBuilding, DatasetDevice, DatasetEngineer } from '@wemaintain/api-interfaces'

export interface DatasetState {
  country: 'FR' | 'UK' | 'SG'
  devices: DatasetDevice[]
  buildings: DatasetBuilding[]
  engineers: DatasetEngineer[]
}

const initialState: DatasetState = {
  country: 'FR',
  devices: [],
  buildings: [],
  engineers: [],
}

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<string>) => {
      state.country = action.payload as 'FR' | 'UK' | 'SG'
    },
    setDevices: (state, action: PayloadAction<DatasetDevice[]>) => {
      state.devices = action.payload
    },
    setBuildings: (state, action: PayloadAction<DatasetBuilding[]>) => {
      state.buildings = action.payload
    },
    setEngineers: (state, action: PayloadAction<DatasetEngineer[]>) => {
      state.engineers = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setCountry, setDevices, setEngineers, setBuildings } = datasetSlice.actions

export default datasetSlice.reducer
