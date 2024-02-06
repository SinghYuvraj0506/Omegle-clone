import { Socket, io } from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./Pages/Landing";
import Lobby from "./Pages/Lobby";
import { SocketProvider } from "./Providers/Socket";

function App() {
  return (
    <BrowserRouter>
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lobby" element={<Lobby />} />
      </Routes>
    </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
