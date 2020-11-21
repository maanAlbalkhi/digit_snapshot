import React from 'react'

function LoginView({onLogin} : {onLogin : () => void}) {
  return (
    <div className="login-view">
      <h1>Login</h1>
      <input type='text' placeholder='Your Name'></input>
      <button onClick={() => onLogin()}>Login</button>
    </div>
  )
}

export { LoginView }
