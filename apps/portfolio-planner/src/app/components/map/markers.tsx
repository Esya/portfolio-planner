import { CircleMarker, Marker } from 'react-leaflet'
import { MapMarker } from '../../slices/map/map.slice'

export interface MarkersProps {
  markers: MapMarker[]
}

export function Markers(props: MarkersProps) {
  if (!props.markers) {
    return <></>
  }

  const elems = props.markers.map((marker, i) => <Marker position={[marker.lat, marker.lng]} key={i} />)
  return <>{elems}</>
}

export default Markers
