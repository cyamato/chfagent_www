// LOG.JS
/** Copyright (c) 2018 Craig Yamato */

/**
 * @fileoverview 
 *
 * Make a JSON Line log file
 * @author Craig Yamato <craig@kentik.com>
 * @copyright (c) 2018 - Craig Yamato
 * @version 1.0.0
 * @exports 
 */
'use strict';
const fs = require('fs');
const config = require('./config.js');
const EventEmitter = require('events');

const EE = new EventEmitter();
EE.setMaxListeners(20);

const local_config = config.get();

function log (msg) {
    try {
        let rawMsg = JSON.stringify(msg) + '\n';
        fs.appendFile(
            local_config.server.log, 
            rawMsg, 
            {
                encoding: 'utf8',
                mode: 0o666,
                flag: 'a+'
            }, 
            (err) => {
                if (err) {
                    process.send(err);
                }
            }
        );
    } catch (err) {
        console.log (err);
        process.send(err);
    }
}

process.on('message', (msg) => {
    log(msg);
});