import { createContext, useMemo } from "react";
import { ContextProviderProps } from "./Socket";

interface SocketContextProps{
    PeerConnection:RTCPeerConnection
}


const RTCPeerContext = createContext<SocketContextProps | null>(null)

export const RTCPeerProvider:React.FC<ContextProviderProps> = (props) =>{
    const PeerConnection: RTCPeerConnection = useMemo(
        () =>
          new RTCPeerConnection({
            iceServers: [
              {
                urls: [
                  "stun:stun.l.google.com:19302",
                  "stun:stun1.l.google.com:19302",
                ],
              },
            ],
          }),
        []
      );

    return <RTCPeerContext.Provider value={{PeerConnection}}>
        {props?.children}
    </RTCPeerContext.Provider>
}