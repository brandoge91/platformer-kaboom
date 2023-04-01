const ws = require("ws");

module.exports = (server) => {
  console.log('gaming!')

	const wss = new ws.Server({ server: server, path: "/multiplayer" });
  const clients = new Map()
		function broadcast(data) {
			clients.forEach((client) => {
				if (client !== conn && client.readyState === ws.OPEN) {
					client.send(data);
				}
			});
		}
	wss.on('connection', (ws) => {
    console.log('bang!')
    const id = uuidv4();
    const color = Math.floor(Math.random() * 360);
    const username = "bang!"
    const metadata = { id, color, username };

    clients.set(ws, metadata);

    ws.on('message', (messageAsString) => {
      const message = JSON.parse(messageAsString);
      const metadata = clients.get(ws);

      message.sender = metadata.username;
      message.color = metadata.color;
      message.id = metadata.id;

      [...clients.keys()].forEach((client) => {
        client.send(JSON.stringify(message));
      });
    });  
    
    
});
  wss.on("close", () => {
  clients.delete(ws);
});

};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}