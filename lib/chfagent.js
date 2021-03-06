// INDEX.JS
/** Copyright (c) 2018 Craig Yamato */

/**
 * @fileoverview 
 *
 * The web front end provides the abuilty to setup the CHFAgent
 * which is running on this server.  It will also show the curent status.
 * @author Craig Yamato <craig@kentik.com>
 * @copyright (c) 2018 - Craig Yamato
 * @version 1.0.0
 * @exports 
 */
'use strict';
const fs = require('fs');
const net = require('net');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const config = require('./config.js');
const crypto = require('crypto');
const https = require('https');

const local_config = config.get();

function getStatus() {
  return new Promise((resolve, reject) => {
    getConfig()
        .then((result) => {
            let msg = '';
            const tcpOptions = {
              host: result.host,
              port: parseInt(result.port, 10)+1
            };
            const client = net.createConnection(tcpOptions, () => {
              let msgBuffer = Buffer.from('', 'utf8');
              client.write(msgBuffer, () => {});
            });
            client.on('data', (data) => {
              msg += data;
              client.end();
            });
            client.on('end', () => {
              let msg_parts = msg.split('\n');
              msg_parts.pop();
              msg_parts.pop();
              msg_parts.pop();
              let chfagent_status = msg_parts.shift();
              msg_parts.shift();
              let kentik_connection = msg_parts.shift();
              let status = {
                chfagent_status: chfagent_status,
                kentik_connection: kentik_connection,
                devices: []
              };
              for (let device=0, l=msg_parts.length; device < l; device++) {
                if (msg_parts[device] !== "") {
                  if (msg_parts[device] != 'Fails') {
                    let device_info_parts = msg_parts[device].split(" ");
                    let device_info_id = device_info_parts[1].split(":");

                    let deviceDateOffset = new Date().getTimezoneOffset();
                    let offsetDirection = deviceDateOffset > 0 ? "-" : "+";
                    let deviceDateOffsetHour = Math.floor(deviceDateOffset/60).toString();
                    let deviceDateOffsetMin = deviceDateOffset - (deviceDateOffsetHour*60);
                    let deviceDateOffsetHourStr = "0000" + deviceDateOffsetHour.toString();
                    deviceDateOffsetHourStr = deviceDateOffsetHourStr.substr(deviceDateOffsetHourStr.length - 2);
                    let deviceDateOffsetMinStr = "0000" + deviceDateOffsetMin.toString();
                    deviceDateOffsetMinStr = deviceDateOffsetMinStr.substr(deviceDateOffsetMinStr.length - 2);
                    let offSet = offsetDirection + deviceDateOffsetHourStr + ":" + deviceDateOffsetMinStr;

                    offsetDirection = null;
                    deviceDateOffset = null;
                    deviceDateOffsetHour = null;
                    deviceDateOffsetHourStr = null;
                    deviceDateOffsetMin = null;
                    deviceDateOffsetMinStr = null;

                    status.devices.push({
                      status: device_info_parts[0],
                      deviceID: device_info_id[0],
                      deviceName: device_info_id[1],
                      deviceIP: device_info_parts[4],
                      in1: device_info_parts[7],
                      out1: device_info_parts[9],
                      in15: device_info_parts[11],
                      out15: device_info_parts[13].slice(0, -2),
                      lastSeen: device_info_parts[16] + "T" + device_info_parts[17] + offSet
                    });
                  }
                }
              }
              resolve(status);
            });
            client.on('error', (error) => {
              client.destroy();
              if (error.code == "ECONNREFUSED") {
                  resolve({
                      chfagent_status: "Not Running",
                      kentik_connection: "Not Connected",
                      devices: []
                  });
              } else {
                reject(error);
              }
            });
        })
        .catch((reson) => {
            reject(reson);
        });
  });
}
function getConfig () {
    return new Promise((resolve, reject) => {
        let chfagent_config = {
            email: '',
            token: '',
            host: '',
            port: ''
        };
        let rawdata = fs.readFileSync(local_config.chfagent.config_loc, 'utf8');
        let rows = rawdata.split('\n');
        for (let row=0, l=rows.length; row<l; row++) {
            if (rows[row].startsWith('Environment')) {
                let pair = rows[row].split('=');
                let key = pair[1].slice(1);
                let value = pair[2].slice(0, -1);
                if (key === 'chfagent_email') {
                    chfagent_config.email = value;
                } else if (key === 'chfagent_token') {
                    chfagent_config.token = value;
                } else if (key === 'chfagent_ip') {
                    chfagent_config.host = value;
                } else if (key === 'chfagent_port') {
                    chfagent_config.port = value;
                }
            }
        }
        resolve(chfagent_config);
    });
}
function setConfig (chfagent_config) {
    return new Promise((resolve, reject) => {
        let content = "[Service]\n";
        content += "Environment='chfagent_email=" + chfagent_config.email + "'\n";
        content += "Environment='chfagent_token=" + chfagent_config.token + "'\n";
        content += "Environment='chfagent_ip=" + chfagent_config.host + "'\n";
        content += "Environment='chfagent_port=" + chfagent_config.port + "'\n";
        try {
            fs.writeFileSync(local_config.chfagent.config_loc, content);
            stop()
            .then((result) => {
                reload()
                .then((result) => {
		    start()
                    .then((result) => {
                        resolve(true);
                    })
                    .catch((reson) => {
                        reject(reson);
                    });
		})
		.catch((reson) => {
		    reject(reson);
                });
            })
            .catch((reson) => {
                reject(reson);
            });
        } catch (err) {
            console.error(err);
            reject(err);
            return;
        }
    });
}
function setHost (host, port) {
    return new Promise((resolve, reject) => {
        getConfig()
            .then((chfagent_config) => {
                chfagent_config.host = host;
                chfagent_config.port = port;
                setConfig(chfagent_config)
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((reson) => {
                        reject(reson);
                    });  
            });
    });
}
function setAuth (email, token) {
    return new Promise((resolve, reject) => {
        getConfig()
            .then((chfagent_config) => {
                chfagent_config.email = email;
                chfagent_config.token = token;
                setConfig(chfagent_config)
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((reson) => {
                        reject(reson);
                    }); 
            });
    });
}

