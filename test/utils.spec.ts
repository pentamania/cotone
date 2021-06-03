import * as utils from '../src/utils'

const TIMEBASE = 480

describe('utils#tickToSec', (): void => {
  test('should convert 1920tick to 2sec when BPM is 120', (): void => {
    const sec: number = utils.tickToSec(1920, 120, TIMEBASE)
    expect(sec).toBe(2)
  })
})

describe('utils#secToTick', (): void => {
  test('should convert 2[sec] to 1920[tick] when BPM is 120', (): void => {
    const tick = utils.secToTick(2, 120, TIMEBASE)
    expect(tick).toBe(1920)
  })
})

describe('utils#within', (): void => {
  test('should 0.1 be within 0 ~ 20', (): void => {
    const result = utils.within(0.1, 0, 20)
    expect(result).toBe(true)
  })

  test('should 21 *not* be within 0 ~ 20', (): void => {
    const result = utils.within(21, 0, 20)
    expect(result).toBe(false)
  })

  test('border-test: should 0 be within 0 ~ 20', (): void => {
    const result = utils.within(0, 0, 20)
    expect(result).toBe(true)
  })

  test('border-test: should 20 be within 0 ~ 20', (): void => {
    const result = utils.within(20, 0, 20)
    expect(result).toBe(true)
  })
})

describe('utils#between', (): void => {
  test('should 0.1 be between 0 ~ 20', (): void => {
    const result = utils.between(0.1, [0, 20])
    expect(result).toBe(true)
  })

  test('should 21 *not* be between 0 ~ 20', (): void => {
    const result = utils.between(21, [0, 20])
    expect(result).toBe(false)
  })

  test('border start: should 0 *not* be between 0 ~ 20', (): void => {
    const result = utils.between(0, [0, 20])
    expect(result).toBe(false)
  })

  test('border end: should 20 *not* be between 0 ~ 20', (): void => {
    const result = utils.between(20, [0, 20])
    expect(result).toBe(false)
  })

  test('Infinity test: should Infinity *not* be between 0 ~ Infinity', (): void => {
    const result = utils.between(Infinity, [0, Infinity])
    expect(result).toBe(false)
  })
})
