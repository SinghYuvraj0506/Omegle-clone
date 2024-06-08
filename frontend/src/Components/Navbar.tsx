import React from "react";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const Navbar = () => {
  return (
    <div className="w-screen px-[4vw] md:px-[10vw] box-border flex items-center justify-between py-5 border-b bg-black border-b-[#181819] sticky top-0">
      <h1 className="text-white z-10 font-sans uppercase font-bold text-2xl md:text-4xl tracking-[5px] cursor-pointer" onClick={()=>{window.open("/","_self")}}>
        TALKIE
      </h1>

      <div className="text-white flex items-center justify-center gap-5 text-2xl ">
        <AiFillInstagram
          className="cursor-pointer"
          onClick={() => {
            window.open("https://www.instagram.com/ssinghyuvraj02/");
          }}
        />
        <FaLinkedinIn
          className="cursor-pointer"
          onClick={() => {
            window.open("https://www.linkedin.com/in/singh-yuvraj002/");
          }}
        />
        <FaXTwitter
          className="cursor-pointer"
          onClick={() => {
            window.open("https://twitter.com/Yuvrajsingh0506");
          }}
        />
      </div>
    </div>
  );
};

export default Navbar;
