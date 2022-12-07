import distinctColors from 'distinct-colors'
import { CircleMarker, Marker, Polyline, Tooltip } from 'react-leaflet'
import { MapPolyline } from '../../slices/map/map.slice'

export interface PolylinesProps {
  polylines: MapPolyline[]
}

export function Polylines(props: PolylinesProps) {
  if (!props.polylines) {
    return <></>
  }

  const palette = distinctColors({ count: props.polylines.length, lightMin: 0, hueMin: 10, chromaMin: 60 })
  const elems = props.polylines.map((p, i) => {
    return (
      <Polyline positions={p.path} key={i} pathOptions={{ color: palette[i].hex() }}>
        <Tooltip>{p.tooltip}</Tooltip>
      </Polyline>
    )
  })

  return <>{elems}</>
}

export default Polylines
