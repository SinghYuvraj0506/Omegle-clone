import { Socket } from "socket.io";

interface User{
  name:string,
  socket:Socket
}

interface Room {
    user1:User,
    user2:User
}



export class RoomManager {
  private rooms: Map<string, Room>;
  private socketIdToRoomId : Map<string,string>

  constructor() {
    this.rooms = new Map<string, Room>();
    this.socketIdToRoomId = new Map<string, string>();
  }

  createRoom(user1: User, user2: User) {
    //  genrate a room id
    let roomID = this.genrateRoomID();

    // already room exists ------
    if(this.rooms.get(roomID)){
        return this.createRoom(user1,user2)
    }

    this.rooms.set(roomID,{
        user1,user2
    })

    this.socketIdToRoomId.set(user1.socket.id,roomID)
    this.socketIdToRoomId.set(user2.socket.id,roomID)

    console.log("Room created for -----",user1.name,user2.name)

    user1.socket.join(roomID);
    user2.socket.join(roomID);

    user1.socket.to(roomID).emit("FoundConnection",{peerName:user2.name,roomId:roomID})

    // user1.socket.emit("FoundConnection",{peerName:user2.name,roomId:roomID,type:"sender"})
    // user2.socket.emit("FoundConnection",{peerName:user1.name,roomId:roomID,type:"reciever"})
    this.printRoomsCount()
  }

  printRoomsCount(){
    console.log("rooms count" , this.rooms.size)
  }

  genrateRoomID() {
    // Generate a random 4-digit number between 1000 and 9999
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    // Convert the random number to a string
    return randomNumber.toString();
  }

  removeRoom(socketid:string){
    let roomid = this.socketIdToRoomId.get(socketid)
    const roomData = this.rooms.get(roomid ?? "")
    this.rooms.delete(roomid ?? "")
    this.socketIdToRoomId.delete(roomData?.user1.socket.id ?? "")
    this.socketIdToRoomId.delete(roomData?.user2.socket.id ?? "")
    this.printRoomsCount()
    return roomData?.user1.socket.id !== socketid ? roomData?.user1.socket : roomData?.user2.socket
  }

  onNewOffer(offer:RTCSessionDescriptionInit,roomid:string,socketid:string){
    console.log("Creating new Offer",offer,roomid)
    let room = this.rooms.get(roomid)
    let reciever = room?.user1.socket.id === socketid ? room?.user2 : room?.user1

    reciever?.socket.emit("sendAnswer",offer)
  }

  onAnswer(answer:RTCSessionDescriptionInit,roomid:string,socketid:string){
    console.log("Creating new Answer",answer,roomid)
    let room = this.rooms.get(roomid)
    let reciever = room?.user1.socket.id === socketid ? room?.user2 : room?.user1

    reciever?.socket.emit("gotAnswer",answer)
  }


}
