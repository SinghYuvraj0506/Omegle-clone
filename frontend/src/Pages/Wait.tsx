import React, { useEffect, useState } from "react";
import { useSocket } from "../Providers/Socket";
import ReactPlayer from "react-player";
import Room from "./Room";
import { useRTCPeer } from "../Providers/RTCPeer";

const Wait = () => {
  const socketState = useSocket();
  const peerState = useRTCPeer()
  const [connectionData, setConnectionData] = useState<{
    name: string;
    roomId: string;
  } | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  const [joined, setJoined] = useState(false);

  // evs ---------
  useEffect(() => {
    socketState?.socket.on("ConnectionFound", (data) => {
      setConnectionData(data);
    });

    socketState?.socket.on("createOffer", async () => {
      console.log("creating offer.....");
      const offer = await peerState?.createOfferAndSetLocal()
      socketState.socket.emit("offerCreated",offer)
    });

    socketState?.socket.on("createAnswer", async (offer) => {
      await peerState?.setRemoteDescription(offer)
      const answer = await peerState?.createAnswerAndSetLocal()
      socketState.socket.emit("answerCreated",answer)

      setTimeout(() => {
        setJoined(true)
      }, 500);
    });

    socketState?.socket.on("answerResponse", async (answer) => {
      await peerState?.setRemoteDescription(answer)

      setTimeout(() => {
        setJoined(true)
      }, 500);
    });

    socketState?.socket.on("gotIceCandidate", async (iceCandidate) => {
     await peerState?.addPeerIceCandidate(iceCandidate)
    });

    socketState?.socket.on("room-destroyed", () => {
      setConnectionData(null);
      setJoined(false)
    });

    return () => {
      socketState?.socket.off("ConnectionFound")
      socketState?.socket.off("createOffer")
      socketState?.socket.off("room-destroyed")
      socketState?.socket.off("createAnswer")
      socketState?.socket.off("answerResponse")
    }

  }, [socketState?.socket])
  

  const getLocalStream = async () => {
    const stream = await peerState?.getLocalStream()

    setLocalStream(stream);
  };

  useEffect(() => {
    getLocalStream();
  }, []);

  if (!joined) {
    return (
      <div className="w-screen flex items-center flex-col justify-center md:gap-20 gap-10 py-5 md:py-10">
        <h1 className="md:text-4xl text-2xl font-bold text-center">
          Welcome to Omegle Clone
        </h1>

        {!connectionData ? (
          <h1 className="text-3xl font-bold">
            Please wait while we connect you with someone
          </h1>
        ) : (
          <h1 className="text-3xl font-bold">Connecting ...</h1>
        )}

        <section className="flex gap-10 md:flex-row flex-col">
          <ReactPlayer
            url={localStream}
            className="bg-black"
            width={window.screen.width > 600 ? 640 : 360}
            height={window.screen.width > 600 ? 360 : 201}
            playing
            muted
          />
        </section>
      </div>
    );
  }

  return <Room localStream={localStream} remoteStream={peerState?.remoteStream} connectionData={connectionData}/>
};

export default Wait;
