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
const https = require('https');
const config = require('./config.js');
const local_config = config.get();

function getDevices (user, token) {
    return new Promise((resolve, reject) => {
        let options = local_config.kentik.network.device; 
        options["X-CH-Auth-Email"] = user;
        options["X-CH-Auth-API-Token"] = token;
        let req = https.request(options, function (res) {
            let chunks = [];
    
            res.on("data", (chunk) => {
                chunks.push(chunk);
            });
    
            res.on("end", () => {
                let body = Buffer.concat(chunks);
                resolve({
                    statusCode: res.statusCode,
                    msg: body.toString()
                });
            });
            
            res.on("error", (err) => {
                reject(err);
            });
        });
    
        req.end();
    });
}

module.exports = {
  network: {
      device: {
          get: getDevices
      }
  }
};