export interface PortfolioItem {
  contract_id: string
  device_id: string
  building_id: string
  device_type: string
  device_subtype: string
}

export interface Portfolio {
  items: PortfolioItem[];
}
export interface Message {
  message: string;
}