function restart () {
    return new Promise((resolve, reject) => {
        stop()
            .then((result) => {
                setTimeout(() => {
                    start()
                        .then((result) => {
                            resolve({
                                success: true,
                                message: 'CHFAgent restarted'
                            });
                        })
                        .catch((reson) => {
                            console.log('error');
                            reject(reson);
                            return;
                        });
                }, 0);
            })
            .catch((reson) => {
                reject(reson);
                return;
            });
    });
}
function reload () {
    return new Promise((resolve, reject) => {
        let reloadConfig = spawn('sudo',
            [
                `systemctl`,
                `daemon-reload`
            ],
            {
                cwd: '/',
                detached: false,
                stdio: 'pipe'
            }
        );
        reloadConfig.on('exit', (code) => {
            resolve({
                success: true,
                message: `reload child process exited with code ${code}`
            });
            return;
        });

        reloadConfig.on('error', (err) => {
            console.log('reload Exit with Error');
            reject({
                sucess: false,
		message: err
            });
            return;
        });
    });
}
function start () {
    return new Promise((resolve, reject) => {
                const chfagent = spawn('sudo',
                    [
                        `systemctl`,
                        `start`,
                        `chfagent`
                    ],
                    {
                        cwd: '/',
                        detached: false,
                        stdio: 'pipe'
                    }
                );
                chfagent.on('exit', (code) => {
                    resolve({
		        success: true,
		        message: `start child process exited with code ${code}`
                    });
                    return;
                });
                chfagent.on('error', (err) => {
                    console.log('Start Exited with error');
                    reject({
                        success: false,
                        message: err
                    });
                    return;
	    	});
    });
}
function stop () {
    return new Promise((resolve, reject) => {
        let chfagent = spawn('sudo',
            [
                `systemctl`,
                `stop`,
                `chfagent`
            ],
            {
                cwd: '/',
                detached: false,
                stdio: 'pipe'
            }
        );
 	chfagent.on('exit', (code) => {
            resolve({
               success: true,
               message: `stop child process exited with code ${code}`
            });
            return;
        });
        chfagent.on('error', (err) => {
            console.log('Exited with error');
            reject({
               success: false,
               message: err
            });
            return;
        });
    });
}

