import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import datasetSlice from '../slices/dataset/dataset.slice'
import mapSlice from '../slices/map/map.slice'
import resultsSlice from '../slices/results/results.slice'
import rootSaga from './rootSaga'

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    dataset: datasetSlice,
    map: mapSlice,
    results: resultsSlice,
  },
  middleware: [sagaMiddleware],
})

sagaMiddleware.run(rootSaga)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export const getState = store.getState
