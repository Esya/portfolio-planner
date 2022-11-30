require('isomorphic-fetch')

import { Logger } from '@wemaintain/logger'
import { writeFileSync } from 'fs'

export interface DatasetBuilding {
  building_id: number
  building_name: string
  latitude: number
  longitude: number
  country: string
}

export interface DatasetDevice {
  device_id: string
  building_id: string
  contract_id: string
  mechanic_id: number
  type: string
  country: string
  amount: number
}

export class Dataset {
  constructor(
    public readonly devices: DatasetDevice[],
    public readonly buildings: DatasetBuilding[]
  ) {
    buildings.sort((a, b) => a.building_id - b.building_id)
  }

  public writeToFile(filename: string) {
    writeFileSync(
      filename,
      JSON.stringify({ devices: this.devices, buildings: this.buildings })
    )
  }

  public async computeDistanceMatrix() {
    // Build query string from buildings
    Logger.info(
      'Computing distance matrix for ' + this.buildings.length + ' buildings'
    )
    const coords = this.buildings
      .map((b) => `${b.longitude},${b.latitude}`)
      .join(';')
    const response = await fetch('http://127.0.0.1:5000/table/v1/car/' + coords)
    const data = await response.json()

    writeFileSync('distance-matrix.json', JSON.stringify(data))
    Logger.info('Finished computing distance matrix')
  }
}
