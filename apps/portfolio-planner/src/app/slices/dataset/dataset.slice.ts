import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface DatasetState {
  country: 'FR' | 'UK' | 'SG'
}

const initialState: DatasetState = {
  country: 'FR',
}

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<'FR' | 'UK' | 'SG'>) => {
      state.country = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setCountry } = datasetSlice.actions

export default datasetSlice.reducer
