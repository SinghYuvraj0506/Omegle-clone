import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../Providers/Socket";
import Navbar from "../Components/Navbar";
import Chat from "../Components/Chat";
import Skeleton from "react-loading-skeleton";

interface RoomProps {
  localStream: MediaStream | undefined;
  remoteStream: MediaStream | undefined;
  connectionData: {};
  joined: boolean;
}

const Room: React.FC<RoomProps> = ({
  localStream,
  remoteStream,
  connectionData,
  joined,
}) => {
  const socketState = useSocket();

  useEffect(() => {
    socketState?.socket.on("createOffer", () => {
      console.log("creating offer.....");
    });
  }, [socketState?.socket]);

  return (
    <div className="h-screen w-screen flex items-center flex-col">
      <Navbar />

      <section className="w-full px-[10%] box-border flex items-center gap-10 h-full py-2">
        {/* players ---------------- */}
        <div className="h-full w-full flex flex-col items-center gap-5 justify-between max-h-full">
          {remoteStream ? (
            <ReactPlayer
              url={remoteStream}
              className="bg-[#141414] rounded-lg overflow-hidden"
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

          {localStream ? (
            <ReactPlayer
              url={localStream}
              className="bg-[#141414] rounded-lg overflow-hidden"
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

        {/* Chat section ------------ */}
        <div className="min-w-[55%] h-full">
          <Chat connectionData={connectionData} joined={joined} />
        </div>
      </section>
    </div>
  );
};

export default Room;
