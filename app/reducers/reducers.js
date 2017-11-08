import { combineReducers } from 'redux'
import { ipcRenderer } from 'electron'

const test = (state = {foo: 'bar'}, action) => state

const devices = (state = {devices: []}, action) => {
  switch(action.type) {
    case 'ADB_DEVICES': {
      ipcRenderer.send('adb', {
        type: 'devices'
      })
      return state
    }
    case 'ADB_DEVICES_RECEIVE': {
      return {...state, devices: action.payload}
    }
    case 'ADB_SCREENSHOT': {
      ipcRenderer.send('adb', {
        type: 'screenshot',
        payload: action.payload
      })
      return {
        ...state
      }
    }
    case 'ADB_INSTALL': {
      ipcRenderer.send('adb', {
        type: 'install',
        payload: action.payload
      })
      return state
    }
    case 'ADB_SEND': {
      ipcRenderer.send('adb', {
        type: 'send',
        payload: action.payload
      })
      return state
    }
    default:
      return state
  }
}

export default combineReducers({
  devices: devices
})


