import React, { useEffect, useState } from 'react'
import { Box, Button } from '@mui/material'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { EngineerTable } from '../engineer-table/engineer-table'
import { useDispatch } from 'react-redux'
import { runOptimizer } from '../../slices/dataset/dataset.slice'
import SimulationResults from '../simulation-results/simulation-results'

/* eslint-disable-next-line */
export interface ControlPanelProps {}

export function ControlPanel(props: ControlPanelProps) {
  const [value, setValue] = useState(0)
  const dispatch = useDispatch()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'primary.800',
        }}
      >
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Dataset" />
          <Tab label="Base scenario" />
          <Tab label="Scenario #1" />
          <Tab label="Scenario #2" />
        </Tabs>
        {value == 0 && <EngineerTable />}
        {value == 1 && <SimulationResults />}
        <Button variant="outlined" onClick={() => dispatch(runOptimizer())}>
          Run Optimizer
        </Button>
      </Box>
    </>
  )
}

export default ControlPanel
