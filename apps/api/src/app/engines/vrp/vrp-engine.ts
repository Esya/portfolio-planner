import {
  APIActivityType,
  APIProblem,
  APISolution,
  APISolutionTour,
  APISolutionTourStep,
  APISolutionEngineer,
  EngineersStatsRequest,
  APIProblemJob,
  APISolutionActivity,
} from '@wemaintain/api-interfaces'
import { Logger } from '@wemaintain/logger'
import { spawn } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { DateTime } from 'luxon'
import { tmpName } from 'tmp-promise'
import { EngineersStats } from '../../stats/engineers-stats'

import {
  VRPActivityType,
  VRPJob,
  VRPLocations,
  VRPMatrix,
  VRPProblem,
  VRPService,
  VRPShift,
  VRPSolution,
  VRPStop,
  VRPVehicle,
} from './vrp.interfaces'

export class VRPEngine {
  public static dummyProblem() {
    const numJobs = 60
    const numVehicles = 3
    const jobs: VRPJob[] = []
    const vehicles: VRPVehicle[] = []

    // Generate random jobs
    for (let i = 0; i < numJobs; i++) {
      jobs.push({
        id: 'job' + i,
        services: [
          {
            places: [
              {
                location: { lat: 48.85428 + Math.random() * 0.1, lng: 2.34706 + Math.random() * 0.1 },
                duration: 3600,
              },
            ],
          },
        ],
      })
    }

    for (let i = 0; i < numVehicles; i++) {
      vehicles.push({
        vehicleIds: ['vehicle' + i],
        typeId: 'type' + i,
        capacity: [10000],
        shifts: [
          {
            start: { earliest: '2022-12-03T09:00:00Z', location: { lat: 48.86776, lng: 2.29286 } },
            end: { latest: '2022-12-09T14:00:00Z', location: { lat: 48.86776, lng: 2.29286 } },
          },
        ],
        costs: {
          distance: 1,
          time: 1,
          fixed: 0,
        },
        profile: { matrix: 'car' },
      })
    }

    return {
      plan: {
        jobs: jobs,
      },
      fleet: {
        profiles: [{ name: 'car' }],
        vehicles: vehicles,
      },
    }
  }

  protected static convertVRPStep(type: VRPActivityType): APIActivityType {
    const mappings: { [key in VRPActivityType]: APIActivityType } = {
      break: 'break',
      departure: 'start',
      arrival: 'end',
      service: 'job',
      pickup: 'job',
    }

    return mappings[type]
  }

  public static async convertSolution(solution: VRPSolution): Promise<APISolution> {
    const vehicles: APISolutionEngineer[] = []
    solution.tours.forEach((tour) => {
      let id = tour.vehicleId
      let vehicle: APISolutionEngineer = vehicles.find((v) => v.mechanic_id === id)

      if (!vehicle) {
        vehicle = {
          mechanic_id: id,
          tours: [],
        } as APISolutionEngineer
        vehicles.push(vehicle)
      }

      const apiTour: APISolutionTour = {
        day_number: tour.shiftIndex,
        cost: tour.statistic.cost,
        duration: tour.statistic.duration,
        distance: tour.statistic.distance,
        service: tour.statistic.times.serving,
        setup: tour.statistic.times.parking,
        steps: this.makeStepsFromStops(tour.stops),
      }

      vehicle.tours.push(apiTour)
    })

    // Attach stats
    const doStats = vehicles.map(async (v) => {
      const homeLatLng = v.tours[0].steps[0].location
      const home = [homeLatLng[1], homeLatLng[0]]

      const devices = v.tours
        .flatMap((tour) => tour.steps)
        .flatMap((step) => step.activities)
        .filter((activity) => activity.type === 'job')
        // Distance matrices use lng/lat, not the other way around
        .map((a) => [a.location[1], a.location[0]])

      const input: EngineersStatsRequest = {
        devices: devices as [number, number][],
        home: home as [number, number],
      }

      Logger.debug('Computing stats for engineer #' + v.mechanic_id)

      const [fromHome, betweenDevices] = await Promise.all([
        EngineersStats.fromHome(input),
        EngineersStats.betweenDevices(input),
      ])

      v.stats = { fromHome, betweenDevices, countDevices: devices.length }
    })

    await Promise.all(doStats)

    return {
      statistics: {
        cost: solution.statistic.cost,
        service: solution.statistic.times.serving,
        distance: solution.statistic.distance,
        duration: solution.statistic.duration,
        waiting_time: solution.statistic.times.waiting,
        //@TODO Process unassigned
        unassigned: 100000,
        setup: solution.statistic.times.parking,
      },
      vehicles: vehicles,
    }
  }

