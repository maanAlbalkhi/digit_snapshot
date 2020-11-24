import React, { useEffect, useState } from 'react'
import './styles/LoginView.scss'

function LoginView({onLogin} : {onLogin : (name : string) => void}) {
  const [ name, setName ] = useState({ first: '', last: ''})

  function onLoginClicked() {
    window.localStorage.setItem('first_name', name.first)
    window.localStorage.setItem('last_name', name.last)
    onLogin(`${name.first}_${name.last}`)
  }

  function replaceNonAscii(text: string) {
    return text.replace(/[^A-Za-z]/ig, '').toLocaleLowerCase()
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
          <input 
            type='text' 
            placeholder='First Name' 
            pattern="[A-Za-z]{3}" 
            value={name.first} 
            onChange={(e) => setName({ ...name, first: replaceNonAscii(e.target.value) })}/>
        </div>
        <div className='input-element'>
          <input 
            type='text' 
            placeholder='Last Name' 
            pattern="[A-Za-z]{3}" 
            value={name.last} 
            onChange={(e) => setName({ ...name, last: replaceNonAscii(e.target.value) })}/>
        </div>
        <button onClick={() => onLoginClicked()}>Login</button>
      </div>
    </div>
  )
}

export { LoginView }
