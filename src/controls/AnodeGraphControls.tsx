import { useRef, useState } from 'react'
import { anodeCurves, maxAnodePowerDissipation, Point, Parameters, anodeCurrent, VgFromIa } from '../calculate/tube'

interface AdditionalProps {
  update: (Ra: number, Va: number, I?: number, Vg?: number) => void
  tube: Parameters
  Ra: number
  Va: number
  Ia?: number
  Vg?: number
}

type Props = React.HTMLProps<HTMLDivElement> & AdditionalProps

export function AnodeGraphControls(props: Props) {
  var Va = props.Va
  // var Va = props.Va
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
              IaInput.current!.value = (Ia * 1000).toFixed(0)
              e.currentTarget.blur()
              props.update(Ra, Va, Ia, Vg)
            }
          }}
        />
        V&nbsp;&nbsp;&nbsp;
        <input
          ref={IaInput}
          type="number"
          defaultValue={(Ia * 1000).toFixed(0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              Ia = +e.currentTarget.value / 1000
              Vg = VgFromIa(Ia, Va, props.tube)
              VgInput.current!.value = Vg.toFixed(2)
              e.currentTarget.blur()
              props.update(Ra, Va, Ia, Vg)
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
              IaInput.current!.value = Vg.toFixed(2)
              e.currentTarget.blur()
              props.update(Ra, Va, Ia, Vg)
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
              props.update(Ra, Va, Ia, Vg)
            }
          }}
        />
      </div>
    </>
  )
}
