import React, { useEffect, useState } from 'react'
import './styles/LoginView.scss'

function LoginView({onLogin} : {onLogin : (name : string) => void}) {
  const [ name, setName ] = useState({ first: '', last: ''})

  function onLoginClicked() {
    window.localStorage.setItem('first_name', name.first)
    window.localStorage.setItem('last_name', name.last)
    onLogin(`${name.first}_${name.last}`)
  }

  // set name on load
  useEffect(() => {
    setName({
      first: window.localStorage.getItem('first_name') || '',
      last: window.localStorage.getItem('last_name') || ''
    })
  },[])

  return (
    <div className="login-view">
      <h1>Login</h1>
      <div>
        <div className='input-element'>
          <input type='text' placeholder='First Name' value={name.first} onChange={(e) => setName({ ...name, first: e.target.value })}></input>
        </div>
        <div className='input-element'>
          <input type='text' placeholder='Last Name' value={name.last} onChange={(e) => setName({ ...name, last: e.target.value })}></input>
        </div>
        <button onClick={() => onLoginClicked()}>Login</button>
      </div>
    </div>
  )
}

export { LoginView }
