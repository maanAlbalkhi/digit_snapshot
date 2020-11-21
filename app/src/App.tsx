import React from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'
import { LoginView } from './LoginView'
import { TrainingView } from './TrainingView'

import './styles/App.css'

function App() {

  const history = useHistory()

  function onLogin() {
    history.push('/training')
  }

  return (
    <div className="App">
      <Switch>
        <Route path='/training'>
          <TrainingView/>
        </Route>
        <Route path='/'>
          <LoginView onLogin={() => onLogin()}/>
        </Route>
      </Switch>
    </div>
  )
}

export { App }
