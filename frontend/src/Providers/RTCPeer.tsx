import {
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ContextProviderProps, useSocket } from "./SocketProvider";

interface SocketContextProps {
  PeerConnection: RTCPeerConnection;
  createOfferAndSetLocal: () => Promise<RTCSessionDescriptionInit | undefined>;
  createAnswerAndSetLocal: () => Promise<RTCSessionDescriptionInit | undefined>;
  getLocalStream: () => Promise<MediaStream | undefined>;
  setRemoteDescription: (data: any) => Promise<void>;
  addPeerIceCandidate: (candidate: any) => Promise<void>;
  remoteStream: MediaStream | undefined;
  setRemoteStream:React.Dispatch<SetStateAction<MediaStream | undefined>>;
  setIsOfferer: React.Dispatch<SetStateAction<boolean>>;
}

const RTCPeerContext = createContext<SocketContextProps | null>(null);

export const useRTCPeer = () => {
  return useContext(RTCPeerContext);
};

export const RTCPeerProvider: React.FC<ContextProviderProps> = (props) => {
  const socketState = useSocket();

  const PeerConnection: RTCPeerConnection = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun.l.google.com:19302",
"stun1.l.google.com:19302",
"stun2.l.google.com:19302",
"stun3.l.google.com:19302",
"stun4.l.google.com:19302",
"stun01.sipphone.com",
"stun.ekiga.net",
"stun.fwdnet.net",
"stun.ideasip.com",
"stun.iptel.org",
"stun.rixtelecom.se",
"stun.schlund.de",
"stunserver.org",
"stun.softjoys.com",
"stun.voiparound.com",
"stun.voipbuster.com",
"stun.voipstunt.com",
"stun.voxgratia.org",
"stun.xten.com"
            ],
          },
        ],
      }),
    []
  );

  const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>();

  const [isOfferer, setIsOfferer] = useState(true);

  const createOfferAndSetLocal = async () => {
    try {
      const offer = await PeerConnection.createOffer();

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

  const addPeerIceCandidate = (async (candidate:RTCIceCandidate) => {
      console.log("======Added Peer Ice Candidate======");
      await PeerConnection.addIceCandidate(candidate);
    }
  );

  const addTrackToRemoteStream = useCallback((e: RTCTrackEvent) => {
    setRemoteStream(e?.streams[0]);
  }, []);

  const getMyIceCandidate = useCallback((e: RTCPeerConnectionIceEvent) => {
    console.log("........My Ice candidate found!......");
    if (e.candidate) {
      socketState?.socket.emit("sendIceCandidate", {
        type:"candidate",
        label:e.candidate.sdpMLineIndex,
        id:e.candidate.sdpMid,
        candidate:e.candidate.candidate
      });
    }
  }, []);

  // useEffect(() => {
  //   PeerConnection.addEventListener("track", addTrackToRemoteStream);
  //   PeerConnection.addEventListener("icecandidate", getMyIceCandidate);

  //   return () => {
  //     PeerConnection.removeEventListener("track", addTrackToRemoteStream);
  //     PeerConnection.removeEventListener("icecandidate", getMyIceCandidate);
  //   };
  // }, [PeerConnection, addTrackToRemoteStream, getMyIceCandidate]);

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
        setIsOfferer,
        setRemoteStream
      }}
    >
      {props?.children}
    </RTCPeerContext.Provider>
  );
};
