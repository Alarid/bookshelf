/** @jsx jsx */
import {jsx} from '@emotion/core'
import {useAuth} from 'context/auth-context.exercise'

import {BrowserRouter as Router} from 'react-router-dom'

import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'

function App() {
  const {user} = useAuth()
  return user ? (
    <Router>
      <AuthenticatedApp />
    </Router>
  ) : (
    <UnauthenticatedApp />
  )
}

export {App}
