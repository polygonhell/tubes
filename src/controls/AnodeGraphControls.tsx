import { useEffect, useRef, useState } from 'react'
import { anodeCurves, maxAnodePowerDissipation, Point, Parameters, anodeCurrent, VgFromIa, VaFromVgOnLine } from '../calculate/tube'

import './Slider.css'

interface AdditionalReactiveProps {
  update: (Ra: number, Va: number, Ia: number, Reactive: boolean) => void
  tube: Parameters
  Ra: number
  Va: number
  Ia?: number
  Vg?: number
}

type ReactiveProps = React.HTMLProps<HTMLDivElement> & AdditionalReactiveProps

export function ReactiveAnodeGraphControls(props: ReactiveProps) {
  var Va = props.Va
  var Ra = props.Ra
  const IaInput = useRef<HTMLInputElement>(null)
  const VgInput = useRef<HTMLInputElement>(null)
  var Ia: number
  var Vg: number

  if (props.Ia) {
    Ia = props.Ia!
    Vg = VgFromIa(Ia, Va, props.tube)
  } else {
    Vg = props.Vg!
    Ia = anodeCurrent(Vg, Va, props.tube)
  }

  return (
    <>
      <div>
        OperatingPoint: Anode&nbsp;
        <input
          type="number"
          defaultValue={Va.toFixed(2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              Va = +e.currentTarget.value
              Ia = anodeCurrent(Vg, Va, props.tube)
              IaInput.current!.value = (Ia * 1000).toFixed(2)
              e.currentTarget.blur()
              props.update(Ra, Va, Ia, true)
            }
          }}
        />
        V&nbsp;&nbsp;&nbsp;
        <input
          ref={IaInput}
          type="number"
          defaultValue={(Ia * 1000).toFixed(2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              Ia = +e.currentTarget.value / 1000
              Vg = VgFromIa(Ia, Va, props.tube)
              VgInput.current!.value = Vg.toFixed(2)
              e.currentTarget.blur()
              props.update(Ra, Va, Ia, true)
            }
          }}
        />
        mA&nbsp;&nbsp;&nbsp;Grid&nbsp;
        <input
          ref={VgInput}
          type="number"
          defaultValue={Vg.toFixed(2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              Vg = +e.currentTarget.value
              Ia = anodeCurrent(Vg, Va, props.tube)
              IaInput.current!.value = (Ia * 1000).toFixed(2)
              e.currentTarget.blur()
              props.update(Ra, Va, Ia, true)
            }
          }}
        />
        V
      </div>
      <div>
        Reactive Load&nbsp;
        <input
          type="number"
          defaultValue={Ra.toFixed(0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              Ra = +e.currentTarget.value
              e.currentTarget.blur()
              props.update(Ra, Va, Ia, true)
            }
          }}
        />
      </div>
    </>
  )
}

interface AdditionalResistiveProps {
  update: (Ra: number, Va: number, Ia: number, Reactive: boolean) => void
  tube: Parameters
  Ra: number
  Bplus: number
  Ia: number
}

type ResistiveProps = React.HTMLProps<HTMLDivElement> & AdditionalResistiveProps

export function ResistiveAnodeGraphControls(props: ResistiveProps) {
  const Bplus = props.Bplus
  const Ra = props.Ra
  const IaMax = Bplus / Ra
  const VgInput = useRef<HTMLInputElement>(null)
  const IaInput = useRef<HTMLInputElement>(null)

  const Ia = props.Ia
  const Va = IaMax > props.Ia ? ((IaMax - props.Ia) / IaMax) * Bplus : 0
  const Vg = VgFromIa(Ia, Va, props.tube)

  useEffect(() => {
    VgInput.current!.value = Vg.toFixed(2)
  })

  return (
    <>
      <div>
        BPlus&nbsp;
        <input
          type="number"
          defaultValue={Bplus.toFixed(2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const Bplus = +e.currentTarget.value
              e.currentTarget.blur()
              props.update(Ra, Bplus, Ia, false)
            }
          }}
        />
        V&nbsp;&nbsp;&nbsp;
        <input
          ref={IaInput}
          type="number"
          defaultValue={(Ia * 1000).toFixed(2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const Ia = +e.currentTarget.value / 1000
              e.currentTarget.blur()
              props.update(Ra, Bplus, Ia, false)
            }
          }}
        />
        mA&nbsp;&nbsp;&nbsp;Grid&nbsp;
        <input
          ref={VgInput}
          type="number"
          defaultValue={Vg.toFixed(2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              //need to compute Ia from Vg problem is we don't know What Va is
              const Vg = +e.currentTarget.value
              const Va = VaFromVgOnLine(Vg, Bplus, IaMax, props.tube)
              const Ia = anodeCurrent(Vg, Va, props.tube)
              IaInput.current!.value = (Ia * 1000).toFixed(2)
              e.currentTarget.blur()
              props.update(Ra, Bplus, Ia, false)
            }
          }}
        />
        V
      </div>
      <div>
        Resistive Load&nbsp;
        <input
          type="number"
          defaultValue={Ra.toFixed(0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              var Ra = +e.currentTarget.value
              e.currentTarget.blur()
              props.update(Ra, Bplus, Ia, false)
            }
          }}
        />
      </div>
    </>
  )
}

interface AdditionalProps {
  update: (Ra: number, Va: number, Ia: number, Reactive: boolean) => void
  tube: Parameters
  Ra: number
  Va: number
  Ia: number
  Reactive: boolean
}

type Props = React.HTMLProps<HTMLDivElement> & AdditionalProps
export function AnodeGraphControls(props: Props) {
  return (
    <>
      <div>
        <>Resistive&nbsp;&nbsp;&nbsp;</>
        <label className="switch">
          <input type="checkbox" checked={props.Reactive} onChange={() => props.update(props.Ra, props.Va, props.Ia, !props.Reactive)} />
          <span className="slider round"></span>
        </label>
        <>&nbsp;&nbsp;&nbsp;Reactive</>
      </div>
      {props.Reactive ? (
        <ReactiveAnodeGraphControls tube={props.tube} Va={props.Va} Ra={props.Ra} Ia={props.Ia} update={props.update} />
      ) : (
        <ResistiveAnodeGraphControls tube={props.tube} Bplus={props.Va} Ia={props.Ia} Ra={props.Ra} update={props.update} />
      )}
    </>
  )
}
