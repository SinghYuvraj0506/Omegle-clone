import express from "express";
import { createServer } from "http";
require("dotenv").config();
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs"
import https from "https"

const PORT = process.env.PORT || 8000;

const app = express();
// const server = createServer(app);

const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');

//we changed our express setup so we can use https
//pass the key and cert to createServer on https
const expressServer = https.createServer({key, cert}, app);

const io = new Server(expressServer, {
  cors: {
    origin: ["http://localhost:5173","https://2335-45-118-156-154.ngrok-free.app"],
  },
});

app.use(
  cors({
    origin: ["http://localhost:5173","https://2335-45-118-156-154.ngrok-free.app"],
  })
);

const userNameToSocketMap = new Map();
const sockettoUserNameMap = new Map();

interface Offer {
  offererUserName: string;
  offer: {};
  offerIceCandidates: any[];
  answer: {};
  answererUserName: string;
  answererIceCandidates: [];
}

let offers:any[] = [];

// socket ----------------
io.on("connection", (socket) => {
  console.log("New User connected", socket.id);

  socket.on("addUser", (name) => {
    userNameToSocketMap.set(name, socket.id);
    sockettoUserNameMap.set(socket.id, name);
    console.log("New User", name, "Connected");
    console.log(userNameToSocketMap);
  });

  // calls -------------------------
  socket.on("newOffer", (offer:{}) => {
    console.log("newOffer created");
    let obj = {
      offererUserName: sockettoUserNameMap.get(socket.id),
      offer,
      offerIceCandidates: [],
      answer: {},
      answererUserName: "",
      answererIceCandidates: [],
    };
    offers.push(obj);
    socket.broadcast.emit("answerOffer", obj);
  });

  socket.on("newanswer", (offerObj,ackFunction) => {
    console.log("answer created");
    let client1SocketId = userNameToSocketMap.get(offerObj?.offererUserName);
    let offerToUpdate = offers?.find(
        (o) => o?.offererUserName === offerObj?.offererUserName
      );

    //send back to the answerer all the iceCandidates we have already collected
    let client2UserName = sockettoUserNameMap.get(socket.id)
    ackFunction(offerToUpdate.offerIceCandidates);
    offerToUpdate.answer = offerObj.answer
    offerToUpdate.answererUserName = client2UserName
    //socket has a .to() which allows emiting to a "room"
    //every socket has it's own room
    socket.to(client1SocketId).emit("offerresponse",offerToUpdate)
  });

  socket.on("sendIceCandidateToSignalingServer", (iceCandidateObj) => {
    const { iceCandidate, didIOffer } = iceCandidateObj;

    if (didIOffer) {
      let userName = sockettoUserNameMap.get(socket.id);
      //this ice is coming from the offerer. Send to the answerer
      const offerInOffers = offers?.find(
        (o) => o?.offererUserName === userName
      );
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);
        // 1. When the answerer answers, all existing ice candidates are sent
        // 2. Any candidates that come in after the offer has been answered, will be passed through
        if (offerInOffers.answererUserName) {
          //pass it through to the other socket
          const socketToSendTo = userNameToSocketMap.get(
            offerInOffers.answererUserName
          );
          if (socketToSendTo) {
            socket
              .to(socketToSendTo.socketId)
              .emit("receivedIceCandidateFromServer", iceCandidate);
          } else {
            console.log("Ice candidate recieved but could not find answere");
          }
        }
      }
    } else {
      let userName = sockettoUserNameMap.get(socket.id);
      //this ice is coming from the answerer. Send to the offerer
      //pass it through to the other socket
      const offerInOffers = offers?.find(
        (o) => o.answererUserName === userName
      );
      const socketToSendTo = userNameToSocketMap.get(
        offerInOffers?.offererUserName
      );
      if (socketToSendTo) {
          socket
          .to(socketToSendTo.socketId)
          .emit("receivedIceCandidateFromServer", iceCandidate);
        } else {
          console.log(socketToSendTo,offerInOffers?.offererUserName,userName)
        console.log("Ice candidate recieved but could not find offerer");
      }
    }
  });

  socket.on("disconnect", () => {
    let name = sockettoUserNameMap.get(socket.id);
    console.log("User Disconnected", name);
    userNameToSocketMap.delete(name);
    sockettoUserNameMap.delete(socket.id);
  });
});

// health http route --------------
app.get("/", (req, res) => {
  return res.send("Hello from the server");
});

expressServer.listen(PORT, () => {
  console.log("Server runnning at port", PORT);
});
