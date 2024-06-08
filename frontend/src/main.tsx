import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { UserProvider } from "./Providers/User.tsx";
import { BrowserRouter } from "react-router-dom";
import { RTCPeerProvider } from "./Providers/RTCPeer.tsx";
import SocketProvider from "./Providers/SocketProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <RTCPeerProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </RTCPeerProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);
