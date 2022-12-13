export interface PortfolioItem {
  contract_id: string
  device_id: string
  building_id: string
  device_type: string
  device_subtype: string
}

export interface Portfolio {
  items: PortfolioItem[]
}
export interface Message {
  message: string
}

export interface DatasetResponse {
  buildings: DatasetBuilding[]
  devices: DatasetDevice[]
  engineers: DatasetEngineer[]
  stats: GlobalStats
}

export interface DatasetBuilding {
  building_id: number
  building_name: string
  latitude: number
  longitude: number
  country: string
  devices: DatasetDevice[]
}

export interface DatasetDevice {
  device_id: string
  building_id: string
  contract_id: string
  mechanic_id: number
  type: string
  country: string
  amount: number
}

export interface DatasetEngineer {
  mechanic_id: string
  first_name: string
  last_name: string
  country: string
  latitude: number
  longitude: number
  address: string
  skills: string[]
  stats: EngineersStatsResponse
}

export interface APIProblemJob {
  building_id: string
  device_id?: string
  location: {
    lat: number
    lng: number
  }
  /** Duration in seconds */
  duration: number
  /** Optional - to bind to a specific engineer */
  mechanic_id?: string
}

export interface APIProblemVehicle {
  mechanic_id: string
  location: {
    lat: number
    lng: number
  }
}

export interface APIDayOptions {
  numberOfDays: number
  dayStartHour: number
  dayEndHour: number
  increaseCostEachDay: boolean
}

export interface APIProblem {
  country: string
  jobs: APIProblemJob[]
  vehicles: APIProblemVehicle[]
  /**
   * If supplied, the solver will split a single resource into multiple, one per day
   */
  dayOptions?: APIDayOptions
}

export type APIActivityType = 'start' | 'job' | 'end' | 'break'

/**
 * A task is a single actvitiy in a tour step
 */
export type APISolutionActivity = {
  building_id?: string
  device_id?: string
  type: APIActivityType
  location?: [number, number]
  time?: {
    start: number
    end: number
  }
}

export type APISolutionTourStep = {
  arrival: number
  departure: number
  distance: number
  location: [number, number]
  activities: APISolutionActivity[]
}

export type APISolutionTour = {
  day_number?: number
  cost: number
  distance: number
  duration: number
  geometry?: string
  service: number
  setup: number
  steps: APISolutionTourStep[]
}

export interface APISolutionEngineer {
  mechanic_id: string
  tours: APISolutionTour[]
  stats: EngineersStatsResponse
}

export interface APISolution {
  stats: GlobalStats
  vrpStats: {
    distance: number
    cost: number
    unassigned: number
    setup: number
    service: number
    duration: number
    waiting_time: number
    computing_times?: { loading: number; solving: number; routing: number }
  }
  vehicles: APISolutionEngineer[]
  //@TODO
  unassigned?: any
}

export interface EngineersStatsRequest {
  /** Long, lat - Home address */
  home: [number, number]

  /** List of devices */
  devices: [number, number][]
}

export interface EngineersStatsResult {
  meanTime: number
  meanDistance: number
}

export interface EngineersStatsResponse {
  betweenDevices: EngineersStatsResult
  fromHome: EngineersStatsResult
  countDevices: number
}

export interface GlobalStats {
  mttd: number
  mdtd: number
  mtbd: number
  mdbd: number
  assignedUnits: number
  unassignedUnits: number
}
