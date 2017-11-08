import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import AppBar from 'material-ui/AppBar'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import SvgIcon from 'material-ui/SvgIcon'
import CircularProgress from 'material-ui/CircularProgress'
import * as Colors from 'material-ui/styles/colors'
import { connect } from 'react-redux'
import DropZone from 'react-dropzone'


import { ipcRenderer } from 'electron'

const modelReg = /model:([^ ]+)/
const deviceCodeReg = /device:([^ ]+)/
const idReg = /emulator-[^ ]+|[0-9a-f]+/

const dVirtualDevice = "M15,5H14V4H15M10,5H9V4H10M15.53,2.16L16.84,0.85C17.03,0.66 17.03,0.34 16.84,0.14C16.64,-0.05 16.32,-0.05 16.13,0.14L14.65,1.62C13.85,1.23 12.95,1 12,1C11.04,1 10.14,1.23 9.34,1.63L7.85,0.14C7.66,-0.05 7.34,-0.05 7.15,0.14C6.95,0.34 6.95,0.66 7.15,0.85L8.46,2.16C6.97,3.26 6,5 6,7H18C18,5 17,3.25 15.53,2.16M20.5,8A1.5,1.5 0 0,0 19,9.5V16.5A1.5,1.5 0 0,0 20.5,18A1.5,1.5 0 0,0 22,16.5V9.5A1.5,1.5 0 0,0 20.5,8M3.5,8A1.5,1.5 0 0,0 2,9.5V16.5A1.5,1.5 0 0,0 3.5,18A1.5,1.5 0 0,0 5,16.5V9.5A1.5,1.5 0 0,0 3.5,8M6,18A1,1 0 0,0 7,19H8V22.5A1.5,1.5 0 0,0 9.5,24A1.5,1.5 0 0,0 11,22.5V19H13V22.5A1.5,1.5 0 0,0 14.5,24A1.5,1.5 0 0,0 16,22.5V19H17A1,1 0 0,0 18,18V8H6V18Z"
const dRealDevice = "M17.25,18H6.75V4H17.25M14,21H10V20H14M16,1H8A3,3 0 0,0 5,4V20A3,3 0 0,0 8,23H16A3,3 0 0,0 19,20V4A3,3 0 0,0 16,1Z"
const dCamera = "M13.73,15L9.83,21.76C10.53,21.91 11.25,22 12,22C14.4,22 16.6,21.15 18.32,19.75L14.66,13.4M2.46,15C3.38,17.92 5.61,20.26 8.45,21.34L12.12,15M8.54,12L4.64,5.25C3,7 2,9.39 2,12C2,12.68 2.07,13.35 2.2,14H9.69M21.8,10H14.31L14.6,10.5L19.36,18.75C21,16.97 22,14.6 22,12C22,11.31 21.93,10.64 21.8,10M21.54,9C20.62,6.07 18.39,3.74 15.55,2.66L11.88,9M9.4,10.5L14.17,2.24C13.47,2.09 12.75,2 12,2C9.6,2 7.4,2.84 5.68,4.25L9.34,10.6L9.4,10.5Z"

@connect(mapStateToProp)
export default class Toolkit extends Component {

  constructor(props) {
    super(props)
    this.state = {
      devices: []
    }
  }

  render() {
    const { devices } = this.props
    return (
      <div>
        <AppBar 
          title={'Android Toolkit'}
          iconElementRight={<FlatButton label={'refresh'}/>}
          onRightIconButtonTouchTap={this.refreshDevice.bind(this)}
        />
        <List>
          <Subheader>
            Devices
          </Subheader>
          {devices.map(device => (
            <DeviceListItem 
              device={device}
              key={device.id} />
          ))}
        </List>
      </div>
    )
  }

  refreshDevice() {
    this.props.dispatch({
      type: 'ADB_DEVICES'
    })
  }
}

@connect()
class DeviceListItem extends Component {

  constructor(props) {
    super(props)
    this.state = {
      takingScreenshot: false
    }
  }

  render() {
    const { device } = this.props
    return (
      <DropZone 
        style={{flex: 1}}
        activeStyle={{flex: 1, backgroundColor: '#eee'}}
        rejectStyle={{flex: 1, backgroundColor: '#ffdddd'}}
        onDrop={this.onDrop.bind(this)}
        disableClick={true}
        multiple={false} >
        <ListItem
          primaryText={`${device.model}`}
          disabled={true}
          secondaryText={device.id}
          rightIcon={
            this.state.takingScreenshot ? 
            <CircularProgress size={24} thickness={1}/> :
            <div onClick={() => this.takeScreenShot(device)}>
              <SvgIcon
                color={Colors.green500}>
                <path d={dCamera}/>
              </SvgIcon>
            </div>
          }
          leftIcon={
            <SvgIcon
              color={Colors.green500}>
              <path d={device.id.indexOf('emulator') !== -1 ? dVirtualDevice : dRealDevice}/>
            </SvgIcon>
          }
        />
          <Divider inset={true}/>
      </DropZone>
    )
  }

  onDrop(acceptedFiles, rejectedFile) {
    const { device, dispatch } = this.props
    if (acceptedFiles) {
      console.log('Accepted files: ', acceptedFiles[0])
      if (acceptedFiles && acceptedFiles.length === 1) {
        let path = acceptedFiles[0].path
        if (path && path.endsWith('.apk')) {
          dispatch({
            type: 'ADB_INSTALL',
            payload: {
              path: path,
              id: device.id
            }
          })
        } else {
          dispatch({
            type: 'ADB_SEND',
            payload: {
              path: path,
              id: device.id
            }
          })
        }
      }
    }
  }

  takeScreenShot(device) {
    this.props.dispatch({
      type: 'ADB_SCREENSHOT',
      payload: device
    })
    this.setState({
      ...this.state,
      takingScreenshot: true
    })

    setTimeout(() => {
      this.setState({
        ...this.state,
        takingScreenshot: false
      })
    }, 3000)
  }

}

function mapStateToProp(state) {
  return {
    devices: state.devices.devices
  }
}
