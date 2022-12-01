import * as React from 'react'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid'
import { useSelector } from 'react-redux'
import { selectEngineers } from '../../slices/dataset/dataset.selectors'

const columns: GridColDef[] = [
  { field: 'mechanic_id', headerName: 'ID', width: 70 },
  { field: 'first_name', headerName: 'First name', width: 130 },
  { field: 'last_name', headerName: 'Last name', width: 130 },
]

export function EngineerTable() {
  const rows = useSelector(selectEngineers)
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
