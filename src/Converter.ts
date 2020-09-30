import {
  tickToSec,
  within,
  secToTick,
} from "./utils";
import {
  TempoItem,
  TempoVariationItem,
  TimeRangeItem,
  Calculator,
} from "./interfaces";
import { splitTempoByVariationRange } from "./splitTempo";

// const
const DEFAULT_TEMPO = [{ tick: 0, value: 120 }];
const DEFAULT_TIMEBASE = 480;

export class Converter {
  private _timebase: number = DEFAULT_TIMEBASE;
  private _tempoList!: TempoItem[];
  private _variationList: TempoVariationItem[] = [];

  // テンポ時間範囲リスト（キャッシュ用）
  private _tempoTimeRangeList: TimeRangeItem[] = [];

  // 最終的なテンポ遷移リスト
  private _tempoVariationList: TimeRangeItem[] = [];

  // 進行値計算機
  private _progressCalculators!: Calculator[];

  constructor() {
    this.setTempo(DEFAULT_TEMPO);
  }

  /**
   * tick単位を秒単位に変換する
   *
   * @param tick
   */
  convertTickToSec(tick: number): number {
    let previousTime = 0;
    let resultSec = 0;

    this._tempoList.some((tempoData, i) => {
      const bpm = tempoData.value;
      const sectionStartTick = tempoData.tick;
      const nextSectionStartTick = this._tempoList[i + 1]
        ? this._tempoList[i + 1].tick
        : null;
      const tickDelta = tick - sectionStartTick;

      // tick範囲外：現範囲より前
      if (tick < sectionStartTick) return;

      // tick範囲外：次範囲以降
      if (nextSectionStartTick && nextSectionStartTick < tick) {
        // 現範囲分の時間を加算
        previousTime += tickToSec(
          nextSectionStartTick - sectionStartTick,
          bpm,
          this._timebase
        );
        return;
      }

      // tick範囲内：計算値が０でなければループ抜ける
      resultSec = previousTime + tickToSec(tickDelta, bpm, this._timebase);
      if (resultSec != 0) return true;
    });

    return resultSec;
  }

  /**
   * tick単位をミリ秒単位に変換する  
   * convertTickToSecによる変換後、x1000しただけ
   *
   * @param tick
   */
  convertTickToMS(tick: number): number {
    return this.convertTickToSec(tick) * 1000;
  }

  /**
   * 秒数をtick単位に変換
   *
   * @param sec
   */
  convertSecToTick(sec: number): number {
    let resultTick = 0;
    let pastTime = 0;
    let currentTempo!: number; // 現領域BPM値

    for (let i = 0; i < this._tempoList.length; i++) {
      const tempoData = this._tempoList[i];
      currentTempo = tempoData.value;
      const nextSectionStartTick = this._tempoList[i + 1]
        ? this._tempoList[i + 1].tick
        : null;
      // テンポチェンジなし：ループを抜けて、現領域BPM値から残り時間の算出
      if (!nextSectionStartTick) break;

      // テンポチェンジがある: 現領域開始～次領域ボーダーまでに指定時間が含まれるかどうかを調べる
      const tickDelta = nextSectionStartTick - resultTick;
      const timeDelta = tickToSec(tickDelta, currentTempo, this._timebase);

      // ボーダー値を超えず、範囲内にある：ループを抜けて、現領域BPM値から残り時間の算出
      if (sec <= pastTime + timeDelta) break;

      // ボーダーを超えてた：現領域の総tick / 総経過時間を加算し、次のテンポ領域へ
      resultTick += tickDelta;
      pastTime += timeDelta;
    }

    // 残り時間をtick変換
    resultTick += secToTick(sec - pastTime, currentTempo, this._timebase);

    return resultTick;
  }

  /**
   * 予め生成したcalculatorを使って進行度を計算。時間範囲によって計算処理を変える  
   * timeが負のとき、正に直してから計算、結果はマイナスで返す  
   * 適当な時間範囲が存在しないときは0を返す
   *
   * @param time {number} - ミリ秒指定
   */
  getProgressByMS(time: number): number {
    let isNeg = false;
    if (time < 0) {
      isNeg = true;
      time = Math.abs(time);
    }
    let progress: number = 0;
    this._progressCalculators.some((calcObj) => {
      if (within(time, calcObj.range[0], calcObj.range[1])) {
        progress = calcObj.func(time);
        return true;
      }
    });
    return isNeg ? -progress : progress;
  }

