import React, { useEffect, useState } from "react";
import { useSocket } from "../Providers/Socket";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
    const navigate = useNavigate()
    const socketState = useSocket()
    const [data, setdata] = useState<string|undefined>()

    const handleConnect= (e:React.SyntheticEvent) =>{
        e.preventDefault()
        console.log("Connecting .......")
        socketState?.socket?.emit("addUser",data)
        navigate("/lobby")
    }

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="border border-black rounded p-5 flex flex-col items-center gap-10">
        <h1 className="font-bold text-4xl text-center">
          Welcome to Omegle <br/><span className="text-xl text-[#373636]"> Created by Yuvraj Singh</span>
        </h1>

        <form className="flex flex-col items-center gap-5 w-9/12" onSubmit={handleConnect}>
          <input
            type="text"
            placeholder="Enter Your Name"
            className="border p-3 w-full"
            required
            value={data}
            onChange={(e)=>{
                setdata(e.target.value)
            }}
          />
          <button type="submit" className="border px-5 py-3 rounded bg-black text-white">Connect</button>
        </form>
      </div>
    </div>
  );
};

export default Landing;
