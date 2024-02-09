import React, { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useSocket } from "../Providers/Socket";

const ChatFooter: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const [data, setdata] = useState<string | undefined>();

  const socketState = useSocket();

  const handleSend = () => {
    if (data && data?.length > 0) {
      socketState?.socket.emit("sendNewMessage", data);
      setdata("");
    }
  };

  return (
    <div className="w-full h-full flex items-center gap-2">
      <button
        className="bg-[#262629] h-full text-[#cacacb] px-10 rounded-lg hover:bg-[#2f2f33]"
        disabled={disabled}
      >
        Stop
      </button>

      <div className="bg-[#262629] h-full text-[#cacacb] flex items-center relative w-full rounded-lg">
        <input
          type="text"
          placeholder="Type your message...."
          className="bg-transparent w-full focus:outline-none px-3 box-border"
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

interface MessageObj {
  msg: string;
  from: string;
}

const MessageBox: React.FC<MessageProps> = ({ text, isUser }) => {
  if (isUser) {
    return (
      <div className="w-full flex flex-row-reverse">
        <div className="bg-[#1f8efd] max-w-[70%] w-max rounded-tl-lg rounded-tr-lg rounded-bl-lg p-2 box-border">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex">
      <div className="bg-[#262629] max-w-[70%] w-max rounded-tl-lg rounded-tr-lg rounded-br-lg p-2 box-border">
        {text}
      </div>
    </div>
  );
};

const Chat = ({ connectionData, joined }) => {
  const [messages, setMessages] = useState<MessageObj[]>([]);
  const socketState = useSocket();

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


  return (
    <div className="w-full h-full bg-[#141414] rounded-lg p-4 box-border flex flex-col items-center gap-3">
      <div className=" min-h-[90%] h-[90%] w-full overflow-auto text-[#cacacb] flex gap-3 flex-col">
        <h1 className="text-xl font-bold">
          {joined
            ? `Connected ${
                connectionData?.user1 + " & " + connectionData?.user2
              }....`
            : connectionData
            ? "Connecting Please Wait...."
            : "Please wait while we connect you with someone.."}
        </h1>

        {messages?.map((e) => {
          return <MessageBox text={e.msg} isUser={true} />;
        })}
      </div>
      <ChatFooter disabled={!joined} />
    </div>
  );
};

export default Chat;
