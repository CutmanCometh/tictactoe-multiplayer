import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface AppContextInterface {
    clientId: string | null;
    isConnectedToServer: boolean;
    receivedMessages: Message[];
    connectToServer(): void;
    sendMessage(message: string): void;
}

export type Message = {
    senderId: string
    text: string
}

const AppContext = createContext<AppContextInterface | null>(null);
const port = 6090;

type Props = {
    children: React.ReactNode
}



export function AppContextProvider(props: Props) {
    const [clientId, setClientId] = useState(null);
    const [isConnectedToServer, setConnectedToServer] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);

    const connectToWsServer = useCallback(() => {
        if (!ws.current) {
            ws.current = new WebSocket(`ws://localhost:${port}`);
            setConnectedToServer(true);
            ws.current.addEventListener('message', (event) => {
                const { type, data } = JSON.parse(event.data);
                switch (type) {
                    case 'assign-id': {
                        setClientId(data);
                        console.log(`got id: ${data}`);
                        break;
                    }
                    case 'message': {
                        setReceivedMessages((oldMessages) => [...oldMessages, data]);
                        break;
                    }
                    default: {
                        throw new Error(`default message type reached: "${type}"`);
                    }
                }
            });
            ws.current.addEventListener('close', () => {
                console.log('ws connection closed');
                setConnectedToServer(false);
                setClientId(null);
                ws.current = null;
            });
        }
    }, []);

    const sendMessage = useCallback((message: string) => {
        if (ws.current) {
            ws.current.send(JSON.stringify({ type: 'message', data: message }));
        }
    }, []);

    useEffect(() => {
        connectToWsServer();
    }, [connectToWsServer]);


    return (
        <AppContext.Provider
            value={{
                clientId,
                isConnectedToServer,
                receivedMessages,
                connectToServer: connectToWsServer,
                sendMessage,
            }}
        >
            {props.children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext can only be used within an AppContextProvider');
    }
    return context;
}