import {
  DatasetDevice,
  DatasetBuilding,
  DatasetEngineer,
  DatasetResponse,
  GlobalStats,
  Country,
} from '@wemaintain/api-interfaces'
import { Logger } from '@wemaintain/logger'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

export class Dataset {
  protected datasetFolder: string = 'datasets'

  constructor(
    public readonly countryCode: string,
    public readonly buildings: DatasetBuilding[],
    public readonly engineers: DatasetEngineer[],
    public readonly stats: GlobalStats
  ) {
    buildings.sort((a, b) => a.building_id - b.building_id)
  }

  public static loadFromFile(country: Country) {
    const filename = `./datasets/${country}-dataset.json`
    Logger.info('Loading dataset from : ' + filename)

    const content = readFileSync(filename)
    const json = JSON.parse(content.toString())

    return new Dataset(country, json.buildings, json.engineers, json.stats)
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
        stats: this.stats,
      } as DatasetResponse)
    )
  }
}
