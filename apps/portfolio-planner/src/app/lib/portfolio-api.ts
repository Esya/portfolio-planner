import { APIProblem, APISolution, DatasetResponse } from '@wemaintain/api-interfaces'

export class PortfolioAPI {
  static async getDataset(countryCode: string): Promise<DatasetResponse> {
    const response = await fetch(`http://localhost:3333/dataset/${countryCode}`)
    return await response.json()
  }

  static async optimize(request: APIProblem): Promise<APISolution> {
    // JSON query
    const response = await fetch(`http://localhost:3333/solve-vroom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    return response.json()
  }
}
