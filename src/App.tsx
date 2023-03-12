import { useState } from 'react'
import './App.css'

import { _2A3, _45 } from './calculate/tube'
import { AnodeGraph } from './controls/AnodeGraph'
import { AnodeGraphControls } from './controls/AnodeGraphControls'

var tube = _2A3

function App() {
  var [Va, setVa] = useState(183)
  var [Vg, setVg] = useState(-25)
  var [Ra, setRa] = useState(3000)

  function update(Ra: number, Va: number, Ia?: number, Vg?: number) {
    setVa(Va)
    setVg(Vg ?? -25)
    setRa(Ra)
  }

  return (
    <div className="App">
      <AnodeGraph width={1024} height={768} tube={tube} Va={Va} Vg={Vg} Ra={Ra} />
      <AnodeGraphControls tube={_2A3} Va={Va} Vg={Vg} Ra={Ra} update={update} />
    </div>
  )
}

export default App
