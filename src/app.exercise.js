import * as React from 'react'
import {useAuth} from './context/auth-context'
import {FullPageSpinner} from './components/lib'

const AuthenticatedApp = React.lazy(() =>
  import(
    /* webpackChunkName: "AuthenticatedApp" */
    /* webpackPrefetch: true */
    './authenticated-app'
  ),
)
const UnauthenticatedApp = React.lazy(() =>
  import(/* webpackChunkName: "UnauthenticatedApp" */ './unauthenticated-app'),
)

function App() {
  const {user} = useAuth()
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </React.Suspense>
  )
}

export {App}
