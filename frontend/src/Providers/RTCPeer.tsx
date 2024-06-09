import {
  SetStateAction,
  createContext,
  useCallback,
  useContext,
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
  setRemoteStream: React.Dispatch<SetStateAction<MediaStream | undefined>>;
  setIsOfferer: React.Dispatch<SetStateAction<boolean>>;
}

const RTCPeerContext = createContext<SocketContextProps | null>(null);

export const useRTCPeer = () => {
  return useContext(RTCPeerContext);
};

export const RTCPeerProvider: React.FC<ContextProviderProps> = (props) => {
  const socketState = useSocket();

  let iceServers:[] = null

  // Define your Twilio credentials
  const TWILIO_ACCOUNT_SID = "AC0086449a558461d5e4b7f0d1582247b1";
  const TWILIO_AUTH_TOKEN = "34e203ec897c19fe42f2d96ec097e5a9";

  // Encode the credentials for basic authentication
  const basicAuth =
    "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  // Define the URL for the POST request
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Tokens.json`;

  // Make the fetch request
  fetch(url, {
    method: "POST",
    headers: {
      Authorization: basicAuth,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      iceServers = data?.ice_servers
      console.log(data?.ice_servers)
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const PeerConnection: RTCPeerConnection = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: iceServers ?? [
          {
            urls: "stun:stun1.l.google.com:19302",
          },
          {
            urls: "stun:stun2.l.google.com:19302",
          },
          // {
          //   urls: "stun:stun.relay.metered.ca:80",
          // },
          // {
          //   urls: "turn:global.relay.metered.ca:80",
          //   username: "6df56743128197bc323aec86",
          //   credential: "eVNvLHeZ26dtNiN6",
          // },
          // {
          //   urls: "turn:global.relay.metered.ca:80?transport=tcp",
          //   username: "6df56743128197bc323aec86",
          //   credential: "eVNvLHeZ26dtNiN6",
          // },
          // {
          //   urls: "turn:global.relay.metered.ca:443",
          //   username: "6df56743128197bc323aec86",
          //   credential: "eVNvLHeZ26dtNiN6",
          // },
          // {
          //   urls: "turns:global.relay.metered.ca:443?transport=tcp",
          //   username: "6df56743128197bc323aec86",
          //   credential: "eVNvLHeZ26dtNiN6",
          // },
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

  const addPeerIceCandidate = async (candidate: RTCIceCandidate) => {
    console.log("======Added Peer Ice Candidate======");
    await PeerConnection.addIceCandidate(candidate);
  };

  const addTrackToRemoteStream = useCallback((e: RTCTrackEvent) => {
    setRemoteStream(e?.streams[0]);
  }, []);

  const getMyIceCandidate = useCallback((e: RTCPeerConnectionIceEvent) => {
    console.log("........My Ice candidate found!......");
    if (e.candidate) {
      socketState?.socket.emit("sendIceCandidate", {
        type: "candidate",
        label: e.candidate.sdpMLineIndex,
        id: e.candidate.sdpMid,
        candidate: e.candidate.candidate,
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
        setRemoteStream,
      }}
    >
      {props?.children}
    </RTCPeerContext.Provider>
  );
};
