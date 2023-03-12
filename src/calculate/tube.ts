export interface ParametersI {
  id?: number
  name?: string
  KP?: number
  MU?: number
  EX?: number
  KG1?: number
  KG2?: number
  KVB?: number
  VCT?: number
  M?: number
  Q?: number
  M_1?: number
  maxAnodePowerDissipation?: number
  maxV_A?: number
  maxI_A?: number
  minV_G1?: number
  maxV_G1?: number
  gridStep?: number
  B_Plus?: number
  V_G1?: number
  V_G2?: number
  biasCurrent?: number
  load?: number
  UL_TAP?: number
  nextStageACImpedance?: number
  tubeType?: string
  loadType?: string
  operatingMode?: string
  enabled?: number
  Cgk?: number
  Cga?: number
  Cak?: number
}

export class Parameters {
  constructor(p: ParametersI) {
    // this.id = p.id ?? 0
    this.name = p.name ?? ''
    this.V_G2 = p.V_G2 ?? 0
    this.UL_TAP = p.UL_TAP ?? 0
    this.tubeType = p.tubeType ?? 'triode'
    this.KP = p.KP ?? 0
    this.MU = p.MU ?? 0
    this.EX = p.EX ?? 0
    this.KG1 = p.KG1 ?? 0
    this.KVB = p.KVB ?? 0
    this.VCT = p.VCT ?? 0
    this.M_1 = p.M_1 ?? 0
    this.M = p.M ?? 0
    this.Q = p.Q ?? 0
    this.maxV_A = p.maxV_A ?? 0
    this.minV_G1 = p.minV_G1 ?? 0
    this.maxV_G1 = p.maxV_G1 ?? 0
    this.gridStep = p.gridStep ?? 0
    this.maxAnodePowerDissipation = p.maxAnodePowerDissipation ?? 0
    this.maxI_A = p.maxI_A ?? 0.5
  }

  // id: number
  name: string
  KP: number
  MU: number
  EX: number
  KG1: number
  // KG2?: number
  KVB: number
  VCT: number
  M: number
  Q: number
  M_1: number
  maxAnodePowerDissipation: number
  maxV_A: number
  maxI_A: number
  minV_G1: number
  maxV_G1: number
  gridStep: number
  // B_Plus?: number
  // V_G1?: number
  V_G2: number
  // biasCurrent?: number
  // load?: number
  UL_TAP: number
  // nextStageACImpedance?: number
  tubeType: string
  // loadType?: string
  // operatingMode?: string
  // enabled?: number
  // Cgk?: number
  // Cga?: number
  // Cak?: number
}

export const _2A3: Parameters = JSON.parse(
  `{"id": 3, "name": "2A3", "KP": 58.469999999999999, "MU": 4.0499999999999998, "EX": 1.6339999999999999, "KG1": 3652.1999999999998, "KG2": null, "KVB": 300, "VCT": 0, "M": 0, "Q": 0, "M_1": 3.4028200000000001e38, "maxAnodePowerDissipation": 15, "maxV_A": 500, "maxI_A": 0.29999999999999999, "minV_G1": -120, "maxV_G1": 0, "gridStep": 10, "B_Plus": 250, "V_G1": 0, "V_G2": null, "biasCurrent": 0.059999999999999998, "load": 2500, "UL_TAP": null, "nextStageACImpedance": null, "tubeType": "triode", "loadType": "reactive", "operatingMode": "triode", "enabled": 1, "Cgk": null, "Cga": null, "Cak": null}`
)

export const _45: Parameters = JSON.parse(
  `{"id":60,"name":45,"KP":39.669899999999998,"MU":3.6118000000000001,"EX":1.5010399999999999,"KG1":5735.6599999999999,"KG2":null,"KVB":1,"VCT":0,"M":0,"Q":0,"M_1":3.4028200000000001e+38,"maxAnodePowerDissipation":10,"maxV_A":500,"maxI_A":0.080000000000000002,"minV_G1":-150,"maxV_G1":0,"gridStep":10,"B_Plus":275,"V_G1":-50,"V_G2":null,"biasCurrent":0.017999999999999999,"load":3900,"UL_TAP":null,"nextStageACImpedance":null,"tubeType":"triode","loadType":"reactive","operatingMode":"triode","enabled":1,"Cgk":null,"Cga":null,"Cak":null}`
)

export class Point {
  x: number = 0
  y: number = 0
}

export class AnodeCurve {
  gridVolts: number = 0
  points: Point[] = []
}

export function anodeCurves(parameters: Parameters): AnodeCurve[] {
  var datasets: AnodeCurve[] = []
  for (var vg = parameters.maxV_G1; vg >= parameters.minV_G1; vg -= parameters.gridStep) {
    datasets.push(anodeCurve(vg, parameters))
  }
  return datasets
}

