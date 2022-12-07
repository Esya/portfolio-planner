import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Coordinates {
  lat: number
  lng: number
}
export interface MapMarker extends Coordinates {}

export interface MapPoint extends Coordinates {
  tooltip?: string
}

export interface MapPolyline {
  path: MapPoint[]
  tooltip?: string
}

export interface MapState {
  geojsons: string[]
  points: MapPoint[]
  markers: MapMarker[]
  polylines: MapPolyline[]
}

const initialState: MapState = {
  geojsons: [],
  points: [],
  markers: [],
  polylines: [],
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setGeojsons(state, action: PayloadAction<any[]>) {
      state.geojsons = action.payload
    },
    setPoints(state, action: PayloadAction<MapPoint[]>) {
      state.points = action.payload
    },
    setMarkers(state, action: PayloadAction<MapMarker[]>) {
      state.markers = action.payload
    },
    setPolylines(state, action: PayloadAction<MapPolyline[]>) {
      state.polylines = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setGeojsons, setPoints, setMarkers, setPolylines } = mapSlice.actions

export default mapSlice.reducer
