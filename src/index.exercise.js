import React from 'react'
import ReactDOM from 'react-dom'
import {Dialog} from '@reach/dialog'
import '@reach/dialog/styles.css'

import {Logo} from 'components/logo'

function LoginForm({onSubmit, buttonText}) {
  function handleSubmit(event) {
    event.preventDefault()
    const {username, password} = event.target.elements
    onSubmit({username: username.value, password: password.value})
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      <button type="submit">{buttonText}</button>
    </form>
  )
}

function App() {
  const [openModal, setOpenModal] = React.useState('none')

  function login(formData) {
    console.log('login', formData)
  }

  function register(formData) {
    console.log('register', formData)
  }

  return (
    <div>
      <Logo width={80} height={80} />
      <h1>Bookshelf</h1>
      <div>
        <button onClick={() => setOpenModal('login')}>Login</button>
      </div>
      <div>
        <button onClick={() => setOpenModal('register')}>Register</button>
      </div>

      <Dialog aria-label="Login form" isOpen={openModal === 'login'}>
        <div>
          <button onClick={() => setOpenModal('none')}>Close </button>
        </div>
        <h3>Login</h3>
        <LoginForm onSubmit={login} buttonText="Login" />
      </Dialog>

      <Dialog aria-label="Registration form" isOpen={openModal === 'register'}>
        <div>
          <button onClick={() => setOpenModal('none')}>Close</button>
        </div>
        <h3>Registration form</h3>
        <LoginForm onSubmit={register} buttonText="Register" />
      </Dialog>
    </div>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
