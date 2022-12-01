import { Card, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useState } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { useDispatch, useSelector } from 'react-redux'
import { selectCountry } from '../../slices/dataset/dataset.selectors'
import { setCountry } from '../../slices/dataset/dataset.slice'

export function CountryPicker() {
  const countries = [
    { code: 'FR', name: 'France', icon: 'FR' },
    { code: 'UK', name: 'United-Kingdom', icon: 'GB' },
    { code: 'SG', name: 'Singapore', icon: 'SG' },
  ]

  const menuItems = countries.map((c, i) => (
    <MenuItem value={c.code} key={i}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ReactCountryFlag countryCode={c.icon} svg /> {c.name}
      </div>
    </MenuItem>
  ))
  const country = useSelector(selectCountry)
  const dispatch = useDispatch()

  return (
    <Card>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label"></InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={country}
          label=""
          onChange={(e) => dispatch(setCountry(e.target.value))}
        >
          {menuItems}
        </Select>
      </FormControl>
    </Card>
  )
}
