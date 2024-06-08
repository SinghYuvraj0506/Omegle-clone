import React, {
  useEffect,
  useState,
} from "react";
import ReactPlayer from "react-player";
import { useRTCPeer } from "../Providers/RTCPeer";
import { useSocket } from "../Providers/SocketProvider";
import Navbar from "../Components/Navbar";
import Skeleton from "react-loading-skeleton";

const Lobby: React.FC = () => {
  const socketState = useSocket();
  const peerState = useRTCPeer();

  const [localStream, setlocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setremoteStream] = useState<MediaStream | null>(null);
  let remoteUser:string | null = null;

  const getStramAndCreateOffer = async (reciever) => {
    const stream = await peerState?.getLocalStream();
    setlocalStream(stream as MediaStream);
    const offer = await peerState?.createOfferAndSetLocal();
    socketState?.socket?.emit("offerSent", {
      sender: socketState?.socket?.id,
      reciever: reciever,
      offer: offer,
    });
  };

  const getStramAndCreateAnswer = async (data: any) => {
    const stream = await peerState?.getLocalStream();
    setlocalStream(stream as MediaStream);

    await peerState?.setRemoteDescription(data?.offer);
    const answer = await peerState?.createAnswerAndSetLocal();

    socketState?.socket?.emit("answerCreated", {
      sender: socketState?.socket?.id,
      reciever: data?.sender,
      answer: answer,
    });
  };

  useEffect(() => {
    function setRemoteUser(id: string) {
      remoteUser = id;
      getStramAndCreateOffer(id);
    }

    function reciveOffer(data: any) {
      remoteUser = data?.sender;
      getStramAndCreateAnswer(data);
    }

    async function reciveAnswer(data: any) {
      await peerState?.setRemoteDescription(data);
    }

    async function setIceCandidate(data:any) {
      await peerState?.addPeerIceCandidate(data)
    }

    socketState?.socket.on("new-user-joined", setRemoteUser);
    socketState?.socket.on("RecieveOffer", reciveOffer);
    socketState?.socket.on("RecieveAnswer", reciveAnswer);
    socketState?.socket?.on("SetPeerIce",setIceCandidate)

    return () => {
      socketState?.socket.off("new-user-joined", setRemoteUser);
      socketState?.socket.off("RecieveOffer", reciveOffer);
      socketState?.socket.off("RecieveAnswer", reciveAnswer);
      socketState?.socket?.off("SetPeerIce",setIceCandidate)
    };
  }, []);

  useEffect(() => {
    const addTrackToRemoteStream = (e: RTCTrackEvent) => {
      setremoteStream(e?.streams[0]);
    };

    const getMyIceCandidate = ((e: RTCPeerConnectionIceEvent) => {
      if (e.candidate) {
        socketState?.socket.emit("sendIceCandidate", {
          sender: socketState?.socket?.id,
          reciever: remoteUser,
          iceCandidateData: e.candidate,
        });
      }
    });

    peerState?.PeerConnection.addEventListener("track", addTrackToRemoteStream);
    peerState?.PeerConnection.addEventListener(
      "icecandidate",
      getMyIceCandidate
    );

    return () => {
      peerState?.PeerConnection.removeEventListener(
        "track",
        addTrackToRemoteStream
      );
      peerState?.PeerConnection.removeEventListener(
        "icecandidate",
        getMyIceCandidate
      );
    };
  }, []);

  return (
    <div className="h-screen w-screen flex items-center flex-col">
      <Navbar />

      {/* {window.screen.width < 600 && (
        <h1 className="text-xl w-full px-[4%] box-border font-bold text-white my-2">
          {joined
            ? `Connected to ${
                userState?.user === connectionData?.user1
                  ? connectionData?.user2
                  : connectionData?.user1
              }`
            : connectionData
            ? "Connecting Please Wait...."
            : "Please wait while we connect you with someone.."}
        </h1>
      )} */}

      <section className="w-full px-[4%] md:px-[10%] box-border flex md:flex-row flex-col items-center gap-10 h-full py-2">
        {/* players ---------------- */}
        <div className="h-full w-1/2 flex flex-col items-center gap-5 justify-between max-h-full">
          {remoteStream ? (
            <ReactPlayer
              url={remoteStream}
              className="bg-[#141414] rounded md:rounded-lg overflow-hidden"
              width={"100%"}
              height={"100%"}
              playing
            />
          ) : (
            <div className="w-full h-full">
              <Skeleton />
            </div>
          )}

          {localStream ? (
            <ReactPlayer
              url={localStream}
              className="bg-[#141414] rounded md:rounded-lg  overflow-hidden"
              width={"100%"}
              height={"100%"}
              playing
              muted
            />
          ) : (
            <div className="w-full h-full">
              <Skeleton />
            </div>
          )}
        </div>

        {/* {window.screen.width < 600 && (
          <>
            <IoChatbubbleEllipses
              onClick={() => {
                setOpenChat(!openChat);
              }}
              color="#04a5a6"
              size={30}
              className="absolute right-5 bottom-5"
            />

           {!openChat && <button
              className="bg-[#262629] text-[#cacacb] py-2 px-5 text-xs rounded-lg hover:bg-[#2f2f33] absolute left-5 bottom-5"
              disabled={!joined}
            >
              Stop
            </button>}
          </>
        )} */}

        {/* Chat section ------------ */}
        {/* {window.screen.width > 600 && (
          <div className="min-w-[55%] h-full">
            <Chat
              connectionData={connectionData}
              joined={joined}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        )}

        {openChat && (
          <div className="w-screen h-3/4 fixed bottom-0 left-0 bg-[">
            <Chat
              connectionData={connectionData}
              joined={joined}
              onClose={() => {
                setOpenChat(false);
              }}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        )} */}
      </section>
    </div>
  );
};

export default Lobby;
