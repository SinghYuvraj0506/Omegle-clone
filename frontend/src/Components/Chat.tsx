import React, { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useUser } from "../Providers/User";
import { CiCircleRemove } from "react-icons/ci";

const ChatFooter: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const [data, setdata] = useState<string | undefined>();

  const handleSend = () => {
    if (data && data?.length > 0) {
      socketState?.socket.emit("sendNewMessage", data);
      setdata("");
    }
  };

  return (
    <div className="w-full h-full flex items-center gap-2 text-xs md:text-lg">
     <button
        className="bg-[#262629] h-full text-[#cacacb] px-5 md:px-10 rounded-lg hover:bg-[#2f2f33]"
        disabled={disabled}
      >
        Stop
      </button>

      <div className="bg-[#262629] h-full text-[#cacacb] flex items-center relative w-full rounded-lg">
        <input
          type="text"
          placeholder="Type your message...."
          className="bg-transparent w-5/6 focus:outline-none px-3 box-border "
          onChange={(e) => {
            setdata(e.target.value);
          }}
          value={data}
          disabled={disabled}
        />
        <IoSend
          className="absolute right-3 cursor-pointer"
          color="#1f8efd"
          size={20}
          onClick={handleSend}
        />
      </div>
    </div>
  );
};

interface MessageProps {
  text: string;
  isUser: boolean;
}

const MessageBox: React.FC<MessageProps> = ({ text, isUser }) => {
  if (isUser) {
    return (
      <div className="w-full flex flex-row-reverse">
        <div className="bg-[#1f8efd] max-w-[70%] w-max rounded-tl-lg rounded-tr-lg rounded-bl-lg md:p-2 p-1 box-border text-sm md:text-lg">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex">
      <div className="bg-[#262629] max-w-[70%] w-max rounded-tl-lg rounded-tr-lg rounded-br-lg md:p-2 p-1 box-border text-sm md:text-lg">
        {text}
      </div>
    </div>
  );
};

const Chat = ({ connectionData, joined,onClose,messages, setMessages }) => {
  const socketState = useSocket();
  const userState = useUser()

  useEffect(() => {
    socketState?.socket.on("gotNewMessage", (data) => {
      setMessages(prev=>{
        return [...prev,{...data}]
      })
    });

    return () => {
      socketState?.socket.off("gotNewMessage");
    };
  }, [socketState?.socket]);


  useEffect(() => {
    const docu = document.getElementById("messageSection")
      if(docu){
        docu.scrollTop = docu.scrollHeight + 100
      }
  }, [messages])
  

  return (
    <div className="w-full h-full md:bg-[#141414] bg-[#3c3c3cad] rounded-lg md:p-4 pt-10 p-5 box-border flex flex-col items-center gap-3">
      <div className=" min-h-[90%] h-[90%] w-full overflow-auto text-[#cacacb] flex gap-3 flex-col" id="messageSection">
      {window.screen.width < 600 && <CiCircleRemove size={26}  className="absolute right-2 top-1" onClick={onClose}/>}
       {window.screen.width > 600 && <h1 className="text-xl font-bold">
          {joined
            ? `Connected to ${
                userState?.user === connectionData?.user1 ? connectionData?.user2 : connectionData?.user1
              }`
            : connectionData
            ? "Connecting Please Wait...."
            : "Please wait while we connect you with someone.."}
        </h1>}

        {messages?.map((e) => {
            return <MessageBox text={e.msg} isUser={e.from === userState?.user} />;
        })}
      </div>
      <ChatFooter disabled={!joined} />
    </div>
  );
};

export default Chat;
