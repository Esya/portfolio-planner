import { Chip } from '@mui/material'

export const ComparisonChip = (props: { value: number; reference?: number }) => {
  if (!props.reference) {
    return null
  }

  let difference = Math.round(((props.value - props.reference) / props.reference) * 100)

  return (
    <Chip
      label={`${difference > 0 ? '+' : ''}${difference}%`}
      size="small"
      color={difference > 0 ? 'error' : 'success'}
      sx={{ m: 1 }}
    />
  )
}
