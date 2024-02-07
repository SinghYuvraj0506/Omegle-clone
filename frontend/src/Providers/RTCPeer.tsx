import {
    SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ContextProviderProps, useSocket } from "./Socket";

interface SocketContextProps {
  PeerConnection: RTCPeerConnection;
  createOfferAndSetLocal: () => Promise<RTCSessionDescriptionInit | undefined>;
  createAnswerAndSetLocal: () => Promise<RTCSessionDescriptionInit | undefined>;
  getLocalStream: () => Promise<MediaStream | undefined>;
  setRemoteDescription: (data: any) => Promise<void>;
  addPeerIceCandidate: (candidate:any) => Promise<void>
  remoteStream:MediaStream | undefined
  setIsOfferer:React.Dispatch<SetStateAction<boolean>>

}

const RTCPeerContext = createContext<SocketContextProps | null>(null);

export const useRTCPeer = () =>{
    return useContext(RTCPeerContext)
}

export const RTCPeerProvider: React.FC<ContextProviderProps> = (props) => {
    const socketState = useSocket()
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

  const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>();

  const [isOfferer, setIsOfferer] = useState(true)

  const createOfferAndSetLocal = async () => {
    try {
      console.log("Creating Offer ....");
      const offer = await PeerConnection.createOffer();

      console.log("Setting Local Description .........");
      await PeerConnection.setLocalDescription(offer);

      return offer;
    } catch (error) {
      console.log(error);
    }
  };

  const createAnswerAndSetLocal = async () => {
    try {
      console.log("Creating answer ............");
      const answer = await PeerConnection?.createAnswer();

      console.log("Setting Local Description .........");
      await PeerConnection.setLocalDescription(answer);

      return answer;
    } catch (error) {
      console.log(error);
    }
  };

  const getLocalStream = async () => {
    try {
      console.log("Fetching the local stream");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      //  adding tracks in peerconnection ------------------------
      stream.getTracks().forEach((e) => {
        PeerConnection.addTrack(e, stream);
      });

      return stream;
    } catch (error) {
      alert("Error in opening your media devices");
    }
  };

  const setRemoteDescription = async (data) => {
    console.log("Setting Remote Desctiption ...............");
    await PeerConnection?.setRemoteDescription(data);
  };

  const addPeerIceCandidate = useCallback(
    async (candidate) =>{
        console.log("======Added Peer Ice Candidate======");
        await PeerConnection.addIceCandidate(candidate)
      },
    [PeerConnection],
  )
  
  const addTrackToRemoteStream = useCallback((e: RTCTrackEvent) => {
    // setting the remote stream --------------------
    console.log("Got the peer track")
    setRemoteStream(e?.streams[0]);
  }, []);


  const getMyIceCandidate = useCallback((e: RTCPeerConnectionIceEvent) => {
    console.log("........My Ice candidate found!......");
    if (e.candidate) {
        socketState?.socket.emit("sendIceCandidate", e.candidate);
      }
  }, []);


  useEffect(() => {
    PeerConnection.addEventListener("track", addTrackToRemoteStream);
    PeerConnection.addEventListener("icecandidate", getMyIceCandidate);

    return () => {
      PeerConnection.removeEventListener("track", addTrackToRemoteStream);
      PeerConnection.removeEventListener("icecandidate", getMyIceCandidate);
    };
  }, [PeerConnection,addTrackToRemoteStream,getMyIceCandidate]);


  return (
    <RTCPeerContext.Provider
      value={{
        PeerConnection,
        createOfferAndSetLocal,
        createAnswerAndSetLocal,
        getLocalStream,
        setRemoteDescription,
        addPeerIceCandidate,
        remoteStream,
        setIsOfferer
      }}
    >
      {props?.children}
    </RTCPeerContext.Provider>
  );
};