  protected static makeStepsFromStops(stops: VRPStop[]): APISolutionTourStep[] {
    const steps: APISolutionTourStep[] = stops.map((stop) => {
      const duration = DateTime.fromISO(stop.time.arrival)
        .diff(DateTime.fromISO(stop.time.departure))
        .as('seconds')

      return {
        // Cast arrival to unix timestamp from ISO String
        arrival: DateTime.fromISO(stop.time.arrival).toSeconds(),
        departure: DateTime.fromISO(stop.time.departure).toSeconds(),
        distance: stop.distance,
        location: [stop.location.lat, stop.location.lng],
        activities: stop.activities.flatMap((activity) => {
          const buildingId = activity.jobId || undefined
          const deviceIds = activity.jobTag ? activity.jobTag.split('_') : []
          const type = this.convertVRPStep(activity.type)
          if (type !== 'job') {
            return [
              {
                type,
                time: activity.time
                  ? {
                      start: DateTime.fromISO(activity.time.start).toSeconds(),
                      end: DateTime.fromISO(activity.time.end).toSeconds(),
                    }
                  : undefined,
                location: activity.location
                  ? [activity.location.lat, activity.location.lng]
                  : [stop.location.lat, stop.location.lng],
              } as APISolutionActivity,
            ]
          }

          // Split it per device
          return deviceIds.map((deviceId) => ({
            type,
            location: activity.location
              ? [activity.location.lat, activity.location.lng]
              : [stop.location.lat, stop.location.lng],
            device_id: deviceId,
            building_id: buildingId,
          }))
        }),
      } as APISolutionTourStep
    })

    return steps
  }

  protected static async convertAPIJobs(apiJobs: APIProblemJob[]): Promise<VRPJob[]> {
    const jobsByBuilding = new Map<string, APIProblemJob[]>()
    apiJobs.forEach((job) => {
      const jobs = jobsByBuilding.get(job.building_id) || []
      jobsByBuilding.set(job.building_id, [...jobs, job])
    })

    const buildingIds = [...jobsByBuilding.keys()]
    const vrpJobs: VRPJob[] = buildingIds.map((buildingId) => {
      const jobsForBuilding = jobsByBuilding.get(buildingId)
      const firstJob = jobsForBuilding[0]
      const totalDuration = jobsForBuilding.reduce((acc, job) => acc + job.duration, 0)

      return {
        id: buildingId,
        pickups: [
          {
            places: [
              {
                duration: totalDuration,
                location: firstJob.location,
                tag: jobsForBuilding.map((j) => j.device_id).join('_'),
              },
            ],
            demand: [totalDuration],
          },
        ],
      }
    })

    return vrpJobs
  }

