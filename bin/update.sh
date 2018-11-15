#!/bin/bash
# Setup chfagent - The Kentik Proxy Agent
# Auther: Craig Yamato II
# date: 10/03/2018
# url: https://github.com/cyamato/chfagent-systemd
# License: MIT
echo running
mkdir ./chfagent
cp ./chfagent*.deb ./chfagent/
cd ./chfagent
ar x ./chfagent*.deb  
tar -xzf ./data.tar.gz
rm -f /usr/bin/chfagent
cp ./usr/bin/chfagent /usr/bin/chfagent
cd ..
rm -r -f ./chfagent