import { createSelector } from '@reduxjs/toolkit'
import { MapState } from './map.slice'

const selectSlice = (state: any) => state.map as MapState

export const selectGeoJSONs = createSelector([selectSlice], (slice) => slice.geojsons)
export const selectPoints = createSelector([selectSlice], (slice) => slice.points)
export const selectMarkers = createSelector([selectSlice], (slice) => slice.markers)
export const selectPolylines = createSelector([selectSlice], (slice) => slice.polylines)
