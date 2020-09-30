import { Converter } from '../src/Converter'

describe('tempoList initialization', () => {
  const cvt = new Converter()

  test('Should initialized by default tempo 120', () => {
    expect(cvt.getTempoList()).toStrictEqual([{ tick: 0, value: 120 }])
  })
  test('Should set and get tempo list properly', () => {
    const tempoList = [
      { tick: 0, value: 120 },
      { tick: 960, value: 150 },
    ]
    cvt.setTempo(tempoList)
    expect(cvt.getTempoList()).toStrictEqual(tempoList)
  })
  // test('Should 1st tempo start from 0', () => {
  //   // TODO
  // })
  test('Should tempo list be sorted when set', () => {
    const tempoList = [
      { tick: 1290, value: 180 },
      { tick: 0, value: 120 },
      { tick: 960, value: 150 },
    ]
    const expected = [
      { tick: 0, value: 120 },
      { tick: 960, value: 150 },
      { tick: 1290, value: 180 },
    ]
    cvt.setTempo(tempoList)
    expect(cvt.getTempoList()).toStrictEqual(expected)
  })
})

describe('Conversion in fixed tempo: When tempo is fixed to 120', () => {
  const cvt = new Converter()
  const tempoList = [{ tick: 0, value: 120 }]
  cvt.setTempo(tempoList)

  describe('convertSecToTick', () => {
    test('Should 0sec be 0tick', () => {
      expect(cvt.convertSecToTick(0)).toBe(0)
    })
    test('Should 2sec be 1920tick', () => {
      expect(cvt.convertSecToTick(2)).toBe(1920)
    })

    // Thinking...
    // test('Should -1 be converted to -960 (negative)', () => {
    //   expect(cvt.convertSecToTick(-1)).toBe(-960)
    // })
  })

  describe('convertTickToSec', () => {
    test('Should 0tick be 0sec', () => {
      expect(cvt.convertTickToSec(0)).toBe(0)
    })
    test('Should 1920tick be 2sec', () => {
      expect(cvt.convertTickToSec(1920)).toBe(2)
    })
    test('convertTickToMS: Should 1920tick be 2000ms', () => {
      expect(cvt.convertTickToMS(1920)).toBe(2000)
    })

    // Thinking...
    // test('Should -960 be 0 sec (negative)', () => {
    //   expect(cvt.convertTickToSec(-960)).toBe(0)
    // })
  })

  describe('getTempoByMS', () => {
    test('Should 2000ms be 120[bpm]', () => {
      expect(cvt.getTempoByMS(2000)).toBe(120)
    })
  })

  describe('getProgressByMS', () => {
    test('Should 0ms be 0', () => {
      expect(cvt.getProgressByMS(0)).toBe(0)
    })
    test('Should 1000[ms] be 120000', () => {
      // 1000 * 120[bpm]
      expect(cvt.getProgressByMS(1000)).toBe(120000)
    })
    test('Negative test: Should -1000[ms] be -120000', () => {
      // -1000 * 120[bpm]
      expect(cvt.getProgressByMS(-1000)).toBe(-120000)
    })
  })
})

