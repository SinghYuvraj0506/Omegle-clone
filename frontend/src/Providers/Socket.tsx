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
  const socket = io("http://ec2-65-1-148-114.ap-south-1.compute.amazonaws.com:8000");

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