  public static async convertProblem(apiProblem: APIProblem): Promise<VRPProblem> {
    // Build jobs by grouping activities by building
    const vrpJobs = await this.convertAPIJobs(apiProblem.jobs)

    const problem: VRPProblem = {
      fleet: {
        profiles: [{ name: 'car' }],
        vehicles: apiProblem.vehicles.map((v) => {
          const location = { lat: v.location.lat, lng: v.location.lng }
          let shifts: VRPShift[] = []
          if (apiProblem.dayOptions) {
            const day_numbers = [...Array(apiProblem.dayOptions.numberOfDays).keys()]
            const firstDay = DateTime.now().plus({ days: 1 })
            shifts = day_numbers.map((n) => {
              const start = firstDay
                .plus({ days: n })
                .set({ hour: apiProblem.dayOptions.dayStartHour, minute: 0, second: 0, millisecond: 0 })
              const end = firstDay
                .plus({ days: n })
                .set({ hour: apiProblem.dayOptions.dayEndHour, minute: 0, second: 0, millisecond: 0 })
              return {
                start: { earliest: start.toISO(), location },
                end: { latest: end.toISO(), location },
              }
            })
          } else {
            // We create a single, super long shift
            const firstDay = DateTime.now().plus({ days: 1 })
            const lastday = DateTime.now().plus({ days: 50 })

            shifts = [
              {
                start: { earliest: firstDay.toISO(), location },
                end: { latest: lastday.toISO(), location },
              },
            ]
          }

          return {
            capacity: [1000000],
            costs: { distance: 1, fixed: 1, time: 1 },
            profile: { matrix: 'car', scale: 1 },
            shifts: shifts,
            typeId: 'type_' + v.mechanic_id,
            vehicleIds: [v.mechanic_id.toString()],
          }
        }),
      },
      plan: {
        jobs: vrpJobs,
      },
      objectives: [
        [
          {
            type: 'minimize-unassigned',
          },
          { type: 'maximize-tours' },
        ],
        [
          {
            type: 'minimize-cost',
          },
          { type: 'balance-max-load' },
        ],
      ],
    }

    return problem
  }

  protected static async executeCommand(command: string, args: string[]) {
    Logger.debug(`Executing command: ${command} ${args.join(' ')}`)
    return new Promise((resolve, reject) => {
      const cli = spawn(command, args)
      cli.stdout.on('data', (data) => {
        Logger.debug(`stdout: ${data}`)
      })

      cli.stderr.on('data', (data) => {
        Logger.error(`stderr: ${data}`)
      })

      cli.on('error', (error) => {
        Logger.error(`error: ${error.message}`)
        reject(error)
      })

      cli.on('close', (code) => {
        Logger.debug(`child process exited with code ${code}`)
        resolve(code)
      })
    })
  }

  public static async solve(problem: VRPProblem) {
    const locations = await this.extractLocations(problem)
    const matrix = await this.computeDistanceMatrix(locations)

    const result = await this.optimize(problem, matrix)
    Logger.debug('Finished solving')
    return result
  }

  private static async optimize(problem: VRPProblem, matrix: VRPMatrix): Promise<VRPSolution> {
    const problemPath = await tmpName({ postfix: '.json' })
    const matrixPath = await tmpName({ postfix: '.json' })
    const outputFile = await tmpName({ postfix: '.json' })
    const geojson = await tmpName({ postfix: '.json' })

    await writeFile(problemPath, JSON.stringify(problem))
    await writeFile(matrixPath, JSON.stringify(matrix))

    await this.executeCommand('vrp-cli', [
      'solve',
      'pragmatic',
      problemPath,
      '-m',
      matrixPath,
      '-o',
      outputFile,
      '-g',
      geojson,
      '-c',
      'conf/vrp.config.json',
    ])

    return readFile(outputFile, 'utf8').then((data) => JSON.parse(data))
  }

  private static async computeDistanceMatrix(locations: VRPLocations): Promise<VRPMatrix> {
    // Build query string from buildings
    Logger.info('Computing distance matrix for ' + locations.length + ' locations')
    const coords = locations.map((b) => `${b.lng},${b.lat}`).join(';')
    const response = await fetch(
      `${process.env.OSRM_SERVER_FRANCE}/table/v1/car/${coords}?annotations=duration,distance`
    )
    const data = await response.json()
    Logger.info('Finished computing distance matrix')

    // Flatten distances and durations, and round-off to integers
    const distances = data.distances.flat().map((d) => Math.round(d))
    const travelTimes = data.durations.flat().map((d) => Math.round(d))
    return { travelTimes, distances, profile: 'car' }
  }

  public static async extractLocations(problem: VRPProblem) {
    Logger.info('Extracting locations from problem')
    const inputFile = await tmpName({ postfix: '.json' })
    const outputFile = await tmpName({ postfix: '.json' })

    await writeFile(inputFile, JSON.stringify(problem))
    await this.executeCommand('vrp-cli', [
      'solve',
      'pragmatic',
      inputFile,
      '--get-locations',
      '-o',
      outputFile,
    ])

    return readFile(outputFile, 'utf8').then((data) => JSON.parse(data))
  }

  // public async solve(problem: VRPProblem): Promise<VRPSolution> {

  // }
}
