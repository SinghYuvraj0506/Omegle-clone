import React, { useEffect, useState } from "react";
import { useSocket } from "../Providers/Socket";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Providers/User";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const socketState = useSocket();
  const userState = useUser();
  const [data, setdata] = useState<string | undefined>();

  const handleConnect = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("Connecting .......");
    socketState?.socket?.emit("user-connect", data);
    socketState?.socket.on("GoToWaiting", () => {
      userState?.setUser(data);
      navigate("/lobby");
    });
  };

  return (
    <div className="w-screen h-screen flex items-center overflow-hidden">
      <div className="w-1/2 min-w-[50%] overflow-hidden h-full relative flex items-center">
        <img
          src="https://images.unsplash.com/photo-1413847394921-b259543f4872?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3RyYW5nZXJ8ZW58MHx8MHx8fDA%3D"
          alt=""
          className="w-full h-full absolute left-0 top-0 object-cover opacity-70"
        />

        <div className="text-white flex flex-col z-20 absolute left-5 w-3/4">
          <span className="text-[60px] font-bold leading-[60px]">
            Every Stranger
            <br /> is a Friend
          </span>
          <span className="text-2xl text-[#b1b0b0]">
            & Every Conversation is a Memory
          </span>
          <p></p>
        </div>

        <div className="text-white absolute bottom-8 flex items-center justify-center gap-5 text-3xl w-full">
          <AiFillInstagram className="cursor-pointer" onClick={()=>{window.open("https://www.instagram.com/ssinghyuvraj02/")}}/>
          <FaLinkedinIn className="cursor-pointer" onClick={()=>{window.open("https://www.linkedin.com/in/singh-yuvraj002/")}}/>
          <FaXTwitter className="cursor-pointer" onClick={()=>{window.open("https://twitter.com/Yuvrajsingh0506")}}/>
        </div>
      </div>

      <div className="flex items-center justify-center w-full">
        <form
          className="flex flex-col items-center gap-14 w-1/2"
          onSubmit={handleConnect}
        >
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-white z-10 font-serif uppercase font-bold text-[70px] tracking-[25px]">
              TALKIE
            </h1>
            <span className="text-xl text-[#b1b0b0] uppercase -my-3">
              {" "}
              By Yuvraj Singh
            </span>
          </div>
          <input
            type="text"
            placeholder="Enter Your Name"
            className="border p-3 w-full bg-[#161616] border-none rounded text-[#cacbcb] outline-none"
            required
            value={data}
            onChange={(e) => {
              setdata(e.target.value);
            }}
          />
          <button
            type="submit"
            className="border text-lg w-2/5 py-3 rounded-[100px] bg-[#04a5a6] text-white border-none uppercase"
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
};

export default Landing;
