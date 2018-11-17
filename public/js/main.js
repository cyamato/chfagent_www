let activePanel = null;
let pageLoaded = false;
let email = null;
let host = null;
let hostPort = null;
let lastStatus = null;
let updateRefresh = 10000;

String.prototype.toCamelCase = function() {
    return this.replace(/\b(\w)/g, function(match, capture) {
        return capture.toUpperCase();
    });
};

function notAuth() {
    hideLoadingIcon();
    document.getElementById("status").style.display = "none";
    document.getElementById("config").style.display = "none";
    document.getElementById("auth").style.display = "flex";
}

function loadDeviecTableHeaders(table, rowDataArray) {
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    
    let row = document.createElement("div");
    row.classList.add("dT-row--head");
    row.classList.add("dT-row");
    
    let cell = document.createElement("div");
    cell.classList.add("dT-cell");
    let text = document.createTextNode("Device Name");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("Status");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("Device ID");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("IP Address");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("Last Seen");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("RX 1Min fps");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("TX 1Min fps");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("RX 15Min fps");
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    text = document.createTextNode("TX 15Min fps");
    cell.appendChild(text);
    row.appendChild(cell);
    
    table.appendChild(row);
    loadDeviecs(table, rowDataArray);
}

function showLoadingIcon() {
    document.getElementById("loadingIcon").style.visibility = "visible";
}

function hideLoadingIcon() {
    document.getElementById("loadingIcon").style.visibility = "hidden";
}

function showMenu() {
    document.getElementById("menu").style.visibility = "visible";
}

function hideMenu() {
    document.getElementById("menu").style.visibility = "hidden";
}

function loadDeviecs(table, rowDataArray) {
    if (rowDataArray.length == 0) {
        hideLoadingIcon();
        setTimeout(loadCHFAgentStatus, updateRefresh);
        return;
    }
    
    let rowData = rowDataArray.shift();
    let row = document.createElement("div");
    row.classList.add("dT-row");
    
    let lastSeenDate = moment(rowData.lastSeen).format("MMM DD, YYYY HH:mm:ss UTCZ");
    
    let cellHead = document.createElement("div");
    cellHead.classList.add("dT-cell");
    let spanHead = document.createElement("span");
    spanHead.classList.add("dT-label--head");
    let text = document.createTextNode(rowData.deviceName);
    cellHead.appendChild(spanHead);
    cellHead.appendChild(text);
    row.appendChild(cellHead);
    
    let cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    let textSpan = document.createTextNode("Satus:");
    if (rowData.status === "*") {
        rowData.status = "Reciving Flow";
        cell.classList.add("green");
    }
    text = document.createTextNode(rowData.status);
    spanHead.appendChild(textSpan);
    // cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    textSpan = document.createTextNode("Device ID:");
    text = document.createTextNode(rowData.deviceID);
    spanHead.appendChild(textSpan);
    cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    textSpan = document.createTextNode("IP Address:");
    text = document.createTextNode(rowData.deviceIP);
    spanHead.appendChild(textSpan);
    cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    textSpan = document.createTextNode("Last Seen:");
    text = document.createTextNode(lastSeenDate);
    spanHead.appendChild(textSpan);
    cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    textSpan = document.createTextNode("RX 1Min fps:");
    text = document.createTextNode(rowData.in1);
    spanHead.appendChild(textSpan);
    cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    textSpan = document.createTextNode("TX 1Min fps:");
    text = document.createTextNode(rowData.out1);
    spanHead.appendChild(textSpan);
    cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    textSpan = document.createTextNode("RX 15Min fps:");
    text = document.createTextNode(rowData.in15);
    spanHead.appendChild(textSpan);
    cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    cell = document.createElement("div");
    cell.classList.add("dT-cell");
    spanHead = document.createElement("span");
    spanHead.classList.add("dT-label");
    textSpan = document.createTextNode("TX 15Min fps:");
    text = document.createTextNode(rowData.out15);
    spanHead.appendChild(textSpan);
    cell.appendChild(spanHead);
    cell.appendChild(text);
    row.appendChild(cell);
    
    table.appendChild(row);
    
    loadDeviecs(table, rowDataArray);
}

function loadCHFAgentConfig() {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let chfAgentConfig = JSON.parse(this.responseText);
                email = chfAgentConfig.email;
                host = chfAgentConfig.host;
                hostPort = chfAgentConfig.port;
                document.getElementById("userEmail").value = email;
                document.getElementById("ipAddress").value = host;
                document.getElementById("ipPort").value = hostPort;
                hideLoadingIcon()
                resolve(true);
            } else if (this.readyState == 4 && this.status == 403) {
                notAuth();
            } else if (this.readyState == 4) {
                hideLoadingIcon();
                console.error('Error: CHFAgent reuest for Config');
                console.error(this);
                reject(this.status);
            }
        };
        showLoadingIcon();
        xhttp.open("GET", "api/v1/chfagent/config", true);
        xhttp.send();
    });
}

