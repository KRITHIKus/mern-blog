import React from 'react'
import ReactDOM from 'react-dom/client'
import { store, persistor } from './redux/store.js'
import {Provider} from 'react-redux'
import './index.css'
import App from './App.jsx'
import { PersistGate } from 'redux-persist/integration/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
    <App />
   </Provider>,
  </PersistGate>
  
)
