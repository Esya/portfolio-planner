export type VroomLocation = [number, number]
export type VroomTimeWindow = [number, number]

export interface VroomJob {
  id: number
  description?: string
  location: VroomLocation
  setup?: number
  service?: number
  skills?: number[]
  /** Priority from 0 to 100 */
  priority?: number
  time_windows?: VroomTimeWindow[]
}

export interface VroomShipment {}

export interface VroomVehicle {
  id: number
  description?: string
  start: VroomLocation
  end: VroomLocation
  costs?: {
    fixed?: number
    per_hour?: number
  }
  skills?: number[]
  /** Range (0, 5] */
  speed_factor?: number
  time_window?: VroomTimeWindow
  max_travel_time?: number
  max_tasks?: number
}

export interface VroomProblem {
  jobs: VroomJob[]
  shipments: VroomShipment[]
  vehicles: VroomVehicle[]
}

export interface VroomSolution {
  code: number
  error?: any
  summary: {
    cost: number
    unassigned: number
    setup: number
    service: number
    duration: number
    waiting_time: number
    computing_times: { loading: number; solving: number; routing: number }
  }
  unassigned: any
  routes: VroomRoute[]
}

export interface VroomRoute {
  cost: number
  duration: number
  distance: number
  service: number
  setup: number
  geometry?: string
  steps: VroomStep[]
}

export interface VroomStep {
  id: number
  description: string
  type: 'start' | 'job' | 'end'
  location: VroomLocation
  duration: number
  service: number
  setup: number
  waiting_time: number
  arrivaal: number
  distance: number
}
