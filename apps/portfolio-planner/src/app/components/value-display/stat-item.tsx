import { Box, Paper } from '@mui/material'
import styled from 'styled-components'

const Item = styled(Paper)(({ theme }) => ({
  // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  // textAlign: 'center',
  padding: 0,
  color: theme.palette.text.secondary,
}))

export interface StatItemProps {
  title: string
  value: number
  unit: string
  reference: number
}

export const StatItem = (props: StatItemProps) => {
  let difference = Math.round(((props.value - props.reference) / props.reference) * 100)
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        boxShadow: 1,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Box sx={{ color: 'text.secondary', fontSize: 14 }}>{props.title}</Box>
      <Box sx={{ color: 'text.primary', fontSize: 34, fontWeight: 'medium' }}>
        {props.value.toFixed(2)} {props.unit}
      </Box>
      <Box
        sx={{
          color: difference <= 0 ? 'success.dark' : 'error.dark',
          display: 'inline',
          fontWeight: 'bold',
          mx: 0.5,
          fontSize: 14,
        }}
      >
        {difference > 0 ? '+' : ''}
        {difference}%
      </Box>
      <Box sx={{ color: 'text.secondary', display: 'inline', fontSize: 14 }}>vs. baseline</Box>
    </Box>
  )
}
