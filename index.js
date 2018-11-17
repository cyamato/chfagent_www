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
const express = require('express');
const app = express();
// const fs = require('fs');
// const https = require('https');
const { fork } = require('child_process');
const EventEmitter = require('events');
const chfagent = require('./lib/chfagent.js');
const cookieParser = require('cookie-parser');
const config = require('./lib/config.js');
const local_config = config.get();
const auth = require('./lib/login.js');

const port = process.env.PORT || 8080;
const runningMsg = "CHFAgent Web Front end listening on port " + port + "!";

const logging = fork('./lib/log.js');
logging.on('message', (err) => {
  if (err) {
    logging.send(err);
  }
});
const EE = new EventEmitter();
EE.setMaxListeners(15);

let router = express.Router();
try {
  app.use(cookieParser(local_config.server.cookieSecrit));
  app.use((req, res, next) => {
    req.requestTime = Date.now();
    res.on("finish", () => {
        let finnish = Date.now();
        let msg = {
          req: {
            headers: req.headers,
            url: req.url,
            method: req.method,
            body: req.body,
            time: req.requestTime
          },
          res: {
            headers: res._headers,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            body: res.body
          },
          time: finnish - req.requestTime
        };
        logging.send(msg);
    });
    next();
  });
  app.use((req, res, next) => {
    let loggedInCookie = req.signedCookies['chfagent_www'] ? JSON.parse(req.signedCookies['chfagent_www']) : false;
    if (loggedInCookie && ((loggedInCookie.date + local_config.server.inactiveTimeout - Date.now()) > 0)) {
      loggedInCookie.date = Date.now();
      res.cookie(
        'chfagent_www', 
        JSON.stringify(loggedInCookie), 
        {
          maxAge: local_config.server.inactiveTimeout, 
          signed: true
        }
      );
      next();
    } else {
      if (
        req.url == '/' ||
        req.url.startsWith('/css/') ||
        req.url.startsWith('/img/') ||
        req.url.startsWith('/js/') ||
        req.url.startsWith('/fontawesome-free/') ||
        req.url == '/api/v1/login' || 
        req.url == '/favicon.ico'
      ) {
        next();
      }
      else {
        res.sendStatus(403);
      }
    }
  });
  
  router.post('/api/v1/login', function(req, res) {
    auth.network.device.get(
      req.body.user,
      req.body.token
    )
          .then((result) => {
            res.cookie(
              'chfagent_www', 
              JSON.stringify({
                date: Date.now(),
                user: 'craig'
              }), 
              {
                maxAge: local_config.server.inactiveTimeout, 
                signed: true
              }
            );
            logging.send({Loggin: {
              user: req.body.user,
              result: 201
            }});
            res.sendStatus(201);
          })
          .catch((reson) => {
            logging.send(reson);
            logging.send({Loggin: {
              user: req.body.user,
              result: 403
            }});
            res.sendStatus(403);
          });
  });
  router.get('/api/v1/chfagent', function(req, res) {
    chfagent.status()
        .then((result) => {
          res.send(JSON.stringify(result));
        })
        .catch((reson) => {
          logging.send(reson);
          res.send(400);
        });
  });
  router.get('/api/v1/chfagent/config', function(req, res) {
    chfagent.get()
        .then((result) => {
          delete result.token;
          res.send(JSON.stringify(result));
        })
        .catch((reson) => {
          logging.send(reson);
          res.sendStatus(400);
        });
  });
  router.put('/api/v1/chfagent/config', function(req, res) {
    chfagent.set(req.body.chfagent);
    res.sendStatus(201);
  });
  router.put('/api/v1/chfagent/config/auth', function(req, res) {
    chfagent.setAuth(req.body.chfagent.email, req.body.chfagent.token);
    res.sendStatus(201);
  });
  router.put('/api/v1/chfagent/config/host', function(req, res) {
    chfagent.setHost(req.body.chfagent.host, req.body.chfagent.port);
    res.sendStatus(201);
  });
  router.get('/api/v1/chfagent/start', function(req, res) {
    chfagent.start()
        .then((result) => {
          res.send(JSON.stringify(result));
        })
        .catch((reson) => {
          logging.send(reson);
          res.sendStatus(400);
        });
  });
  router.get('/api/v1/chfagent/stop', function(req, res) {
    chfagent.stop()
        .then((result) => {
          res.send(JSON.stringify(result));
        })
        .catch((reson) => {
          logging.send(reson);
          res.sendStatus(400);
        });
  });
  router.get('/api/v1/chfagent/restart', function(req, res) {
    chfagent.restart()
        .then((result) => {
          res.send(JSON.stringify(result));
        })
        .catch((reson) => {
          logging.send(reson);
          res.sendStatus(400);
        });
  });
  router.get('/api/v1/chfagent/update', function(req, res) {
    chfagent.updateCheck()
        .then((result) => {
          res.send(JSON.stringify({update: result}));
        })
        .catch((reson) => {
          logging.send(reson);
          res.sendStatus(400);
        });
  });
  router.get('/api/v1/chfagent/update/do', function(req, res) {
    chfagent.updateCheck()
        .then((result) => {
          res.send(JSON.stringify({update: result}));
        })
        .catch((reson) => {
          logging.send(reson);
          res.sendStatus(400);
        });
  });
  
  app.use(express.json());
  app.use('/', router);
  app.use(express.static('public'));
  app.use(express.static('node_modules/@fortawesome'));
  app.use(express.static('logs'));
} catch(err) {
  logging.send(err);
}

// https.createServer({ // key: fs.readFileSync('./config/server.key'), 
// cert: fs.readFileSync('./config/server.cert') // }, app) // 
// .listen(port); 
app.listen(port, () => {
  console.log(runningMsg);
  logging.send({Start: runningMsg});
});
