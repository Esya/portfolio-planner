import { spawn } from 'child_process'
import { VRPJob, VRPLocations, VRPMatrix, VRPProblem, VRPSolution, VRPVehicle } from './vrp.interfaces'
import { tmpName } from 'tmp-promise'
import { readFile, writeFile } from 'fs/promises'
import { Logger } from '@wemaintain/logger'

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

  private static async optimize(problem: VRPProblem, matrix: VRPMatrix) {
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
      '--parallelism',
      '2,4',
      '--max-time',
      '300',
    ])

    return readFile(outputFile, 'utf8').then((data) => JSON.parse(data))
  }

  private static async computeDistanceMatrix(locations: VRPLocations): Promise<VRPMatrix> {
    // Build query string from buildings
    Logger.info('Computing distance matrix for ' + locations.length + ' locations')
    const coords = locations.map((b) => `${b.lng},${b.lat}`).join(';')
    const response = await fetch(
      'http://127.0.0.1:5000/table/v1/car/' + coords + '?annotations=duration,distance'
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