export function anodeCurve(V_G1: number, parameters: Parameters): AnodeCurve {
  var step = 3
  var anodeCurve: Point[] = []
  for (var V_A = 0; V_A <= parameters.maxV_A; V_A = V_A + step) {
    anodeCurve.push({ x: V_A, y: anodeCurrent(V_G1, V_A, parameters) })
  }
  return { gridVolts: V_G1, points: anodeCurve }
}

export function anodeCurrent(V_G1: number, V_A: number, parameters: Parameters): number {
  var V_G2 = parameters.V_G2 * (1 - parameters.UL_TAP) + V_A * parameters.UL_TAP
  var I_a
  if (parameters.tubeType === 'pentode')
    I_a = pentodeAnodeCurrent(
      V_G1,
      V_A,
      V_G2,
      parameters.KP,
      parameters.MU,
      parameters.EX,
      parameters.KG1,
      parameters.KVB,
      parameters.M,
      parameters.Q,
      parameters.M_1
    )
  else
    I_a = triodeAnodeCurrent(V_G1, V_A, parameters.KP, parameters.MU, parameters.EX, parameters.KG1, parameters.KVB, parameters.VCT, parameters.M_1)
  return I_a
}

function triodeAnodeCurrent(
  V_G1: number,
  V_A: number,
  KP: number,
  MU: number,
  EX: number,
  KG1: number,
  KVB: number,
  VCT: number,
  M_1: number
): number {
  var E = (V_A / KP) * Math.log(1 + Math.exp(KP * (1 / MU + (V_G1 + VCT) / Math.sqrt(KVB + V_A * V_A))))
  //return ((Math.pow(Math.abs(E),EX)) + Math.sign(E) * (Math.pow(Math.abs(E),EX))) / KG1; without power law for high grid values
  return Math.min(Math.pow(V_A, 1.5) * 0.13 * M_1, (Math.pow(Math.abs(E), EX) + Math.sign(E) * Math.pow(Math.abs(E), EX)) / KG1) //with power law for high grid values
}

function pentodeAnodeCurrent(
  V_G1: number,
  V_A: number,
  V_G2: number,
  KP: number,
  MU: number,
  EX: number,
  KG1: number,
  KVB: number,
  M: number,
  Q: number,
  M_1: number
): number {
  var E = (V_G2 / KP) * Math.log(1 + Math.exp((1 / MU + V_G1 / V_G2) * KP))
  //return ((Math.pow(Math.abs(E),EX)) + Math.sign(E) * (Math.pow(Math.abs(E),EX))) / KG1 * Math.atan(V_A / KVB);  //Original Koren formula
  //return V_A*Math.max(0,M+Q*V_G1)+((Math.pow(Math.abs(E),EX)) + Math.sign(E) * (Math.pow(Math.abs(E),EX))) / KG1 * Math.atan(V_A / KVB);  //new formula for non converging pentodes
  return Math.min(
    V_A * M_1,
    V_A * Math.max(0, M + Q * V_G1) + ((Math.pow(Math.abs(E), EX) + Math.sign(E) * Math.pow(Math.abs(E), EX)) / KG1) * Math.atan(V_A / KVB)
  ) //new formula 2 for non converging pentodes and beam tetrodes - linear
  //return Math.min(Math.pow(V_A,1.5)*32.5/V_G2*M_1,V_A*Math.max(0,M+Q*V_G1)+((Math.pow(Math.abs(E),EX)) + Math.sign(E) * (Math.pow(Math.abs(E),EX))) / KG1 * Math.atan(V_A / KVB));  //new formula 2 for non converging pentodes and beam tetrodes - power law inv proportional to screen
  //return Math.min(Math.pow(V_A,1.5)*0.13*M_1,V_A*Math.max(0,M+Q*V_G1)+((Math.pow(Math.abs(E),EX)) + Math.sign(E) * (Math.pow(Math.abs(E),EX))) / KG1 * Math.atan(V_A / KVB));  //new formula 2 for non converging pentodes and beam tetrodes - power law fixed
}

export function maxAnodePowerDissipation(parameters: Parameters): Point[] {
  var step = 3
  var maxAnodePowerDissipation = []
  for (var V_A = 0; V_A <= parameters.maxV_A; V_A = V_A + step) {
    maxAnodePowerDissipation.push({
      x: V_A,
      y: parameters.maxAnodePowerDissipation / V_A
    })
  }
  return maxAnodePowerDissipation
}

export function VgFromIa(current: number, Va: number, parameters: Parameters) {
  var Ia_prev = -100
  var step = 100
  var Ia = 0
  var V_G1 = parameters.minV_G1

  for (;;) {
    Ia_prev = Ia
    Ia = anodeCurrent(V_G1, Va, parameters)
    if (Ia >= current || (Ia === Ia_prev && Ia !== 0)) {
      V_G1 -= step
      step /= 10
    }
    if (step <= 0.000001 || (Ia >= current && step <= 0.000001)) break
    V_G1 += step
  }

  return V_G1
}
