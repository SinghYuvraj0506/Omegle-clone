import { Socket, io } from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./Pages/Landing";
// import Lobby from "./Pages/Lobby";
import { SocketProvider } from "./Providers/Socket";
// import { RTCPeerProvider } from "./Providers/RTCPeer";
import Wait from "./Pages/Wait";
import { RTCPeerProvider } from "./Providers/RTCPeer";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <RTCPeerProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* <Route path="/lobby" element={<Lobby />} /> */}
            <Route path="/test" element={<Wait />} />
          </Routes>
        </RTCPeerProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
