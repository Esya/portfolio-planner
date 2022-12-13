import {
  EngineersStatsRequest,
  EngineersStatsResponse,
  EngineersStatsResult,
  GlobalStats,
} from '@wemaintain/api-interfaces'
import { OSRM } from '../osrm'

interface Matrice {
  time: [number][]
  distance: [number][]
}

/**
 * Goal is to calculate the given metrics :
 *
 * - Mean time to device (from HOME)
 * - Mean time between devices
 * - Mean distance to device (from HOME)
 * - Mean distance between devices
 */
export class EngineersStats {
  /**
   * Compute the mean distance and time from home to device
   */
  public static async fromHome(input: EngineersStatsRequest): Promise<EngineersStatsResult> {
    const coords: [number, number][] = [input.home, ...input.devices]
    const res = await OSRM.getDistanceMatrix(input.country, coords, [0])

    const distances = res.distances[0]
    const durations = res.durations[0]

    const meanDistance = distances.reduce((a, b) => a + b, 0) / distances.length
    const meanTime = durations.reduce((a, b) => a + b, 0) / durations.length

    return { meanDistance, meanTime }
  }

  /**
   * Compute the mean distance and time between each device
   * @param matrice
   */
  public static async betweenDevices(input: EngineersStatsRequest): Promise<EngineersStatsResult> {
    if (input.devices.length <= 1) {
      return { meanDistance: 0, meanTime: 0 }
    }

    const { distances, durations } = await OSRM.getDistanceMatrix(input.country, [...input.devices])

    const length = distances.length
    const meanDistances: number[] = []
    const meanTimes: number[] = []

    for (let i = 0; i < length; i++) {
      const deviceDistances = distances[i]
      const deviceDurations = durations[i]
      const meanDistance =
        deviceDistances.filter((_, index) => index !== i).reduce((a, b) => a + b, 0) / (length - 1)
      const meanTime =
        deviceDurations.filter((_, index) => index !== i).reduce((a, b) => a + b, 0) / (length - 1)

      meanDistances.push(meanDistance)
      meanTimes.push(meanTime)
    }

    const meanDistance = meanDistances.reduce((a, b) => a + b, 0) / meanDistances.length
    const meanTime = meanTimes.reduce((a, b) => a + b, 0) / meanTimes.length

    return { meanDistance, meanTime }
  }

  public static computeGlobalStats(input: EngineersStatsResponse[]): GlobalStats {
    const avgProperty = (
      engineers: EngineersStatsResponse[],
      type: 'betweenDevices' | 'fromHome',
      property: 'meanTime' | 'meanDistance'
    ) => {
      const sum = engineers.reduce((acc, e) => acc + e[type][property], 0)
      return sum / engineers.length
    }

    return {
      assignedUnits: 0,
      unassignedUnits: 0,
      mdbd: avgProperty(input, 'betweenDevices', 'meanDistance'),
      mtbd: avgProperty(input, 'betweenDevices', 'meanTime'),
      mttd: avgProperty(input, 'fromHome', 'meanTime'),
      mdtd: avgProperty(input, 'fromHome', 'meanDistance'),
    }
  }
}
