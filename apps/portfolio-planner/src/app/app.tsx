import React, { useEffect, useState } from 'react'
import { Message } from '@wemaintain/api-interfaces'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Unstable_Grid2'
import {
  Box,
  Card,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
} from '@mui/material'
import { Map } from './components/map/map'
import ControlPanel from './components/control-panel/control-panel'
import { positions } from '@mui/system'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

export const App = () => {
  return (
    <>
      <Box>
        <Box
          sx={{ position: 'absolute', zIndex: '500', right: 0, top: 0, m: 2 }}
        >
          <Card>
            <FormControl fullWidth size="small">
              <InputLabel id="demo-simple-select-label"></InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={10}
                label=""
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
          </Card>
        </Box>
        <Map />
      </Box>
      <ControlPanel />
    </>
  )
}

export default App
