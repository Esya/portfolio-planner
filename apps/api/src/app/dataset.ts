import { DatasetDevice, DatasetBuilding, DatasetEngineer } from '@wemaintain/api-interfaces'
import { Logger } from '@wemaintain/logger'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

export class Dataset {
  protected datasetFolder: string = 'datasets'

  constructor(
    public readonly countryCode: string,
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
        buildings: this.buildings,
        engineers: this.engineers,
      })
    )
  }
}
