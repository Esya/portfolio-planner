import { Chip } from '@mui/material'

export const ComparisonChip = (props: { value: number; reference?: number }) => {
  if (!props.reference) {
    return null
  }

  let difference = Math.round(((props.value - props.reference) / props.reference) * 100)

  let color: 'default' | 'error' | 'success' = 'default'
  if (difference > 20) {
    color = 'error'
  }
  if (difference < -20) {
    color = 'success'
  }

  return (
    <Chip label={`${difference > 0 ? '+' : ''}${difference}%`} size="small" color={color} sx={{ m: 1 }} />
  )
}
