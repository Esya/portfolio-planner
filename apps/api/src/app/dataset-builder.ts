import {
  DatasetBuilding,
  DatasetDevice,
  DatasetEngineer,
  EngineersStatsRequest,
  GlobalStats,
} from '@wemaintain/api-interfaces'
import { Databricks } from '@wemaintain/databricks'
import { Logger } from '@wemaintain/logger'
import e = require('express')
import { readFileSync } from 'fs'
import { Dataset } from './dataset'
import { EngineersStats } from './stats/engineers-stats'

export class DatasetBuilder {
  public static async build(countryCode: string) {
    Logger.info('Building dataset for country code: ' + countryCode)
    const db = new Databricks()

    // @TODO - Only building incomplete datasets for now, where we have lat/long for engineers
    const devices = await db.doQuery<DatasetDevice>(
      `SELECT * FROM portfolio_planner.active_devices WHERE country = "${countryCode}"`
    )

    const buildings = await db.doQuery<DatasetBuilding>(
      `SELECT * FROM portfolio_planner.active_buildings WHERE country = "${countryCode}"`
    )

    const engineers = await db.doQuery<DatasetEngineer>(
      `SELECT * FROM portfolio_planner.active_mechanics WHERE country = "${countryCode}" AND latitude IS NOT NULL`
    )

    const mechanicIds = engineers.map((e) => e.mechanic_id.toString())
    let filteredDevices = devices.filter((d) => mechanicIds.includes(d.mechanic_id.toString()))
    let keepBuildingIds = filteredDevices.map((d) => d.building_id.toString())
    let filteredBuildings = buildings
      .filter((b) => keepBuildingIds.includes(b.building_id.toString()))
      .map((b) => {
        return {
          ...b,
          devices: filteredDevices.filter((d) => d.building_id.toString() === b.building_id.toString()),
        }
      })

    await this.addStatsToEngineers(engineers, filteredBuildings)
    const stats = this.computeStats(engineers)
    return new Dataset(countryCode, filteredBuildings, engineers, stats)
  }

  protected static computeStats(engineers: DatasetEngineer[]): GlobalStats {
    const avgProperty = (
      engineers: DatasetEngineer[],
      type: 'betweenDevices' | 'fromHome',
      property: 'meanTime' | 'meanDistance'
    ) => {
      const sum = engineers.reduce((acc, e) => acc + e.stats[type][property], 0)
      return sum / engineers.length
    }

    return {
      assignedUnits: 0,
      unassignedUnits: 0,
      mdbd: avgProperty(engineers, 'betweenDevices', 'meanDistance'),
      mtbd: avgProperty(engineers, 'betweenDevices', 'meanTime'),
      mttd: avgProperty(engineers, 'fromHome', 'meanTime'),
      mdtd: avgProperty(engineers, 'fromHome', 'meanDistance'),
    }
  }

  public static async loadFromFile(countryCode: string) {
    const filename = `./datasets/${countryCode}-dataset.json`
    Logger.info('Loading dataset from : ' + filename)

    const content = readFileSync(filename)
    const json = JSON.parse(content.toString())

    return new Dataset(countryCode, json.buildings, json.engineers, json.stats)
  }

  protected static async addStatsToEngineers(engineers: DatasetEngineer[], buildings: DatasetBuilding[]) {
    Logger.info('Adding time/distance stats to engineers')
    const p = engineers.map((e) => {
      const home: [number, number] = [e.longitude, e.latitude]
      const deviceCoordinates: [number, number][] = buildings.reduce((acc, b) => {
        const matchingDevices = b.devices.filter((d) => d.mechanic_id.toString() === e.mechanic_id.toString())
        return [...acc, ...matchingDevices.map((_) => [b.longitude, b.latitude])]
      }, [] as [number, number][]) as [number, number][]

      return this.addStatsToEngineer(e, { home, devices: deviceCoordinates })
    })

    await Promise.all(p)
    Logger.info('Done computing time/distance stats for engineers')
    return
  }

  protected static async addStatsToEngineer(engineer: DatasetEngineer, input: EngineersStatsRequest) {
    Logger.debug('Adding time/distance stats to engineer ' + engineer.mechanic_id)
    const [fromHome, betweenDevices] = await Promise.all([
      EngineersStats.fromHome(input),
      EngineersStats.betweenDevices(input),
    ])
    engineer.stats = { fromHome, betweenDevices, countDevices: input.devices.length }
  }
}
