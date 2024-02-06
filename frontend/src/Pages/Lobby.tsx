import React, { useEffect, useMemo, useState } from "react";
import { useSocket } from "../Providers/Socket";
import ReactPlayer from "react-player";

const Lobby: React.FC = () => {
  const socketState = useSocket();

  const [newOffersFrom, setNewOffersFrom] = useState([]);

  const [localStream, setLocalStream] = useState<MediaStream | string>("");
  const [remoteStream, setRemoteStream] = useState<MediaStream | string>("");

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

  const fetchUserMedia = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        resolve(true);
      } catch (error) {
        console.log(error);
        alert("Error in opening your media devices");
        reject();
      }
    });
  };

  const createPeerConnection = async (offerObj?) => {
    return new Promise(async (resolve, reject) => {
      try {
        // create a rtcpeerconnection ---------------
        // PeerConnection = await new RTCPeerConnection(peerConfiguration);
        // setPeerConnection(connection);

        // add local trqack in the connection -----------
        localStream?.getTracks()?.forEach((e) => {
          PeerConnection?.addTrack(e, localStream);
        });

        PeerConnection.addEventListener("icecandidate", (e) => {
          console.log("........Ice candidate found!......");
          if (e.candidate) {
            socketState?.socket.emit("sendIceCandidateToSignalingServer", {
              iceCandidate: e.candidate,
              didIOffer: offerObj ? false : true,
            });
          }
        });

        PeerConnection?.addEventListener("track", (e) => {
          console.log("Got a track from the other peer!! How excting");
          setRemoteStream(e.streams[0]);
          console.log(e.streams[0]);
          console.log("Here's an exciting moment... fingers cross");
        });

        if (offerObj) {
          PeerConnection?.setRemoteDescription(offerObj?.offer);
        }

        resolve(true);
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  };

  const handleCall = async () => {
    // fetch user media ------------------
    // await fetchUserMedia();

    //peerConnection is all set with our STUN servers sent over
    await createPeerConnection();

    try {
      console.log("Creating Offer ....");
      const offer = await PeerConnection?.createOffer();
      console.log(offer);
      PeerConnection?.setLocalDescription(offer);
      if (offer) {
        socketState?.socket?.emit("newOffer", offer);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAnswer = async (index) => {
    // fetch user media ------------------
    // await fetchUserMedia();

    //peerConnection is all set with our STUN servers sent over
    await createPeerConnection(newOffersFrom[index]);

    try {
      const answer = await PeerConnection?.createAnswer();
      await PeerConnection?.setLocalDescription(answer);
      if (answer) {
        let updatedObj = newOffersFrom[index];
        updatedObj.answer = answer;
        const offerIceCandidates = await socketState?.socket.emitWithAck(
          "newanswer",
          updatedObj
        );
        offerIceCandidates.forEach((c) => {
          PeerConnection.addIceCandidate(c);
          console.log("======Added Ice Candidate======");
        });
        console.log(offerIceCandidates);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addAnswer = async (offerObj) => {
    //addAnswer is called in socketListeners when an answerResponse is emitted.
    //at this point, the offer and answer have been exchanged!
    //now CLIENT1 needs to set the remote
    try {
      await PeerConnection?.setRemoteDescription(offerObj?.answer);
      console.log("setted");
    } catch (error) {
      console.log(error);
    }
    // console.log(peerConnection.signalingState)
  };

  useEffect(() => {
    socketState?.socket.on("answerOffer", (offerData) => {
      setNewOffersFrom((prev) => {
        return [...prev, offerData];
      });
    });

    socketState?.socket.on("offerresponse", (offerObj) => {
      console.log("response", offerObj);
      addAnswer(offerObj);
    });

    socketState?.socket.on("receivedIceCandidateFromServer", (iceCandidate) => {
      PeerConnection.addIceCandidate(iceCandidate);
      console.log("======Added Ice Candidate======");
    });

    return () => {
      socketState?.socket.off("answerOffer");
      socketState?.socket.off("offerresponse");
    };
  }, [socketState?.socket]);

  // useEffect(() => {
  //   fetchUserMedia();
  // }, []);

  return (
    <div className="w-screen flex items-center flex-col justify-center md:gap-20 gap-10 py-5 md:py-10">
      <h1 className="md:text-4xl text-2xl font-bold text-center">Welcome to Omegle Clone</h1>

      <section className="flex gap-10 md:flex-row flex-col">
        <ReactPlayer url={localStream} className="bg-black" width={window.screen.width > 600 ? 640 : 360} height={window.screen.width > 600 ? 360 : 201} playing muted />
        <ReactPlayer url={remoteStream} className="bg-black"  width={window.screen.width > 600 ? 640 : 360} height={window.screen.width > 600 ? 360 : 201} playing />
      </section>

      <button
        className="border py-2 px-5 rounded bg-green-600 text-white text-lg"
        onClick={handleCall}
      >
        Call
      </button>

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
