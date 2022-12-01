import {
  Box,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import ReactCountryFlag from 'react-country-flag'

import ControlPanel from './components/control-panel/control-panel'
import { CountryPicker } from './components/country-picker/country-picker'
import { Map } from './components/map/map'

export const App = () => {
  return (
    <>
      <Box>
        <Box
          sx={{ position: 'absolute', zIndex: '500', right: 0, top: 0, m: 2 }}
        >
          <CountryPicker />
        </Box>
        <Map />
      </Box>
      <ControlPanel />
    </>
  )
}

export default App
