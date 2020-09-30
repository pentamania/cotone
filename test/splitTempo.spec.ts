import { TimeRangeItem } from '../src/interfaces'
import { splitTempoByVariationRange } from '../src/splitTempo'

describe('Split timeline with two sections', (): void => {
  const tempoList: TimeRangeItem[] = [
    { range: [0, 500], value: 120 },
    { range: [500, Infinity], value: 180 },
  ]

  test('should split to four sections when variateRange bridges different sections', (): void => {
    const variateRange: TimeRangeItem = { range: [250, 1000], value: 2 }

    const result = splitTempoByVariationRange(tempoList, variateRange)
    const expected = [
      { range: [0, 250], value: 120 },
      { range: [250, 500], value: 240 },
      { range: [500, 1000], value: 360 },
      { range: [1000, Infinity], value: 180 },
    ]
    expect(result).toStrictEqual(expected)
  })

  test('should split sections to three when variateRange is within same section', (): void => {
    const variateRange: TimeRangeItem = { range: [100, 400], value: 2 }
    const expected = [
      { range: [0, 100], value: 120 },
      { range: [100, 400], value: 240 },
      { range: [400, 500], value: 120 },
      { range: [500, Infinity], value: 180 },
    ]

    const result = splitTempoByVariationRange(tempoList, variateRange)
    expect(result).toStrictEqual(expected)
  })

  test('Border test 1: should separate to 2 sections when variateRange-start is equal to the section-start', (): void => {
    const variateRange: TimeRangeItem = { range: [0, 250], value: 2 }
    const expected = [
      { range: [0, 250], value: 240 },
      { range: [250, 500], value: 120 },
      { range: [500, Infinity], value: 180 },
    ]
    const result = splitTempoByVariationRange(tempoList, variateRange)
    expect(result).toStrictEqual(expected)
  })

  test('Border test 2: should separate to 2 sections when variateRange-end is equal to the section-end', (): void => {
    const variateRange: TimeRangeItem = { range: [100, 500], value: 2 }
    const expected = [
      { range: [0, 100], value: 120 },
      { range: [100, 500], value: 240 },
      { range: [500, Infinity], value: 180 },
    ]
    const result = splitTempoByVariationRange(tempoList, variateRange)
    expect(result).toStrictEqual(expected)
  })

  test('Border test 3: should not separate section when variateRange and section range matches', (): void => {
    const variateRange: TimeRangeItem = { range: [0, 500], value: 2 }
    const expected = [
      { range: [0, 500], value: 240 },
      { range: [500, Infinity], value: 180 },
    ]
    const result = splitTempoByVariationRange(tempoList, variateRange)
    expect(result).toStrictEqual(expected)
  })

  test('Border 4: Should not separate when the range is completely covered', (): void => {
    const variateRange: TimeRangeItem = { range: [0, 600], value: 2 }
    const expected = [
      { range: [0, 500], value: 240 },
      { range: [500, 600], value: 360 },
      { range: [600, Infinity], value: 180 },
    ]
    const result = splitTempoByVariationRange(tempoList, variateRange)
    expect(result).toStrictEqual(expected)
  })
})
