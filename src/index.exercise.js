import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import ReactDOM from 'react-dom'
// import {ReactQueryCacheProvider} from 'react-query'
import {App} from './app'

// function AppWithProviders() {
//   return (
//     <ReactQueryCacheProvider>
//       <App />
//     </ReactQueryCacheProvider>
//   )
// }

loadDevTools(() => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
