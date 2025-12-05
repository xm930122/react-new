import React from 'react'
import ShowArea from './ShowArea'
import Buttons from './Button'
import NumFunction from './NumFunction'
import {Color} from './Color'

function App() {
    return (
        <div>
            <Color>
                <ShowArea/>
                <Buttons/>
                <NumFunction />
            </Color>
        </div>
    )
}

export default App;