# SFM Bridge Proxy
A websocket server for [SFM Bridge](https://github.com/TeamPopplio/sfm-bridge) intended to redirect data from Source Filmmaker to other clients.

## Installation
[node.js](https://nodejs.org/) v16 or higher is required, it must be installed first.

Once node.js is installed, clone this repository somewhere and launch a terminal/command prompt window from there.

Run the following command to install the server:
```bash
npm install
```
Now you should be able to launch the server from the command line using the following command:
```bash
node index.js
```

## Usage
Connect your client to this server and then connect SFM Bridge to the server.

SFM Bridge should now be able to transmit information, you can see its output from the console.

The default SFM Bridge server port is ``9090``, it can be changed via the ``websocket_port.txt`` file or through the ``SFM_BRIDGE_WS_PORT`` environment variable.

The default non-SFM Bridge server port is ``9191``, it can be changed via the ``tco_port.txt`` file or through the ``SFM_BRIDGE_TCP_PORT`` environment variable.

## License
This software is licensed under the MIT License.
