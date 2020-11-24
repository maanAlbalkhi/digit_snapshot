import React, { useEffect, useState } from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'
import { LoginView } from './LoginView'
import { TrainingView } from './TrainingView'

import './styles/App.scss'

function App() {

  const history = useHistory()

  function onLogin(name : string) {
    history.push(name)
  }

  return (
    <div className="App">
      <Switch>
        <Route path='/:username'>
          <TrainingView/>
        </Route>
        <Route path='/'>
          <LoginView onLogin={(name) => onLogin(name)}/>
        </Route>
      </Switch>
    </div>
  )
}

export { App }
