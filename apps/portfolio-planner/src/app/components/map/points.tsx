import { useEffect, useState } from 'react'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { useSelector } from 'react-redux'
import useDeepCompareEffect from 'use-deep-compare-effect'
import { selectPoints } from '../../slices/map/map.selectors'
import { MapPoint } from '../../slices/map/map.slice'

export interface PointsProps {
  points: MapPoint[]
}

export function Points(props: PointsProps) {
  const points = useSelector(selectPoints)
  if (!points) {
    return <></>
  }

  const elems = points.map((point, i) => (
    <CircleMarker center={[point.lat, point.lng]} radius={5} key={i} color={point.color}>
      <Tooltip>{point.tooltip}</Tooltip>
    </CircleMarker>
  ))
  return <>{elems}</>
}

export default Points
