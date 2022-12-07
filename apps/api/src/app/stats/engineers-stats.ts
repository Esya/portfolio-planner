import { EngineersStatsRequest, EngineersStatsResult } from '@wemaintain/api-interfaces'
import { Logger } from '@wemaintain/logger'

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
    const coordsString = coords.map((c) => c.join(',')).join(';')

    const response = await fetch(
      `${process.env.OSRM_SERVER_FRANCE}/table/v1/car/${coordsString}?annotations=duration,distance&sources=0`
    )
    const data = await response.json()

    const distances = data.distances[0]
    const time = data.durations[0]

    const meanDistance = distances.reduce((a, b) => a + b, 0) / distances.length
    const meanTime = time.reduce((a, b) => a + b, 0) / time.length

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

    const coords: [number, number][] = [...input.devices]
    const coordsString = coords.map((c) => c.join(',')).join(';')

    const response = await fetch(
      `${process.env.OSRM_SERVER_FRANCE}/table/v1/car/${coordsString}?annotations=duration,distance`
    )
    const data = await response.json()

    const length = data.distances.length
    const meanDistances: number[] = []
    const meanTimes: number[] = []

    for (let i = 0; i < length; i++) {
      const distances = data.distances[i]
      const times = data.durations[i]
      const meanDistance =
        distances.filter((_, index) => index !== i).reduce((a, b) => a + b, 0) / (length - 1)
      const meanTime = times.filter((_, index) => index !== i).reduce((a, b) => a + b, 0) / (length - 1)

      meanDistances.push(meanDistance)
      meanTimes.push(meanTime)
    }

    const meanDistance = meanDistances.reduce((a, b) => a + b, 0) / meanDistances.length
    const meanTime = meanTimes.reduce((a, b) => a + b, 0) / meanTimes.length

    return { meanDistance, meanTime }
  }
}
