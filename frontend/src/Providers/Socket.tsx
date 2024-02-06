import React, { createContext, useContext } from "react";
import { Socket, io } from "socket.io-client";

interface SocketContextProps{
    socket:Socket
}

export interface ContextProviderProps {
    children:React.ReactNode
}

const SocketContext = createContext<SocketContextProps | null>(null)

export const useSocket = () =>{
    return useContext(SocketContext)
}

export const SocketProvider:React.FC<ContextProviderProps> = (props) => {
    // const socket = useMemo(()=>{io("http://localhost:8000")},[])
    // const socket = io("https://localhost:8000")
    const socket = io("https://192.168.1.6:8000")

    return <SocketContext.Provider value={{socket}}>
        {props.children}
    </SocketContext.Provider>
}