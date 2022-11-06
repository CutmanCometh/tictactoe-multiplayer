import { WebSocketServer } from "ws";
import cuid from 'cuid';
import type { WebSocket } from "ws";

const port = 6090;
const wss = new WebSocketServer({ port });

const clients: Map<string, WebSocket> = new Map();

type ClientMessage = {
    id: string
    data: string
    type: string
}

wss.on('connection', (ws: WebSocket) => {
    const id = cuid();
    clients.set(id, ws);
    ws.send(JSON.stringify({type: 'assign-id', data: id}));
    console.log(`new client added: "${id}"`)
    
    ws.on('close', () => {
        console.log(`client disconnected: ${id}`);
        clients.delete(id);
    });

    ws.on('message', (message: string) => {
        const { type, data }: ClientMessage  = JSON.parse(message);
        switch (type) {
            case 'message':
                console.log(`received message: "${data}". from "${id}"`);
                const otherClients = Array.from(clients.entries()).filter(([recipientId]) => recipientId !== id).map(([_, ws]) => ws);
                otherClients.forEach((ws) => {
                    ws.send(JSON.stringify({
                        type: 'message',
                        data: {
                            text: data,
                            senderId: id,
                        }
                    }));
                });
                break;
            default:
                console.error(`Error. Unknown message type reached. "${type}"`);
                break;
        }
        
    });
});
