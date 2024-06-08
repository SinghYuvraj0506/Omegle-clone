import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Providers/User";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { useSocket } from "../Providers/SocketProvider";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const userState = useUser();
  const socketState = useSocket()
  const [data, setdata] = useState<string | undefined>();

  const handleConnect = (e: React.SyntheticEvent) => {
    e.preventDefault();
    socketState?.connectToSocket();
    socketState?.socket?.emit("userConnect",{username:data})
    // socket.on("GoToWaiting", () => {
    //   userState?.setUser(data);
      navigate("/lobby");
    // });
  };

  return (
    <div className="w-screen h-screen flex items-center overflow-hidden md:flex-row flex-col">
      <div className="w-full md:w-1/2 md:min-w-[50%] overflow-hidden h-full flex items-center absolute md:relative box-border">
        <img
          src="https://images.unsplash.com/photo-1413847394921-b259543f4872?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3RyYW5nZXJ8ZW58MHx8MHx8fDA%3D"
          alt=""
          className="w-full h-full absolute left-0 top-0 object-cover opacity-70"
        />

        <div className="text-white flex flex-col z-20 absolute md:top-[unset] top-5 left-5 md:w-3/4 w-full">
          <span className="md:text-[60px] text-[30px] font-bold md:leading-[60px] leading-[35px]">
            Every Stranger
            <br /> is a Friend
          </span>
          <span className="md:text-2xl text-[16px] text-[#b1b0b0]">
            & Every Conversation is a Memory
          </span>
          <p></p>
        </div>

        <div className="text-white absolute bottom-8 flex items-center justify-center gap-5 text-2xl md:text-3xl w-full">
          <AiFillInstagram className="cursor-pointer" onClick={()=>{window.open("https://www.instagram.com/ssinghyuvraj02/")}}/>
          <FaLinkedinIn className="cursor-pointer" onClick={()=>{window.open("https://www.linkedin.com/in/singh-yuvraj002/")}}/>
          <FaXTwitter className="cursor-pointer" onClick={()=>{window.open("https://twitter.com/Yuvrajsingh0506")}}/>
        </div>
      </div>

      <div className="flex items-center justify-center w-full h-full md:relative absolute">
        <form
          className="flex flex-col items-center justify-center gap-10 md:gap-14 md:w-1/2 w-3/4 p-5 md:p-0 md:bg-transparent bg-[#48484886] md:rounded-none rounded"
          onSubmit={handleConnect}
        >
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-white z-10 font-serif uppercase font-bold text-[35px] md:text-[70px] tracking-[10px] md:tracking-[25px]">
              TALKIE
            </h1>
            <span className="md:text-xl text-md text-[#b1b0b0] uppercase -my-3">
              {" "}
              By Yuvraj Singh
            </span>
          </div>
          <input
            type="text"
            placeholder="Enter Your Name"
            className="border p-3 w-full bg-[#161616]  md:text-lg text-sm border-none rounded text-[#cacbcb] outline-none"
            required
            value={data}
            onChange={(e) => {
              setdata(e.target.value);
            }}
          />
          <button
            type="submit"
            className="border md:text-lg text-sm md:w-2/5 w-3/4 py-3 rounded-[100px] bg-[#04a5a6] text-white border-none uppercase"
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
};

export default Landing;
