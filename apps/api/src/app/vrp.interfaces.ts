export interface VRPLocation {
  lat: number
  lng: number
}
export interface VRPPlace {
  location: VRPLocation
  /** Duration in seconds */
  duration: number
  times?: [string, string][]
}

export interface VRPService {
  places: VRPPlace[]
}

export interface VRPJob {
  id: string
  skills?: {
    allOf?: string[]
    oneOf?: string[]
    noneOf?: string[]
  }
  /** a group name. Jobs with the same groups are scheduled in the same tour or left unassigned. */
  group?: string
  /** compatibility class. Jobs with different compatibility classes cannot be assigned in the same tour. This is useful to avoid mixing cargo, such as hazardous goods and food. */
  compatibility?: string
  services: VRPService[]
}

export interface VRPShift {
  start: { location: VRPLocation; earliest: string }
  end: { location: VRPLocation; latest: string }
  // Breaks?
}

export interface VRPVehicle {
  typeId: string
  vehicleIds: string[]
  skills?: string[]
  profile: {
    matrix: string
    scale?: number
  }
  costs: {
    fixed: number
    distance: number
    time: number
  }
  capacity: number[]
  shifts: VRPShift[]
}

export interface VRPObjective {}

export interface VRPProblem {
  plan: { jobs: VRPJob[] }
  fleet: { vehicles: VRPVehicle[]; profiles: { name: string }[] }
  objectives?: VRPObjective[]
}

export interface VRPSolution {}

export type VRPLocations = VRPLocation[]
export interface VRPMatrix {
  profile: string
  distances: number[]
  travelTimes: number[]
}
