require('jest-fetch-mock').enableMocks()
import { EngineersStats } from './engineers-stats'
import fetchMock from 'jest-fetch-mock'

describe('#engineersStats', () => {
  beforeAll(() => {
    fetchMock.enableMocks()
  })

  afterEach(() => {
    // cleaning up the mess left behind the previous test
    fetchMock.resetMocks()
  })

  it('Should return means from home', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ distances: [[10000, 20000]], durations: [[30, 60]] }))
    const stats = await EngineersStats.fromHome({
      home: [2.29763, 48.91469],
      devices: [
        [1, 2],
        [3, 4],
      ],
    })

    expect(stats.meanDistance).toEqual(15000)
    expect(stats.meanTime).toEqual(45)
  })

  it('Should return means between devices', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        distances: [
          [0, 10, 20],
          [10, 0, 20],
          [20, 10, 0],
        ],
        durations: [
          [0, 30, 60],
          [30, 0, 60],
          [30, 60, 0],
        ],
      })
    )
    const stats = await EngineersStats.betweenDevices({
      home: [2.29763, 48.91469],
      devices: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    })

    expect(stats.meanDistance).toEqual(15)
    expect(stats.meanTime).toEqual(45)
  })
})
