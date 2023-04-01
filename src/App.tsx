import { useState } from 'react'
import './App.css'

import { _2A3, _300B, _45, _6SL7 } from './calculate/tube'
import { AnodeGraph } from './controls/AnodeGraph'
import { AnodeGraphControls } from './controls/AnodeGraphControls'

var tube = _2A3

function App() {
  var [Va, setVa] = useState(250)
  // var [Vg, setVg] = useState(-1.4)
  var [Ia, setIa] = useState(0.055)
  var [Ra, setRa] = useState(3000)
  var [Reactive, setReactive] = useState(true)

  function update(Ra: number, Va: number, Ia: number, Reactive: boolean) {
    setVa(Va)
    // setVg(Vg ?? -25)
    setRa(Ra)
    setIa(Ia)
    setReactive(Reactive)
  }

  return (
    <div className="App">
      <AnodeGraph width={1024} height={768} tube={tube} Va={Va} Ia={Ia} Ra={Ra} Reactive={Reactive} />
      <AnodeGraphControls tube={tube} Va={Va} Ia={Ia} Ra={Ra} Reactive={Reactive} update={update} />
    </div>
  )
}

export default App
