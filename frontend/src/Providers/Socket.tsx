import React, { createContext, useContext, useEffect } from "react";
import { Socket, io } from "socket.io-client";

interface SocketContextProps {
  socket: Socket;
}

export interface ContextProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<ContextProviderProps> = (props) => {
  // const socket = useMemo(()=>{io("http://localhost:8000")},[])
  // const socket = io("https://localhost:8000")
  const socket = io(import.meta.env.VITE_SERVER_URL);

  useEffect(() => {
    socket.on("ErrorOccured", (error) => {
        console.log("error")
      alert(error);
    });

    return () => {
      socket.off("ErrorOccured");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {props.children}
    </SocketContext.Provider>
  );
};
