import { CardContent, Divider, Paper, styled } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/system/Box'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllEngineers } from '../../slices/dataset/dataset.selectors'
import { selectSolution } from '../../slices/results/results.seslectors'
import { highlightEngineer } from '../../slices/results/results.slice'
import SummaryTable, { SummaryRow } from './summary-table'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import { StatItem } from '../value-display/stat-item'

/* eslint-disable-next-line */
export interface SimulationResultProps {}

export function SimulationResults(props: SimulationResultProps) {
  const solution = useSelector(selectSolution)
  const engineers = useSelector(selectAllEngineers)
  const dispatch = useDispatch()

  const [rows, setRows] = useState<SummaryRow[]>([])

  const rowClicked = (id: string) => dispatch(highlightEngineer(id))

  useEffect(() => {
    if (!solution) {
      return
    }

    const summaryRows: SummaryRow[] = []
    solution.vehicles.forEach((vehicle) => {
      const engineer = engineers.find((e) => e.mechanic_id.toString() === vehicle.mechanic_id.toString())
      summaryRows.push({
        id: vehicle.mechanic_id,
        name: `${engineer?.first_name} ${engineer?.last_name}`,
        numberOfTours: vehicle.tours.length,
        numberOfBuildings: vehicle.tours.reduce((acc, tour) => acc + tour.steps.length - 2, 0),
        numberOfUnits: vehicle.tours
          .flatMap((tour) => tour.steps)
          .flatMap((step) => step.activities)
          .filter((a) => a.type === 'job').length,
        distance: vehicle.tours.reduce((acc, tour) => acc + tour.distance, 0),
        mdbd: vehicle.stats.betweenDevices.meanDistance,
        mtbd: vehicle.stats.betweenDevices.meanTime,
        mdtd: vehicle.stats.fromHome.meanDistance,
        mttd: vehicle.stats.fromHome.meanTime,
        mdbd_reference: engineer?.stats.betweenDevices.meanDistance,
        mtbd_reference: engineer?.stats.betweenDevices.meanTime,
        mdtd_reference: engineer?.stats.fromHome.meanDistance,
        mttd_reference: engineer?.stats.fromHome.meanTime,
      })
    })
    setRows(summaryRows)
  }, [engineers, solution])

  return (
    <Box sx={{ m: 2 }}>
      <Card sx={{ backgroundColor: 'primary.800' }}>
        <CardHeader title="Simulation Summary" />
        <CardContent sx={{ py: 0 }}>
          <Box sx={{ pb: 2 }}>
            <Grid container spacing={1}>
              <Grid xs={12} md={3}>
                <StatItem delta={-3.8} stat="27 min" title="Mean time between devices" />
              </Grid>
              <Grid xs={12} md={3}>
                <StatItem delta={-3.8} stat="4.83 km" title="Mean distance between devices" />
              </Grid>
              <Grid xs={12} md={3}>
                <StatItem delta={-3.8} stat="31 min" title="Mean time to devices" />
              </Grid>
              <Grid xs={12} md={3}>
                <StatItem delta={-3.8} stat="16.30 km" title="Mean distance to devices" />
              </Grid>
            </Grid>
          </Box>
          <SummaryTable rows={rows} onRowSelected={rowClicked} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default SimulationResults
