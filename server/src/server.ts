import { WebSocketServer } from "ws";
import cuid from 'cuid';
import type { WebSocket } from "ws";

const port = 6090;
const wss = new WebSocketServer({ port });

const clients: Map<string, WebSocket> = new Map();

type ClientMessage = {
    id: string
    message: string
}

wss.on('connection', (ws: WebSocket) => {
    const id = cuid();
    clients.set(id, ws);
    ws.send(JSON.stringify({id}));

    ws.on('message', (data: string) => {
        const { id: senderId, message }: ClientMessage  = JSON.parse(data);
        const otherClients = Array.from(clients.entries()).filter(([id]) => id !== senderId).map(([_, ws]) => ws);
        otherClients.forEach((ws) => {
            ws.send(message);
        });
    });
});
