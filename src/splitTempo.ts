import { TimeRangeItem } from './interfaces'
import { between } from './utils'

/**
 * テンポ変化領域に応じてテンポ遷移リストを再構築する
 *
 * @example
 * const tempoList = [
 *  {range: [0, 500], value: 120},
 *  {range: [500, Infinity], value: 180},
 * ]
 * const section = { range: [250, 1000], value: 2 }
 *
 * splitTempoByVariationRange(tempoList, section)
 * => [
 *  { range: [0, 250], value: 120 },
 *  { range: [250, 500], value: 240 },
 *  { range: [500, 1000], value: 360 },
 *  { range: [1000, Infinity], value: 180 },
 * ]
 *
 * @param tempoList 基準のテンポ（BPM）リスト配列
 * @param section テンポ変化領域オブジェクト
 */
export const splitTempoByVariationRange = function (
  tempoList: TimeRangeItem[],
  section: TimeRangeItem
): TimeRangeItem[] {
  const resultList: TimeRangeItem[] = []
  const ss = section.range[0]
  const se = section.range[1]

  tempoList.forEach(tempoData => {
    const tempoRange = tempoData.range
    const originalTempo = tempoData.value
    const variatedTempo = tempoData.value * section.value
    if (between(ss, tempoRange)) {
      // bpm始点~section.start (元BPM領域)
      resultList.push({
        range: [tempoRange[0], ss],
        value: originalTempo,
      })
      if (between(se, tempoRange)) {
        // i. Sandwitch pattern: 始点、終点ともに現BPM範囲内にある：三分割
        // section.start ~ section.end
        resultList.push({
          range: [ss, se],
          value: variatedTempo,
        })
        // section.end ~ bpm終点(元BPM)
        resultList.push({
          range: [se, tempoRange[1]],
          value: originalTempo,
        })
      } else {
        // ii.前部オンリー：終点が現BPM範囲外にある
        // section.start ~ bpm終点
        resultList.push({
          range: [ss, tempoRange[1]],
          value: variatedTempo,
        })
      }
    } else {
      // 始点が同値or範囲外
      if (between(se, tempoRange)) {
        // iii.後部オンリー： 始点が現BPM範囲外
        // tempo.start ~ section.end
        resultList.push({
          range: [tempoRange[0], se],
          value: variatedTempo,
        })
        // section.end ~ tempo.end (元BPM)
        resultList.push({
          range: [se, tempoRange[1]],
          value: originalTempo,
        })
      } else {
        // sec.start & section.end, both same or out of range
        if (ss === tempoRange[0] || se === tempoRange[1]) {
          // iv. Is covered by section
          // tempo.start ~ tempo.end
          resultList.push({
            range: [tempoRange[0], tempoRange[1]],
            value: variatedTempo,
          })
        } else {
          // v.始点・終点どちらも現BPM範囲外
          // tempo.start ~ tempo.end
          resultList.push({
            range: [tempoRange[0], tempoRange[1]],
            value: originalTempo,
          })
        }
      }
    }
  })

  return resultList
}
