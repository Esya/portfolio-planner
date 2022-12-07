import { CardContent, Divider } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/system/Box'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllEngineers } from '../../slices/dataset/dataset.selectors'
import { selectSolution } from '../../slices/results/results.seslectors'
import { highlightEngineer } from '../../slices/results/results.slice'
import SummaryTable, { SummaryRow } from './summary-table'

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
        <CardContent>
          <SummaryTable rows={rows} onRowSelected={rowClicked} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default SimulationResults
