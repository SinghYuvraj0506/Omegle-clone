import React, { createContext, useContext, useState } from "react";
import { Socket, io } from "socket.io-client";

export interface ContextProviderProps {
  children: React.ReactNode;
}

interface SocketContextProps {
  socket: Socket;
  connectToSocket: () => void;
  connectionState: boolean
}

export const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

const SocketProvider: React.FC<ContextProviderProps> = (props) => {
  const URL = import.meta.env.VITE_SERVER_URL as string;
  const socket = io(URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    withCredentials:true,
    extraHeaders: {
      "Content-Type": "application/json"
    }
  });

  const [connectionState, setConnectionState] = useState(false)

  const connectToSocket = () => {
    socket.connect()
    setConnectionState(false);
  };

  return (
    <SocketContext.Provider value={{ socket, connectToSocket , connectionState }}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
