import {
  APIDayOptions,
  APIProblem,
  APIProblemVehicle,
  APISolution,
  APISolutionTour,
  APISolutionTourStep,
  APISolutionEngineer,
} from '@wemaintain/api-interfaces'
import { Logger } from '@wemaintain/logger'
import { writeFile } from 'fs/promises'
import { tmpName } from 'tmp-promise'
import { VroomJob, VroomProblem, VroomVehicle, VroomTimeWindow, VroomSolution } from './vroom.interfaces'
import { DateTime, Duration } from 'luxon'

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
        vehicles.push({ id: vehicleIndex++, ...output, costs: { fixed: 0 } })
      } else {
        const splitByDay = time_windows.map((tw, day) => {
          return {
            ...output,
            id: vehicleIndex++,
            costs: {
              per_hour: dayOptions.increaseCostEachDay ? 3600 + 3600 * day * 10 : 3600,
              fixed: 0 + 50000 * day,
            },
            description: `${v.mechanic_id.toString()}_${day}`,
            time_window: tw,
          } as VroomVehicle
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
  public static convertSolution(solution: VroomSolution): APISolution {
    const stats = solution.summary
    const mechanics = new Map<string, APISolutionEngineer>()
    const solutionVehicles: APISolutionEngineer[] = []

    solution.routes.forEach((route) => {
      // Extract mechanic_id and optionally day_number
      const [mechanicId, day] = route.description.split('_')
      if (!mechanics.get(mechanicId)) {
        mechanics.set(mechanicId, { mechanic_id: mechanicId, tours: [], stats: {} as any })
      }

      const mechanic = mechanics.get(mechanicId)

      // Build steps
      const steps: APISolutionTourStep[] = route.steps.map((step) => {
        const isJob = step.type === 'job'
        let buildingId: string, deviceId: string

        if (isJob) {
          ;[buildingId, deviceId] = step.description.split('_')
        }

        return {
          arrival: step.arrival,
          departure: step.arrival + step.duration,
          location: step.location,
          distance: step.distance,
          activities: [
            { type: step.type, building_id: buildingId, device_id: deviceId, location: step.location },
          ],
        } as APISolutionTourStep
      })

      // Save tour
      const tour: APISolutionTour = {
        cost: route.cost,
        distance: route.distance,
        duration: route.duration,
        service: route.service,
        setup: route.setup,
        day_number: parseInt(day),
        geometry: route.geometry,
        steps: steps,
      }
      mechanic.tours.push(tour)
    })

    return {
      stats: {
        assignedUnits: 0,
        mdbd: 0,
        mdtd: 0,
        mtbd: 0,
        mttd: 0,
        unassignedUnits: 0,
      },
      vrpStats: {
        distance: 0,
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
      vehicles: [...mechanics.values()],
    }
  }

  public static async solve(problem: APIProblem) {
    try {
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
    } catch (e) {
      Logger.error(e)
      return
    }
  }
}
