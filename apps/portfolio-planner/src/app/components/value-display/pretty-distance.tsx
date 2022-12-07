import { ComparisonChip } from './comparison-chip'

export const PrettyDistance = (props: { distance: number; reference?: number }) => {
  const distance = props.distance / 1000
  return (
    <>
      {distance.toFixed(2)} km <ComparisonChip value={props.distance} reference={props.reference} />
    </>
  )
}
