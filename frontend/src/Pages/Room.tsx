import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import Navbar from "../Components/Navbar";
import Chat from "../Components/Chat";
import Skeleton from "react-loading-skeleton";
import { useUser } from "../Providers/User";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { useSocket } from "../Providers/SocketProvider";

interface RoomProps {
  localStream: MediaStream | undefined;
  remoteStream: MediaStream | undefined;
  connectionData: {};
  joined: boolean;
}

interface MessageObj {
  msg: string;
  from: string;
}

const Room: React.FC<RoomProps> = ({
  localStream,
  remoteStream,
  connectionData,
  joined,
}) => {
  const socketState = useSocket();
  const userState = useUser();
  const [messages, setMessages] = useState<MessageObj[]>([]);

  const [openChat, setOpenChat] = useState(false);

  useEffect(() => {
    socketState?.socket.on("createOffer", () => {
      console.log("creating offer.....");
    });
  }, [socketState?.socket]);

  return (
    <div className="h-screen w-screen flex items-center flex-col">
      <Navbar />

      {window.screen.width < 600 && (
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
      )}

      <section className="w-full px-[4%] md:px-[10%] box-border flex md:flex-row flex-col items-center gap-10 h-full py-2">
        {/* players ---------------- */}
        <div className="h-full w-full flex flex-col items-center gap-5 justify-between max-h-full">
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

        {window.screen.width < 600 && (
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
        )}

        {/* Chat section ------------ */}
        {window.screen.width > 600 && (
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
        )}
      </section>
    </div>
  );
};

export default Room;
