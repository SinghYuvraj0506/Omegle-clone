import React, { SetStateAction, useCallback, useEffect, useState } from "react";
import { useSocket } from "../Providers/Socket";
import ReactPlayer from "react-player";
import { useRTCPeer } from "../Providers/RTCPeer";


const Lobby: React.FC = () => {
  const socketState = useSocket();
  const peerState = useRTCPeer()
  const [connectionData, setConnectionData] = useState<{
    name: string;
    roomId: string;
  } | null>(null);

  const [newOffersFrom, setNewOffersFrom] = useState([]);

  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  const handleCall = async () => {
    try {
      // 1. getStream fetched
      // 2. stream added in the peerconnection

      //3. create Offer and set Local description -----------
      const offer = await peerState?.createOfferAndSetLocal();
      if (offer) {
        socketState?.socket?.emit("offer", { offer, roomId: connectionData?.roomId });
        return;
      }
      // setWaitPage(false);
    } catch (error) {
      console.log(error);
      alert("Error in setting the call offer");
    }
  };

  const handleAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      console.log("creating anser");
      // 1. getStream fetched
      // 2. stream added in the peerconnection

      if (!offer) {
        throw new Error("Offer not found ---------");
      }

      // 3. set remote description the offer that has been sent --------
      await peerState?.setRemoteDescription(offer);

      // 4. creating answer and adding in local
      const answer = await peerState?.createAnswerAndSetLocal();

      // if (answer) {
      //   let updatedObj = newOffersFrom[index];
      //   updatedObj.answer = answer;
      //   const offerIceCandidates = await socketState?.socket.emitWithAck(
      //     "newanswer",
      //     updatedObj
      //   );
      //   offerIceCandidates.forEach(async (c) => {
      //     await peerState?.addPeerIceCandidate(c);
      //   });
      // }

      socketState?.socket.emit("answer", {
        answer,
        roomId: connectionData?.roomId,
      });
    } catch (error) {
      console.log(error);
      alert("Error in setting the call offer");
    }
  }, []);

  const addAnswerTypeForCaller = useCallback(
    async (offerObj) => {
      try {
        await peerState?.setRemoteDescription(offerObj?.answer);
      } catch (error) {
        console.log(error);
      }
    },
    [peerState]
  );

  const addOfferToScreen = useCallback((offerData) => {
    setNewOffersFrom((prev) => {
      return [...prev, offerData];
    });
  }, []);


  useEffect(() => {
    // show all the answers --------------------
    socketState?.socket.on("answerOffer", addOfferToScreen);

    // response to the answer ------
    socketState?.socket.on("offerresponse", addAnswerTypeForCaller);

    socketState?.socket.on("receivedIceCandidateFromServer", (iceCandidate) =>
      peerState?.addPeerIceCandidate(iceCandidate)
    );

    socketState?.socket.on("sendAnswer", handleAnswer);

     // now create an offer -------------------------
     socketState?.socket.on("FoundConnectionCreateOffer", (data) => {
      setConnectionData({ name: data?.name, roomId: data?.roomId });
    //   peerState?.getLocalStream().then((e) => {
    //    setLocalStream(e);
    //  });
    });

     // now create an answer -------------------------
     socketState?.socket.on("FoundConnectionCreateAnswer", (data) => {
       setConnectionData({ name: data?.name, roomId: data?.roomId });
       peerState?.getLocalStream().then((e) => {
        setLocalStream(e);
      });
     });

    return () => {
      socketState?.socket.off("answerOffer", addOfferToScreen);
      socketState?.socket.off("offerresponse", addAnswerTypeForCaller);
      socketState?.socket.off(
        "receivedIceCandidateFromServer",
        (iceCandidate) => peerState?.addPeerIceCandidate(iceCandidate)
      );
      socketState?.socket.off("sendAnswer");
      socketState?.socket.off("FoundConnectionCreateOffer");
       socketState?.socket.off("FoundConnectionCreateAnswer");
    };
  }, [
    socketState?.socket,
    addOfferToScreen,
    addAnswerTypeForCaller,
    peerState?.addPeerIceCandidate,
    handleAnswer
  ]);




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
        <h1 className="text-3xl font-bold">
          Connecting you to {connectionData?.name}
        </h1>
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
        <ReactPlayer
          // url={peerState?.remoteStream}
          className="bg-black"
          width={window.screen.width > 600 ? 640 : 360}
          height={window.screen.width > 600 ? 360 : 201}
          playing
        />
      </section>

      {/* <button
        className="border py-2 px-5 rounded bg-green-600 text-white text-lg"
        onClick={handleCall}
      >
        Call
      </button> */}

      <div className="flex gap-4 flex-wrap">
        {newOffersFrom?.map((e, index) => {
          return (
            <button
              className="border py-2 px-5 rounded bg-blue-600 text-white text-lg animate-pulse"
              onClick={() => handleAnswer(index)}
            >
              Answer Call from {e?.offererUserName ?? "Unknown"}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Lobby;
