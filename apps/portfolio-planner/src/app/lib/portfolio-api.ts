import { DatasetResponse } from '@wemaintain/api-interfaces'

export class PortfolioAPI {
  static async getDataset(countryCode: string): Promise<DatasetResponse> {
    const response = await fetch(`http://localhost:3333/dataset/${countryCode}`)
    return await response.json()
  }
}
