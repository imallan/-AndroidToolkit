import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Toolkit from './components/toolkit.js'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import * as Colors from 'material-ui/styles/colors'
import { ipcRenderer } from 'electron'
import { createStore, applyMiddleware } from 'redux'
import reducers from './reducers/reducers.js'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

let store = createStore(reducers, applyMiddleware(createLogger()))

ipcRenderer.on('adb-reply', (event, arg1, arg2) => {
  switch(arg1){
    case 'log': {
      console.log('adb', arg2)
      break
    }
    case 'error': {
      console.error('adb', arg2)
      break
    }
    case 'devices': {
      let devices = arg2.payload
      store.dispatch({
        type: "ADB_DEVICES_RECEIVE",
        payload: devices
      })
      break
    }
  }
})

if (process.env.ENVIRONMENT === 'DEV') {
  store.dispatch({
    type: "ADB_DEVICES"
  })
} else {
  setInterval(() => {
    store.dispatch({
      type: "ADB_DEVICES"
    })
  }, 1000)
}
class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <Toolkit/>
        </MuiThemeProvider>
      </Provider>
    )
  }

}

let muiTheme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: Colors.cyan500,
    primary2Color: Colors.cyan700,
    primary3Color: Colors.grey400,
    accent1Color: Colors.pinkA200,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey500,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300
  }
})

ReactDOM.render(
  <App/>,
  document.getElementById("content")
)
