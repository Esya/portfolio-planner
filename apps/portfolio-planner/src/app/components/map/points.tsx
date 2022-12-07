import { useEffect, useState } from 'react'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { MapPoint } from '../../slices/map/map.slice'

export interface PointsProps {
  points: MapPoint[]
}

export function Points(props: PointsProps) {
  if (!props.points) {
    return <></>
  }

  const [coords, setCoords] = useState<MapPoint[]>(props.points)
  useEffect(() => setCoords(props.points), [props.points])

  const elems = coords.map((point, i) => (
    <CircleMarker center={[point.lat, point.lng]} radius={5} key={i} color={point.color}>
      <Tooltip>{point.tooltip}</Tooltip>
    </CircleMarker>
  ))
  return <>{elems}</>
}

export default Points
