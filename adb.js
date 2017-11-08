const { exec } = require('child_process')
const path = require('path')

const modelReg = /model:([^ ]+)/
const deviceCodeReg = /device:([^ ]+)/
const idReg = /emulator-[^ ]+|[0-9a-f]+/
const progressReg = /(\d+)%/


const screenshotPath = "~/Desktop/android/"

const adb = path.join(__dirname, '/assets/adb')

module.exports = function(event, arg) {
  switch (arg.type) {
    case 'devices': {
      exec(`${adb} devices -l`, (error, stdout, stderr) => {
        if (error) {
          return
        }
        let devices = stdout.trim().split("\n").slice(1)
        if (devices) {
          let parsedDevices = devices.map(it => {
            return {
              model: modelReg.exec(it)[1],
              device: deviceCodeReg.exec(it)[1],
              id: idReg.exec(it)[0]
            }
          })
          event.sender.send('adb-reply', 'log', parsedDevices)
          event.sender.send('adb-reply', 'devices', {
            payload: parsedDevices
          })
        }
      })
      break
    }
    case 'screenshot': {
      let device = arg.payload
      let filename = `${device.device}_${new Date().getTime()}.png`
      exec(`mkdir -p ${screenshotPath} && ${adb} -s ${device.id} shell screencap -p /sdcard/screen.png && ${adb} -s ${device.id} pull /sdcard/screen.png ${screenshotPath}${filename} && open ${screenshotPath}${filename}`, 
        (error, stdout, stderr) => {
          if (!error) {
            event.sender.send('adb-reply', 'log', "screenshot done")
          } else {
            event.sender.send('adb-reply', 'log', "screenshot error\n" + stderr)
          }
        }
      )
      break
    }
    case 'install': {
      exec(`${adb} -s ${arg.payload.id} install -r "${arg.payload.path}"`, (error, stdout, stderr) => {
        if (error) {
          event.sender.send('adb-reply', 'log', stderr)
        } else {
          event.sender.send('adb-reply', 'log', "Installed.")
        }
      })
      break
    }
    case 'send': {
      let upload = exec(`${adb} -s ${arg.payload.id} push "${arg.payload.path}" /sdcard/Download`, {maxBuffer: 10000*1024,})
      upload.stdout.on('data', (data) => {
        let match = progressReg.exec(data)
        if (match) event.sender.send('adb-reply', 'log', match[1])
      })
      upload.stderr.on('data', (data) => {
        event.sender.send('adb-reply', 'error', data)
      })
      upload.on('close', code => {
        event.sender.send('adb-reply', 'log', `Exited with code ${code}`)
      })
      break
    }
    default:
  }
}
