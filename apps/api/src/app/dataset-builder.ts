import { DatasetBuilding, DatasetDevice, DatasetEngineer } from '@wemaintain/api-interfaces'
import { Databricks } from '@wemaintain/databricks'
import { Logger } from '@wemaintain/logger'
import { readFileSync } from 'fs'
import { Dataset } from './dataset'

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

    const engineers = await db.doQuery<DatasetEngineer>(
      `SELECT * FROM portfolio_planner.active_mechanics WHERE country = "${countryCode}"`
    )

    return new Dataset(countryCode, devices, buildings, engineers)
  }

  public static async loadFromFile(countryCode: string) {
    const filename = `./datasets/${countryCode}-dataset.json`
    Logger.info('Loading dataset from : ' + filename)

    const content = readFileSync(filename)
    const json = JSON.parse(content.toString())

    return new Dataset(countryCode, json.devices, json.buildings, json.engineers)
  }
}
