import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../Providers/Socket";

interface RoomProps {
  localStream: MediaStream | undefined;
  remoteStream: MediaStream | undefined;
  connectionData: {};
}

const Room: React.FC<RoomProps> = ({
  localStream,
  remoteStream,
  connectionData,
}) => {
  const socketState = useSocket();

  useEffect(() => {
    socketState?.socket.on("createOffer", () => {
      console.log("creating offer.....");
    });
  }, [socketState?.socket]);

  return (
    <div className="w-screen flex items-center flex-col justify-center md:gap-20 gap-10 py-5 md:py-10">
      <h1 className="md:text-4xl text-2xl font-bold text-center">
        Welcome to Omegle Clone
      </h1>

      <h2 className="text-3xl font-bold">
        Connected {connectionData?.user1} & {connectionData?.user2}
      </h2>

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
          url={remoteStream}
          className="bg-black"
          width={window.screen.width > 600 ? 640 : 360}
          height={window.screen.width > 600 ? 360 : 201}
          playing
          muted
        />
      </section>
    </div>
  );
};

export default Room;
