/**
 * tick単位を秒数に変換
 * @see https://runstant.com/pentamania/projects/f8d4707b
 *
 * @param tick
 * @param bpm 一分間あたりのbeat数　テンポとも言う
 * @param timebase beat(4分音符)を何tickとするかの基準値
 */
export function tickToSec(tick: number, bpm: number, timebase: number) {
  return (tick * 60) / (bpm * timebase)
}

/**
 * 秒数をtick単位に変換
 *
 * @param tick
 * @param bpm 一分間あたりのbeat数　テンポとも言う
 * @param timebase beat(4分音符)を何tickとするかの基準値
 */
export function secToTick(sec: number, bpm: number, timebase: number) {
  return (sec * bpm * timebase) / 60
}

/**
 * Whether n is (min <= n <= max)
 *
 * @param n
 * @param min
 * @param max
 */
export function within(n: number, min: number, max: number): boolean {
  return min <= n && n <= max
}

/**
 * nがstart ~ endの間かどうか（境界のstart/endは含まず）
 * nとstart/endがそれぞれInfinityの場合falseとなる
 *
 * @param n
 * @param param1 [start, end] array
 */
export function between(n: number, [start, end]: [number, number]): boolean {
  return start < n && n < end
}
