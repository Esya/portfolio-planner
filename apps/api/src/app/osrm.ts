import { Country } from '@wemaintain/api-interfaces'

export type OSRMCoordinate = [lng: number, lat: number]
export interface OSRMResponse {
  distances: number[][]
  durations: number[][]
}

export class OSRM {
  private static readonly servers: Record<Country, string> = {
    [Country.France]: process.env.OSRM_SERVER_FRANCE,
    [Country.GreatBritain]: process.env.OSRM_SERVER_GREAT_BRITAIN,
    [Country.Singapore]: process.env.OSRM_SERVER_SINGAPORE,
  }

  public static async getDistanceMatrix(
    country: Country,
    coordinates: OSRMCoordinate[],
    sources?: number[]
  ): Promise<OSRMResponse> {
    const url = this.servers[country]
    let sourceArg = ''
    if (sources) {
      sourceArg = `&sources=${sources.join(',')}`
    }

    const coordsString = coordinates.map((c) => c.join(',')).join(';')
    const response = await fetch(
      `${url}/table/v1/car/${coordsString}?annotations=duration,distance${sourceArg}`
    )

    const data = await response.json()
    return { distances: data.distances, durations: data.durations }
  }
}
