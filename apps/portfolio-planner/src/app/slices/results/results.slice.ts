import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { APISolution } from '@wemaintain/api-interfaces'

export interface ResultsState {
  solution?: APISolution
  highlightedEngineerId?: string
}

const initialState: ResultsState = {}

export const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    setSolution: (state, action: PayloadAction<APISolution>) => {
      state.solution = action.payload
    },
    highlightEngineer: (state, action: PayloadAction<string>) => {
      state.highlightedEngineerId = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setSolution, highlightEngineer } = resultsSlice.actions

export default resultsSlice.reducer