describe('Conversion in variable tempo: 120 (0~9600tick) -> 150 (9600~14400tick) -> 250(14400~)', () => {
  const cvt = new Converter()
  const tempoList = [
    { tick: 0, value: 120 },
    // Border: 10sec
    { tick: 9600, value: 150 },
    // Border: 10sec + (4800 * 60) / (150 * 480) = 14 sec
    { tick: 14400, value: 250 },
  ]
  cvt.setTempo(tempoList)

  describe('convertSecToTick', () => {
    test('Should 0sec be 0tick', () => {
      expect(cvt.convertSecToTick(0)).toBe(0)
    })
    test('1st domain: Should 5sec be 4800[tick]', () => {
      expect(cvt.convertSecToTick(5)).toBe(4800)
    })
    test('1st-2nd domain border: Should 10sec be 9600[tick]', () => {
      expect(cvt.convertSecToTick(10)).toBe(9600)
    })
    test('2nd domain: Should 12sec be 12000[tick]', () => {
      // 9600 + ((12-10) * 150 * 480 / 60)
      expect(cvt.convertSecToTick(12)).toBe(12000)
    })
    test('2nd-3rd domain border: Should 14sec be 14400[tick]', () => {
      expect(cvt.convertSecToTick(14)).toBe(14400)
    })
    test('3rd domain: Should 18sec be 22400[tick]', () => {
      // 14400 + ((18-14) * 250 * 480 / 60)
      expect(cvt.convertSecToTick(18)).toBe(22400)
    })
  })

  describe('convertTickToSec', () => {
    test('Should 0tick be 0sec', () => {
      expect(cvt.convertTickToSec(0)).toBe(0)
    })
    test('1st domain: Should 4800[tick] be 5sec', () => {
      expect(cvt.convertTickToSec(4800)).toBe(5)
    })
    test('1st-2nd domain border: Should 9600[tick] be 10sec', () => {
      expect(cvt.convertTickToSec(9600)).toBe(10)
    })
    test('2nd domain: Should 12000[tick] be 12sec', () => {
      expect(cvt.convertTickToSec(12000)).toBe(12)
    })
    test('2nd-3rd domain border: Should 14400[tick] be 14sec', () => {
      expect(cvt.convertTickToSec(14400)).toBe(14)
    })
    test('3rd domain: Should 22400[tick] be 18sec', () => {
      expect(cvt.convertTickToSec(22400)).toBe(18)
    })
  })

  describe('getTempoByMS', () => {
    test('Should return 1st domain tempo when 0', () => {
      expect(cvt.getTempoByMS(0)).toBe(120)
    })
    test('1st domain: Should 5000[ms] be 120', () => {
      expect(cvt.getTempoByMS(5000)).toBe(120)
    })
    test('1st-2nd domain border: Should 10000[ms] be 120', () => {
      expect(cvt.getTempoByMS(10000)).toBe(120)
    })
    test('2nd domain: Should 12000[ms] be 150', () => {
      expect(cvt.getTempoByMS(12000)).toBe(150)
    })
    test('2nd-3rd domain border: Should 14000[ms] be 150', () => {
      expect(cvt.getTempoByMS(14000)).toBe(150)
    })
    test('3rd domain: Should 18000[ms] be 250', () => {
      expect(cvt.getTempoByMS(18000)).toBe(250)
    })
  })

  describe('getProgressByMS', () => {
    test('Should 0ms be 0', () => {
      expect(cvt.getProgressByMS(0)).toBe(0)
    })
    test('Should 0ms be 0', () => {
      expect(cvt.getProgressByMS(0)).toBe(0)
    })
    test('1st domain: Should 5000[ms] be 600000', () => {
      // 5000 * 120[bpm]
      expect(cvt.getProgressByMS(5000)).toBe(600000)
    })
    test('1st-2nd domain border: Should 10000[ms] be 1200000', () => {
      // 10000 * 120[bpm]
      expect(cvt.getProgressByMS(10000)).toBe(1200000)
    })
    test('2nd domain: Should 12000[ms] be 1500000', () => {
      // 10000 * 120 + 2000 * 150
      expect(cvt.getProgressByMS(12000)).toBe(1500000)
    })
    test('2nd-3rd domain border: Should 14000[ms] be 1800000', () => {
      // 10000 * 120 + 4000 * 150
      expect(cvt.getProgressByMS(14000)).toBe(1800000)
    })
    test('3rd domain: Should 18000[ms] be 2800000', () => {
      // 10000 * 120 + 4000 * 150 + 4000 * 250
      expect(cvt.getProgressByMS(18000)).toBe(2800000)
    })
    test('Negative test: Should -18000[ms] be -2800000', () => {
      expect(cvt.getProgressByMS(-18000)).toBe(-2800000)
    })
  })
})
