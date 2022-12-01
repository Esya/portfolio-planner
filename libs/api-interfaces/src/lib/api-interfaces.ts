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
