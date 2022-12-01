require('isomorphic-fetch')

import { DatasetDevice, DatasetBuilding, DatasetEngineer } from '@wemaintain/api-interfaces'
import { Logger } from '@wemaintain/logger'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

export class Dataset {
  protected datasetFolder: string = 'datasets'

  constructor(
    public readonly countryCode: string,
    public readonly devices: DatasetDevice[],
    public readonly buildings: DatasetBuilding[],
    public readonly engineers: DatasetEngineer[]
  ) {
    buildings.sort((a, b) => a.building_id - b.building_id)
  }

  public writeToFile() {
    // Create folder if it does not exist
    if (!existsSync(this.datasetFolder)) {
      Logger.info('Creating folder: ' + this.datasetFolder)
      mkdirSync(this.datasetFolder)
    }

    writeFileSync(
      `${this.datasetFolder}/${this.countryCode}-dataset.json`,
      JSON.stringify({
        devices: this.devices,
        buildings: this.buildings,
        engineers: this.engineers,
      })
    )
  }

  public async computeDistanceMatrix() {
    // Build query string from buildings
    Logger.info('Computing distance matrix for ' + this.buildings.length + ' buildings')
    const coords = this.buildings.map((b) => `${b.longitude},${b.latitude}`).join(';')
    const response = await fetch('http://127.0.0.1:5000/table/v1/car/' + coords)
    const data = await response.json()

    writeFileSync(`${this.datasetFolder}/${this.countryCode}-matrix.json`, JSON.stringify(data))
    Logger.info('Finished computing distance matrix')
  }
}