function loadCHFAgentStatus() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        console.log(this.responseText + ": " + this.status);
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText != lastStatus) {
                lastStatus = this.responseText;
                let status = JSON.parse(this.responseText);
                
                let statusMsg = status.chfagent_status.toLowerCase().toCamelCase();
                let connMsg = status.kentik_connection.toLowerCase().toCamelCase();
                
                let greenStatus = false;
                if (statusMsg === "Good") {
                    greenStatus = true;
                }
                let greenConn = false;
                if (connMsg === "Connected") {
                    greenConn = true;
                }
                
                if (statusMsg != "Not Running") {
                    statusMsg += " - Running at " + host + ":" + hostPort;
                }
                connMsg += " to the Kentik KDE";
                
                let ss = document.getElementById('serverStatus');
                let sc = document.getElementById('serverConnection');
                ss.innerHTML = statusMsg;
                sc.innerHTML = connMsg;
                
                if (greenStatus) {
                    ss.classList.add("green");
                }
                if (greenConn) {
                    sc.classList.add("green");
                }
                
                let table = document.getElementById("connectedDeviceTables");
                loadDeviecTableHeaders(table, status.devices);
            } else {
                setTimeout(loadCHFAgentStatus, updateRefresh);
                hideLoadingIcon();
            }
        } else if (this.readyState == 4 && this.status == 403) {
            notAuth();
        } else if (this.readyState == 4) {
            hideLoadingIcon();
            console.error('Error: CHFAgent reuest for Status');
            console.error(this);
        }
    };
    showLoadingIcon();
    xhttp.open("GET", "api/v1/chfagent", true);
    xhttp.send();
}

function hideChfagentUpdateNotice() {
    document.getElementById("updateNotice").style.visibility = "hidden";
}

function showChfagentUpdateNotice() {
    document.getElementById("updateNotice").style.visibility = "visibility";
    setTimeout(hideChfagentUpdateNotice, 10000);
}

function updateChfagent() {
    let chfAgentConfig = {
        email: document.getElementById("userEmail").value,
        token: document.getElementById("userToken").value,
        host: document.getElementById("ipAddress").value,
        port: document.getElementById("ipPort").value
    };
    console.log('Update Processing');
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
	console.log('State Change: '+this.readyState+":"+this.status);
        if (this.readyState == 4 && this.status == 201) {
            console.log('Done');
            showChfagentUpdateNotice();
            hideLoadingIcon();
            document.getElementById("status").style.display = "flex";
            document.getElementById("config").style.display = "none";
            document.getElementById("about").style.display = "none";
        } else if (this.readyState == 4 && this.status == 403) {
            cosnole.log('No Auth');
            notAuth();
            hideLoadingIcon();
        } else if (this.readyState == 4) {
	    console.log('Error');
            hideLoadingIcon();
            console.error('Error: CHFAgent reuest for Status');
            console.error(this);
        }
    };
    showLoadingIcon();

    let putUdate = "/api/v1/chfagent/config/host";
    if (chfAgentConfig.token) {
        putUdate = "api/v1/chfagent/config";
    }
    xhttp.open("PUT", putUdate, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({chfagent: chfAgentConfig}));
}

function startCHFAgent() {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                hideLoadingIcon();
                resolve(true);
            } else if (this.readyState == 4 && this.status == 403) {
                hideLoadingIcon();
                notAuth();
            } else if (this.readyState == 4) {
                hideLoadingIcon();
                console.error('Error: Server Respose for requst to START');
                console.error(this);
                reject(this.status);
            }
        };
        showLoadingIcon();
        xhttp.open("GET", "api/v1/chfagent/start", true);
        xhttp.send();
    });
}

function stopCHFAgent() {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                hideLoadingIcon();
                resolve(true);
            } else if (this.readyState == 4 && this.status == 403) {
                hideLoadingIcon();
                notAuth();
            } else if (this.readyState == 4) {
                hideLoadingIcon();
                console.error('Error: Server Respose for requst to STOP');
                console.error(this);
                reject(this.status);
            }
        };
        showLoadingIcon();
        xhttp.open("GET", "api/v1/chfagent/stop", true);
        xhttp.send();
    });
}

function restartCHFAgent() {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                hideLoadingIcon();
                resolve(true);
            } else if (this.readyState == 4 && this.status == 403) {
                hideLoadingIcon();
                notAuth();
            } else if (this.readyState == 4) {
                hideLoadingIcon();
                console.error('Error: Server Respose for requst to RESTART');
                console.error(this);
                reject(this.status);
            }
        };
        showLoadingIcon();
        xhttp.open("GET", "api/v1/chfagent/restart", true);
        xhttp.send();
    });
}

function hideCHFAgentUpdate() {
    document.getElementById("updateProxy").style.display = "none";
}

function showCHFAgentUpdate() {
    document.getElementById("updateProxy").style.display = "flex";
}

