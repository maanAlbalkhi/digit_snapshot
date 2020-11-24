import React, { useState } from 'react'
import './styles/LoginView.scss'

function LoginView({onLogin} : {onLogin : (name : string) => void}) {
  const [ name, setName ] = useState({ first: '', last: ''})

  return (
    <div className="login-view">
      <h1>Login</h1>
      <div>
        <div className='input-element'>
          <input type='text' placeholder='First Name' onChange={(e) => setName({ ...name, first: e.target.value })}></input>
        </div>
        <div className='input-element'>
          <input type='text' placeholder='Last Name' onChange={(e) => setName({ ...name, last: e.target.value })}></input>
        </div>
        <button onClick={() => onLogin(`${name.first}_${name.last}`)}>Login</button>
      </div>
    </div>
  )
}

export { LoginView }
