import { GeoJSON } from 'react-leaflet'
import { toGeoJSON as decodePolyline } from '@mapbox/polyline'
import distinctColors from 'distinct-colors'

export interface GeoJSONsProps {
  geojsons?: string[]
}

export function GeoJSONS(props: GeoJSONsProps) {
  if (!props.geojsons) {
    return <></>
  }

  const palette = distinctColors({ count: props.geojsons.length, lightMin: 70, hueMin: 10, chromaMin: 20 })
  const elems = props.geojsons.map((geojson, i) => (
    <GeoJSON data={decodePolyline(geojson)} key={i} pathOptions={{ color: palette[i].hex() }} />
  ))
  return <>{elems}</>
}

export default GeoJSONS
