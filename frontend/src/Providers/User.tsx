import React, { createContext, useContext, useState } from "react";
import { Socket } from "socket.io-client";
import { ContextProviderProps } from "./Socket";

interface SocketContextProps {
  socket: Socket;
}

const UserContext = createContext<SocketContextProps | null>(null);

export const useUser = () => {
  return useContext(UserContext);
};

// export const UserProvider: React.FC<ContextProviderProps> = (props) => {

//     const [user, setUser] = useState()

//     return <UserContext.Provider value={{}}>

//     </UserContext.Provider>


// }