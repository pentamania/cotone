export interface TempoItem {
  tick: number
  value: number
}

export interface TempoVariationItem {
  tick: number
  duration: number
  value: number
}

interface RangeItem {
  range: [number, number] // [start, end]
}

export interface TimeRangeItem extends RangeItem {
  value: number // 速度（BPM）もしくは速度変化倍率
}

export interface Calculator extends RangeItem {
  func: (t: number) => number
}
