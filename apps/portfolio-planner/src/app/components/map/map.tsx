import { LatLngTuple } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMapEvent } from 'react-leaflet'

/* eslint-disable-next-line */
export interface MapProps {}

function Tracker() {
  const map = useMapEvent('moveend', () => {
    console.log(map.getCenter())
  })

  return null
}
const position: LatLngTuple = [51.505, -0.09]
export function Map(props: MapProps) {
  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        height: '50vh',
        maxHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <Tracker />
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default Map
