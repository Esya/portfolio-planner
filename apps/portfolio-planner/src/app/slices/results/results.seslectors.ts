import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../store/configureStore'
import { ResultsState } from './results.slice'

const selectSlice = (state: RootState) => state.results as ResultsState

export const selectSolution = createSelector([selectSlice], (slice) => slice.solution)
export const selectHighlihtedEngineer = createSelector([selectSlice], (slice) => slice.highlightedEngineerId)