  /**
   * ミリ秒指定で現在のテンポ（BPM）を返す
   *
   * @param msec
   */
  getTempoByMS(msec: number): number {
    const tempoSection = this._tempoVariationList.find((section) => {
      const rng = section.range;
      return within(msec, rng[0], rng[1]);
    });
    return tempoSection ? tempoSection.value : 0;
  }

  /**
   * 1beatを何tickとするかを指定、すべての基準となる数値。
   * テンポ遷移リスト等も更新
   * @param v
   */
  setTimebase(v: number): void {
    this._timebase = v;
    this.setTempo();
  }

  /**
   * テンポを設定
   * tempoListは複製する？
   *
   * @param tempoList テンポ設定リスト配列。未指定の場合、現在セットされているリストをベースに更新
   * @param variationList オプショナル
   */
  setTempo(
    tempoList: TempoItem[] = this._tempoList,
    variationList?: TempoVariationItem[]
  ): void {
    // ソート必須
    tempoList.sort((a, b) => a.tick - b.tick);
    this._tempoList = tempoList;

    // tempoRangeListの再設定
    this._tempoTimeRangeList = tempoList.map((tempo, i) => {
      // 最初のテンポ領域のときは開始点を強制的に負の無限大にする
      const startTime = i === 0 ? -Infinity : this.convertTickToMS(tempo.tick);

      // 最後のテンポ領域のときは終点を強制的に無限大にする
      const nextData: TempoItem | undefined = tempoList[i + 1];
      const endTime = nextData ? this.convertTickToMS(nextData.tick) : Infinity;

      return {
        range: [startTime, endTime],
        value: tempo.value,
      };
    });

    this.setTempoVariation(variationList);
  }

  /**
   * 逆走・停止・加減速処理リストをセットもしくは更新
   * 最終テンポ遷移リストとdistanceCalculatorも更新
   *
   * @param variationList 未指定の場合、現在セットされているリストをベースに更新
   */
  setTempoVariation(
    variationList: TempoVariationItem[] = this._variationList
  ): void {
    this._variationList = variationList;

    // 実時間ベースのテンポ変化リストの作成
    const variationTimeRangeList: TimeRangeItem[] = this._variationList.map(
      (varData) => {
        // 開始点が0の場合、強制的に負の無限大にする
        const startTime =
          varData.tick === 0 ? -Infinity : this.convertTickToMS(varData.tick);
        const endTime = this.convertTickToMS(varData.tick + varData.duration);
        const range: [number, number] = [startTime, endTime]; // tsコンパイラ対策
        return {
          range: range,
          value: varData.value,
        };
      }
    );

    // 最終的なテンポ遷移リスト(tempoVariationList)のセットアップ
    this._tempoVariationList = this._tempoTimeRangeList;
    variationTimeRangeList.forEach((section) => {
      this._tempoVariationList = splitTempoByVariationRange(
        this._tempoVariationList,
        section
      );
    });

    // distanceCalculatorセットアップ
    {
      let pastProgressSum = 0;

      // bpm領域毎に関数式を用意する
      this._progressCalculators = this._tempoVariationList.map((section) => {
        const tempoRange = section.range;
        const tempoValue = section.value;

        // 参照ではなくコピーが必要
        const currentProgressSum = pastProgressSum;

        // 開始時間が-Infinityだったら0にする
        const startTime = tempoRange[0] !== -Infinity ? tempoRange[0] : 0;

        // 関数式の定義: tはミリ秒
        const calcFunc: (t: number) => number = (ms) => {
          // 直前領域までの進行値 + 現領域での進行値 を返す
          return currentProgressSum + tempoValue * (ms - startTime);
        };

        // 進行積算値を更新
        // 最終領域（終点がInfinity）のときは無関係
        pastProgressSum += tempoValue * (tempoRange[1] - startTime);

        return {
          range: tempoRange,
          func: calcFunc,
        };
      });
    }
  }

  /**
   * 
   */
  getTempoList(): TempoItem[] {
    return this._tempoList
  }
}

export default Converter;