function fileHash(fileLoc) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        if (fs.existsSync(fileLoc)) {
            const input = fs.createReadStream(fileLoc);
            input.on('readable', () => {
                const data = input.read();
                if (data) {
                    hash.update(data);
                } else {
                    resolve(hash.digest('hex'));
                }
            });
        } else {
            reject(new Error("File not found"));
        }
    });
}
function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        try {
            let file = fs.createWriteStream(filename);
            let request = https.get(url, (res) => {
                res.on('data', (chunk) => {
                    file.write(chunk);
                });
                res.on('end', () => {
                    file.end();
                    resolve(true);
                });
                request.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (err) {
            reject(err);
        }
    });
}
function updateCheck() {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        if (fs.existsSync('./bin/chfagent.sha256')) {
            try {
                downloadFile(local_config.chfagent.chfagentDownloadURL, local_config.chfagent.chfagentDebFilename)
                    .then((result) => {
                        fileHash(local_config.chfagent.chfagentDebFilename)
                            .then((result) => {
                                let rawdata = fs.readFileSync('./bin/chfagent.sha256', 'utf8');
                                if (result == rawdata) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            })
                            .catch((reson) => {
                                reject(reson);
                            });
                    })
                    .catch((reson) => {
                        reject(reson);
                    });
            } catch (err) {
                console.log(err);
                reject(err);
            }
        } else {
            if (fs.existsSync(local_config.chfagent.chfagentDebFilename)) {
                const input = fs.createReadStream(local_config.chfagent.chfagentDebFilename);
                input.on('readable', () => {
                    const data = input.read();
                    if (data) {
                        hash.update(data);
                    } else {
                        fs.writeFileSync("./bin/chfagent.sha256", hash.digest('hex'), 'utf8');
                        resolve(false);
                    }
                });
            } else {
                downloadFile(local_config.chfagent.chfagentDownloadURL, local_config.chfagent.chfagentDebFilename)
                    .then((result) => {
                    	const input = fs.createReadStream(local_config.chfagent.chfagentDebFilename);
                	input.on('readable', () => {
                    	    const data = input.read();
                            if (data) {
                                hash.update(data);
                            } else {
                                fs.writeFileSync("./bin/chfagent.sha256", hash.digest('hex'), 'utf8');
                                resolve(false);
                            }
                        });
                    })
                    .catch((reson) => {
			reject(reson);
                    });
            }
        }
    });
}
function updateCHFAgent() {
    return new Promise((resolve, reject) => {
        stop()
            .then((result) => {
                let chfagent = spawnSync('sudo',
                    [process.cwd() + '/bin/update.sh'],
                    {
                        cwd: process.cwd() + '/bin/',
                        shell: true
                    }
                );
                if (chfagent.error) {
                    let msg = chfagent.error || chfagent.output[2];
                    console.log('error');
                    reject({
                        sucess: false,
                        message: msg.toString('utf8')
                    });
                    return;
                } else {
                    start()
                        .then((result) => {
                             resolve({
                                sucess: true,
                                message: 'CHFAgent update'
                            });
                        })
                        .catch((reson) => {
                            reject(reson);
                        });
                }
            })
            .catch((reson) => {
                reject(reson);
            });
    });
}

module.exports = {
  get: getConfig,
  set: setConfig,
  setHost: setHost,
  setAuth: setAuth,
  restart: restart,
  start: start,
  stop: stop,
  status: getStatus,
  updateCheck: updateCheck,
  update: updateCHFAgent
};
