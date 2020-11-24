import React, { useState } from 'react'

function LoginView({onLogin} : {onLogin : (name : string) => void}) {
  const [ name, setName ] = useState('')

  return (
    <div className="login-view">
      <h1>Login</h1>
      <input type='text' placeholder='Your Name' onChange={(e) => setName(e.target.value)}></input>
      <button onClick={() => onLogin(name)}>Login</button>
    </div>
  )
}

export { LoginView }
