import { LatLngTuple } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvent } from 'react-leaflet'
import { useSelector } from 'react-redux'

import { selectGeoJSONs, selectMarkers, selectPoints, selectPolylines } from '../../slices/map/map.selectors'
import GeoJSONS from './geojsons'
import Markers from './markers'
import Points from './points'
import Polylines from './polylines'

/* eslint-disable-next-line */
export interface MapProps {}

function Tracker() {
  const map = useMapEvent('moveend', () => {
    console.log(map.getCenter())
  })

  return null
}

const position: LatLngTuple = [48.8569, 2.3415]
export function Map(props: MapProps) {
  const geojsons = useSelector(selectGeoJSONs)
  const points = useSelector(selectPoints)
  const markers = useSelector(selectMarkers)
  const polylines = useSelector(selectPolylines)

  return (
    <MapContainer
      center={position}
      zoom={11}
      scrollWheelZoom={true}
      style={{
        height: '50vh',
        maxHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <Tracker />
      <GeoJSONS geojsons={geojsons} />
      <Points points={points} />
      <Markers markers={markers} />
      <Polylines polylines={polylines} />
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />
    </MapContainer>
  )
}

export default Map