function checkForUpdate() {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                hideLoadingIcon();
                let chfAgentUpdate = JSON.parse(this.responseText);
                if (chfAgentUpdate.update == true) {
                    showCHFAgentUpdate();
                    document.getElementById("updateProxy").addEventListener('click', function () {
                        doUpdate();
                    });
                }
                resolve(true);
            } else if (this.readyState == 4 && this.status == 403) {
                hideLoadingIcon();
                notAuth();
            } else if (this.readyState == 4) {
                hideLoadingIcon();
                console.error('Error: Server Respose for requst for Update Status');
                console.error(this);
                reject(this.status);
            }
        };
        showLoadingIcon();
        xhttp.open("GET", "/api/v1/chfagent/update", true);
        xhttp.send();
    });
}

function doUpdate() {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                hideLoadingIcon();
                let chfAgentUpdate = JSON.parse(this.responseText);
                if (chfAgentUpdate.update) {
                    hideCHFAgentUpdate();
                    showChfagentUpdateNotice();
                    document.getElementById("status").style.display = "flex";
            	    document.getElementById("config").style.display = "none";
                    document.getElementById("about").style.display = "none";
                }
                resolve(true);
            } else if (this.readyState == 4) {
                hideLoadingIcon();
                console.error('Error: Server Respose for requst to do Update Status');
                console.error(this);
                reject(this.status);
            }
        };
        showLoadingIcon();
        xhttp.open("GET", "/api/v1/chfagent/update/do", true);
        xhttp.send();
    });
}

function hideMenu2() {
    document.getElementById("menu").style.display = "none";
}

function showMenu2() {
    document.getElementById("menu").style.display = "flex";
}

function hideMenuScreenSize(media) {
        hideMenu2();
}

function checkAuth() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) {
            document.getElementById("status").style.display = "flex";
            document.getElementById("config").style.display = "none";
            document.getElementById("auth").style.display = "none";
            hideLoadingIcon();
        
            loadCHFAgentConfig()
                .then((result) => {
                    loadCHFAgentStatus();
                    checkForUpdate();
                })
                .catch((reson) => {
                });
        } else if (this.readyState == 4 && this.status == 403) {
            console.log("Login Bad");
            hideLoadingIcon();
            notAuth();
        } else if (this.readyState == 4) {
            console.error('Error: CHFAgent Authrizing');
            console.error(this);
            hideLoadingIcon();
        }
    };
    
    showLoadingIcon();
    
    xhttp.open("POST", "/api/v1/login", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({
        user: document.getElementById("kentikUserEmail").value,
        token: document.getElementById("kentikUserToken").value
    }));
    document.getElementById("kentikUserEmail").value = "";
    document.getElementById("kentikUserToken").value = "";
}

window.onload = function () {
    if (!pageLoaded) {
        pageLoaded = true;
        let mainNav = document.getElementById('menu');
        let navBarToggle = document.getElementById('navbar-toggle');
        let navStatus = document.getElementById('nav-status');
        let navConfig = document.getElementById('nav-config');
        let start = document.getElementById('start');
        let stop = document.getElementById('stop');
        let restart = document.getElementById('restart');
        let update = document.getElementById('update');
        
        let menuMediaControl = window.matchMedia("(min-width: 768px)"); 
        menuMediaControl.addListener(hideMenuScreenSize);
        
        hideMenu2();
        
        document.getElementById("status").style.display = "none";
        hideCHFAgentUpdate();
        
        navBarToggle.addEventListener('click', function () {
            let menuState = document.getElementById("menu").style.display;
            if (menuState == "none") {
                showMenu2();
            } else {
                hideMenu2();
            }
        });
        
        navStatus.addEventListener('click', function () {
            document.getElementById("status").style.display = "flex";
            document.getElementById("config").style.display = "none";
            document.getElementById("about").style.display = "none";
            mainNav.classList.toggle('active');
        });
        
        navConfig.addEventListener('click', function () {
            document.getElementById("status").style.display = "none";
            document.getElementById("config").style.display = "flex";
            document.getElementById("about").style.display = "none";
            mainNav.classList.toggle('active');
        });
        
        document.getElementById('nav-about').addEventListener('click', function () {
            document.getElementById("status").style.display = "none";
            document.getElementById("config").style.display = "none";
            document.getElementById("about").style.display = "flex";
            mainNav.classList.toggle('active');
        });
        
        start.addEventListener('click', function () {
            startCHFAgent();
        });
        stop.addEventListener('click', function () {
            stopCHFAgent();
        });
        restart.addEventListener('click', function () {
            restartCHFAgent();
        });
        
        update.addEventListener('click', function () {
            updateChfagent();
        });
        
        document.getElementById('Login').addEventListener('click', function () {
            checkAuth();
        });
        
        loadCHFAgentConfig()
            .then((result) => {
                loadCHFAgentStatus();
                checkForUpdate();
            })
            .catch((reson) => {
            });
    }
};
