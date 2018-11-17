const chfagent = require('./chfagent.js');
chfagent.get()
.then(r=>{console.log(r);})
.catch(r=>{console.log(r);});
