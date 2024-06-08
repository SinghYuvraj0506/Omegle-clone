import "./App.css";
import { Route, Routes } from "react-router-dom";
import Landing from "./Pages/Landing";
// import Lobby from "./Pages/Lobby";
import { SocketProvider } from "./Providers/Socket";
// import { RTCPeerProvider } from "./Providers/RTCPeer";
import Wait from "./Pages/Wait";
import { RTCPeerProvider } from "./Providers/RTCPeer";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useUser } from "./Providers/User";
import Protectedroute from "./Components/Protectedroute";
import Lobby from "./Pages/Lobby";

function App() {
  const userState = useUser();

  return (
    <SkeletonTheme baseColor="#171717" highlightColor="#212121">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/lobby"
          element={
            // <Protectedroute navigateCondition={!userState?.user} toUrl="/">
            //   <Wait />
            // </Protectedroute>
            <Lobby/>
          }
        />
      </Routes>
    </SkeletonTheme>
  );
}

export default App;
