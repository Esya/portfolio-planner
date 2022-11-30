import { Databricks } from '@wemaintain/databricks'
import { Logger } from '@wemaintain/logger'
import { readFileSync } from 'fs'
import { Dataset, DatasetBuilding, DatasetDevice } from './dataset'

export class DatasetBuilder {
  public static async build(countryCode: string) {
    Logger.info('Building dataset for country code: ' + countryCode)
    const db = new Databricks()
    const devices = await db.doQuery<DatasetDevice>(
      `SELECT * FROM portfolio_planner.active_devices WHERE country = "${countryCode}"`
    )

    const buildings = await db.doQuery<DatasetBuilding>(
      `SELECT * FROM portfolio_planner.active_buildings WHERE country = "${countryCode}"`
    )

    return new Dataset(devices, buildings)
  }

  public static async loadFromFile(filename: string) {
    Logger.info('Loading dataset from : ' + filename)

    const content = readFileSync(filename)
    const json = JSON.parse(content.toString())

    return new Dataset(json.devices, json.buildings)
  }
}
