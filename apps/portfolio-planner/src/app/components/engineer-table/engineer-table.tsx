import * as React from 'react'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid'
import { useSelector } from 'react-redux'
import { selectAllEngineers } from '../../slices/dataset/dataset.selectors'
import { PrettyDuration } from '../value-display/pretty-duration'
import { DatasetEngineer } from '@wemaintain/api-interfaces'
import { PrettyDistance } from '../value-display/pretty-distance'

const columns: GridColDef<DatasetEngineer>[] = [
  { field: 'mechanic_id', headerName: 'ID', width: 70 },
  { field: 'first_name', headerName: 'First name', width: 130 },
  { field: 'last_name', headerName: 'Last name', width: 130 },
  { field: 'count_devices', headerName: 'Count devices', width: 130 },
  {
    field: 'mtbd',
    headerName: 'Time between devices',
    renderCell: (p) => <PrettyDuration duration={p.row.stats.betweenDevices.meanTime} />,
    width: 130,
  },
  {
    field: 'mdbd',
    headerName: 'Distance between devices',
    renderCell: (p) => <PrettyDistance distance={p.row.stats.betweenDevices.meanDistance} />,
    width: 130,
  },
  {
    field: 'mttd',
    headerName: 'Time to devices',
    renderCell: (p) => <PrettyDuration duration={p.row.stats.fromHome.meanTime} />,
    width: 130,
  },
  {
    field: 'mdtd',
    headerName: 'Distance to devices',
    renderCell: (p) => <PrettyDistance distance={p.row.stats.fromHome.meanDistance} />,
    width: 130,
  },
]

export function EngineerTable() {
  const rows = useSelector(selectAllEngineers)
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        getRowId={(row) => row.mechanic_id}
      />
    </div>
  )
}
