import { APIDayOptions, APIProblem, APIProblemVehicle, APISolution } from '@wemaintain/api-interfaces'
import { Logger } from '@wemaintain/logger'
import { writeFile } from 'fs/promises'
import { tmpName } from 'tmp-promise'
import { VroomJob, VroomProblem, VroomVehicle, VroomTimeWindow, VroomSolution } from './vroom.interfaces'
import { DateTime } from 'luxon'

export class VroomEngine {
  protected static makeVehicles(
    input: APIProblemVehicle[],
    commonOptions?: Partial<VroomVehicle>,
    dayOptions?: APIDayOptions
  ): VroomVehicle[] {
    const vehicles: VroomVehicle[] = []
    let vehicleIndex = 0
    let time_windows: VroomTimeWindow[] = []

    if (dayOptions) {
      const day_numbers = [...Array(dayOptions.numberOfDays).keys()]
      const firstDay = DateTime.now().plus({ days: 1 })
      time_windows = day_numbers.map((n) => {
        const start = firstDay
          .plus({ days: n })
          .set({ hour: dayOptions.dayStartHour, minute: 0, second: 0, millisecond: 0 })
        const end = firstDay
          .plus({ days: n })
          .set({ hour: dayOptions.dayEndHour, minute: 0, second: 0, millisecond: 0 })
        return [start.toUnixInteger(), end.toUnixInteger()]
      })
    }

    for (let i = 0; i < input.length; i++) {
      const v = input[i]
      const output = {
        description: v.mechanic_id.toString(),
        start: [v.location.lng, v.location.lat],
        end: [v.location.lng, v.location.lat],
        ...commonOptions,
      } as VroomVehicle

      if (!dayOptions) {
        vehicles.push({ id: vehicleIndex++, ...output })
      } else {
        const splitByDay = time_windows.map((tw, day) => {
          return {
            ...output,
            id: vehicleIndex++,
            description: `${v.mechanic_id.toString()}_${day}`,
            time_window: tw,
          }
        })
        vehicles.push(...splitByDay)
      }
    }

    return vehicles
  }

  protected static async convertProblem(problem: APIProblem): Promise<VroomProblem> {
    const vehicles = this.makeVehicles(problem.vehicles, {}, problem.dayOptions)
    const jobs: VroomJob[] = problem.jobs.map((j, i) => {
      return {
        id: i,
        description: `${j.building_id}_${j.device_id}`,
        location: [j.location.lng, j.location.lat],
        service: j.duration,
      }
    })
    return {
      vehicles: vehicles,
      jobs: jobs,
      shipments: [],
    }
  }

  /**
   * Merge the vehicles representing the same mechanic (different days)
   *
   * @param solution
   * @returns
   */
  protected static convertSolution(solution: VroomSolution): APISolution {
    const stats = solution.summary

    return {
      statistics: {
        cost: stats.cost,
        unassigned: stats.unassigned,
        setup: stats.setup,
        service: stats.service,
        duration: stats.duration,
        waiting_time: stats.waiting_time,
        computing_times: {
          loading: stats.computing_times.loading,
          solving: stats.computing_times.solving,
          routing: stats.computing_times.routing,
        },
      },
      vehicles: [],
    }
  }

  public static async solve(problem: APIProblem) {
    const vroomProblem = await this.convertProblem(problem)

    const problemFile = await tmpName({ postfix: '.json' })
    await writeFile(problemFile, JSON.stringify(vroomProblem))

    Logger.info('Solving problem', { problemFile })

    const response = await fetch('http://127.0.0.1:3000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...vroomProblem, options: { g: true } }),
    })

    const data = await response.json()
    const solutionFile = await tmpName({ postfix: '.json' })
    await writeFile(solutionFile, JSON.stringify(data))
    Logger.info('Received solution', { solutionFile })

    return data as VroomSolution
  }
}
