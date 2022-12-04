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
}

export interface DatasetBuilding {
  building_id: number
  building_name: string
  latitude: number
  longitude: number
  country: string
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
}

export interface APIProblemJob {
  building_id: string
  device_id: string
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

export type APISolutionTourStep = {
  building_id?: string
  device_id?: string
  arrival: number
  distance: number
  duration: number
  service: number
  location: [number, number]
  type: 'start' | 'job' | 'end'
  waiting_time: number
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

export interface APISolutionVehicle {
  mechanic_id: string
  tours: APISolutionTour[]
}

export interface APISolution {
  statistics: {
    cost: number
    unassigned: number
    setup: number
    service: number
    duration: number
    waiting_time: number
    computing_times: { loading: number; solving: number; routing: number }
  }
  vehicles: APISolutionVehicle[]
  //@TODO
  unassigned?: any
}
