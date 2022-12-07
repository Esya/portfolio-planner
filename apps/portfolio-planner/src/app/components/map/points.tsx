import { CircleMarker, Tooltip } from 'react-leaflet'
import { MapPoint } from '../../slices/map/map.slice'

export interface PointsProps {
  points: MapPoint[]
}

export function Points(props: PointsProps) {
  if (!props.points) {
    return <></>
  }

  const elems = props.points.map((point, i) => (
    <CircleMarker center={[point.lat, point.lng]} radius={5} key={i}>
      <Tooltip>{point.tooltip}</Tooltip>
    </CircleMarker>
  ))
  return <>{elems}</>
}

export default Points
