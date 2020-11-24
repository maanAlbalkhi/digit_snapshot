import React from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'
import { LoginView } from './LoginView'
import { TrainingView } from './TrainingView'
import { dataURItoBlob } from './utils'

import './styles/App.css'

const apiAdress = ''

let next_number: string = '0'

function App() {

  const history = useHistory()

  function onLogin(name : string) {
    history.push(name)
  }

  async function postImage(img: string, name: string) {
    console.log([img, name])

    var data = new FormData()
    data.append('image', dataURItoBlob(img), 'image.bmp')
    //data.append('file', 'test')
    let response = await fetch(`${apiAdress}/save/${name}/${next_number}`, {
      method: 'POST',
      body: data,
      headers: {
        //'Content-Type': 'multipart/form-data'
      },
    }).then(response=>response.json())
    
    console.log(response)
    next_number = response.next_number
  }

  return (
    <div className="App">
      <Switch>
        <Route path='/:username'>
          <TrainingView onNewImage={(img, name) => postImage(img, name)}/>
        </Route>
        <Route path='/'>
          <LoginView onLogin={(name) => onLogin(name)}/>
        </Route>
      </Switch>
    </div>
  )
}

export { App }
