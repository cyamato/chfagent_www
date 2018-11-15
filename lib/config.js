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

function getConfig() {
    let config = {
      
    };
    try {
      let rawdata = fs.readFileSync('./config/config.json');
      config = JSON.parse(rawdata);
    } catch (err) {
      console.log('config error: ');
      console.log(err);
    }
    return(config);
}

module.exports = {
  get: getConfig
};