import React from 'react'
import ReactDOM from 'react-dom/client'
import { store, persistor } from './redux/store.js'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { PersistGate } from 'redux-persist/integration/react'
import ThemeProvider from './components/themeprovider.jsx'

// Set initial theme before first paint to avoid flash
const savedState = localStorage.getItem('persist:root')
if (savedState) {
  try {
    const parsed = JSON.parse(savedState)
    const theme = parsed.theme ? JSON.parse(parsed.theme).theme : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
} else {
  document.documentElement.setAttribute('data-theme', 'dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </PersistGate>
)
