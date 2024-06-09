const { json } = require("stream/consumers");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 4000 });

let currentClients = 0;

function updateCounts() {
    const message = JSON.stringify({
        type: "count update",
        count: currentClients,
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on("connection", (ws) => {
    currentClients++;
    console.log("current connected clients:", currentClients);
    updateCounts();

    ws.on("message", (message) => {
        console.log(`recieved message: ${message}`);
        const updatedMessage = JSON.parse(message);
        updatedMessage.count = currentClients;

        const updatedMessageString = JSON.stringify(updatedMessage);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(updatedMessageString);
            }
        });
    });

    ws.on("close", () => {
        console.log("client disconnected");
        currentClients--;
        console.log("current connected clients:", currentClients);
        updateCounts();
    });

    ws.on("error", (error) => {
        console.error(`websocket error: ${error}`);
    });
});

console.log("server running on ws://localhost:4000");
