import { useEffect, useState } from "react";
import Room from "./Room";
import { useRTCPeer } from "../Providers/RTCPeer";
import { useSocket } from "../Providers/SocketProvider";

const Wait = () => {
  const socketState = useSocket();
  const peerState = useRTCPeer();
  const [connectionData, setConnectionData] = useState<{
    name: string;
    roomId: string;
  } | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  const [joined, setJoined] = useState(false);

  const getLocalStream = async () => {
    const stream = await peerState?.getLocalStream();

    setLocalStream(stream);
  };

  // evs ---------
  useEffect(() => {
    socketState?.socket.on("ConnectionFound", (data) => {
      setConnectionData(data);
    });
    
    socketState?.socket.on("createOffer", async () => {
      console.log("creating offer.....");
      await getLocalStream();
      const offer = await peerState?.createOfferAndSetLocal();
      socketState.socket.emit("offerCreated", offer);
    });

    socketState?.socket.on("createAnswer", async (offer) => {
      await getLocalStream();
      await peerState?.setRemoteDescription(offer);
      const answer = await peerState?.createAnswerAndSetLocal();
      socketState.socket.emit("answerCreated", answer);

      setTimeout(() => {
        setJoined(true);
      }, 500);
    });

    socketState?.socket.on("answerResponse", async (answer) => {
      await peerState?.setRemoteDescription(answer);

      setTimeout(() => {
        setJoined(true);
      }, 500);
    });

    socketState?.socket.on("gotIceCandidate", async (data) => {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex:data.label,
        candidate:data.candidate
      })
      console.log("GOT Ice candidate from " + data?.from ,candidate)
      await peerState?.addPeerIceCandidate(candidate);
    });

    socketState?.socket.on("room-destroyed", () => {
      setConnectionData(null);
      setJoined(false);
      peerState?.setRemoteStream(undefined)
    });

    return () => {
      socketState?.socket.off("ConnectionFound");
      socketState?.socket.off("createOffer");
      socketState?.socket.off("room-destroyed");
      socketState?.socket.off("createAnswer");
      socketState?.socket.off("answerResponse");
    };
  }, [socketState?.socket]);


  return (
    <Room
      localStream={localStream}
      remoteStream={peerState?.remoteStream}
      connectionData={connectionData}
      joined={joined}
    />
  );
};

export default Wait;
