import { Box, Divider } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import React, { useEffect, useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { PrettyDuration } from '../value-display/pretty-duration'
import { PrettyDistance } from '../value-display/pretty-distance'

/* eslint-disable-next-line */
export interface SummaryRow {
  id: string
  name: string
  numberOfTours: number
  numberOfBuildings: number
  numberOfUnits: number
  distance: number
  mtbd: number
  mdbd: number
  mttd: number
  mdtd: number
  mtbd_reference?: number
  mdbd_reference?: number
  mttd_reference?: number
  mdtd_reference?: number
}

export interface SummaryTableProps {
  rows: SummaryRow[]
  onRowSelected?: (id: string) => void
}

const columns: GridColDef<SummaryRow>[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Engineer' },
  { field: 'numberOfTours', headerName: 'Tours' },
  { field: 'numberOfBuildings', headerName: 'Buildings' },
  { field: 'numberOfUnits', headerName: 'Units' },
  {
    field: 'distance',
    headerName: 'Distance',
    renderCell: (params) => `${params.value / 1000} km`,
  },
  {
    field: 'mtbd',
    headerName: 'Time between devices',
    renderCell: (p) => <PrettyDuration duration={p.value} reference={p.row.mtbd_reference} />,
    width: 130,
  },
  {
    field: 'mdbd',
    headerName: 'Distance between devices',
    renderCell: (p) => <PrettyDistance distance={p.value} reference={p.row.mdbd_reference} />,
    width: 130,
  },
  {
    field: 'mttd',
    headerName: 'Time to devices',
    renderCell: (p) => <PrettyDuration duration={p.value} reference={p.row.mttd_reference} />,
    width: 130,
  },
  {
    field: 'mdtd',
    headerName: 'Distance to devices',
    renderCell: (p) => <PrettyDistance distance={p.value} reference={p.row.mdtd_reference} />,
    width: 130,
  },
]

export function SummaryTable(props: SummaryTableProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={props.rows}
        columns={columns}
        pageSize={20}
        rowsPerPageOptions={[20]}
        // checkboxSelection
        experimentalFeatures={{ newEditingApi: true }}
        autoHeight={true}
        onSelectionModelChange={(newSelection) => {
          if (newSelection.length && props.onRowSelected) {
            props.onRowSelected(newSelection[0].toString())
          }
        }}
      />
    </Box>
  )
}

export default SummaryTable
