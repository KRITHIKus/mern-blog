import React from 'react'
import ReactDOM from 'react-dom/client'
import { store, persistor } from './redux/store.js'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { PersistGate } from 'redux-persist/integration/react'
import ThemeProvider from './components/themeprovider.jsx'
import { installAuthInterceptor } from './utils/authInterceptor.js'

// The initial data-theme is set by the inline script in index.html, before
// first paint; ThemeProvider keeps it in sync afterwards.

installAuthInterceptor(store)

ReactDOM.createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </PersistGate>
)
