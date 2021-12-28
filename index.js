// SFM Bridge Proxy
// This software is licensed under the MIT License.
// Copyright (c) 2021 KiwifruitDev

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const net = require("net");
const websockets = require("ws");
const fs = require("fs");
const websocket_port = process.env.SFM_BRIDGE_WS_PORT || fs.readFileSync("websocket_port.txt", "utf8") || 9090;
const tcp_port = process.env.SFM_BRIDGE_TCP_PORT || fs.readFileSync("tcp_port.txt", "utf8") || 9191;
const package = require('./package.json');

console.log("=== SFM Bridge Proxy v" + package.version + " ===");

// Websocket server portion
const wss = new websockets.Server({ port: websocket_port }, function () {
	console.log("Websocket server listening on port " + websocket_port + "!");
});

wss.on("connection", function connection(ws, incoming_message) {
	console.log("Websocket client " + incoming_message.socket.remoteAddress + " connected!");
	ws.on("close", function close() {
		console.log("Websocket client " + incoming_message.socket.remoteAddress + " disconnected!");
	});
	ws.on("message", function incoming(message) {
		//console.log("Websocket client " + incoming_message.socket.remoteAddress + " sent: " + message);
		tcp_client.write(message);
	});
	ws.on("error", function error(err) {
		console.log("Websocket client " + incoming_message.socket.remoteAddress + " errored! Disconnecting...");
		console.error(err);
		ws.close();
	});
});

wss.on("error", function error(err) {
	console.log("Websocket server errored! Closing...");
	console.error(err);
	wss.close();
	exit();
});

// TCP server portion
var tcp_active = false;
let tcp_client;

const server = net.createServer(function(socket) {
	if(!tcp_active) { // we only want one client at this time for simplicity
		console.log("TCP client " + socket.remoteAddress + " connected!");
		tcp_client = socket;
		socket.on("end", function() {
			console.log("TCP client " + socket.remoteAddress + " disconnected!");
			socket.end();
		});
		socket.on("close", function() {
			console.log("TCP client " + socket.remoteAddress + " disconnected!");
			socket.end();
		});
		socket.on("data", function(data) {
			console.log("TCP client " + socket.remoteAddress + " sent: " + data);
			wss.clients.forEach(function each(client) {
				client.send(data);
			});
		});
		socket.on("error", function(err) {
			console.log("TCP client " + socket.remoteAddress + " errored! Disconnecting...");
			console.error(err);
			socket.end();
		});
	}
});

server.on("error", function(err) {
	console.log("TCP server errored! Closing...");
	console.error(err);
	exit();
});

server.listen(tcp_port, function() {
	console.log("TCP server listening on port " + tcp_port + "!");
});


// Exiting
var exiting = false;

function exit() {
	if(!exiting) {
		console.log("=== Exiting... ===");
		exiting = true;
		wss.close();
		server.close();
		process.exit(0);
	}
}
