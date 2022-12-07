import { ComparisonChip } from './comparison-chip'

export const PrettyDuration = (props: { duration: number; reference?: number }) => {
  const humanDuration = Math.round(props.duration / 60)
  return (
    <>
      {humanDuration} min <ComparisonChip value={props.duration} reference={props.reference} />
    </>
  )
}
