"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.socketIdToRoomId = new Map();
    }
    createRoom(user1, user2) {
        //  genrate a room id
        let roomID = this.genrateRoomID();
        // already room exists ------
        if (this.rooms.get(roomID)) {
            return this.createRoom(user1, user2);
        }
        this.rooms.set(roomID, {
            user1, user2
        });
        this.socketIdToRoomId.set(user1.socket.id, roomID);
        this.socketIdToRoomId.set(user2.socket.id, roomID);
        console.log("Room created for -----", user1.name, user2.name);
        user1.socket.join(roomID);
        user2.socket.join(roomID);
        user1.socket.to(roomID).emit("FoundConnection", { peerName: user2.name, roomId: roomID });
        // user1.socket.emit("FoundConnection",{peerName:user2.name,roomId:roomID,type:"sender"})
        // user2.socket.emit("FoundConnection",{peerName:user1.name,roomId:roomID,type:"reciever"})
        this.printRoomsCount();
    }
    printRoomsCount() {
        console.log("rooms count", this.rooms.size);
    }
    genrateRoomID() {
        // Generate a random 4-digit number between 1000 and 9999
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        // Convert the random number to a string
        return randomNumber.toString();
    }
    removeRoom(socketid) {
        var _a, _b;
        let roomid = this.socketIdToRoomId.get(socketid);
        const roomData = this.rooms.get(roomid !== null && roomid !== void 0 ? roomid : "");
        this.rooms.delete(roomid !== null && roomid !== void 0 ? roomid : "");
        this.socketIdToRoomId.delete((_a = roomData === null || roomData === void 0 ? void 0 : roomData.user1.socket.id) !== null && _a !== void 0 ? _a : "");
        this.socketIdToRoomId.delete((_b = roomData === null || roomData === void 0 ? void 0 : roomData.user2.socket.id) !== null && _b !== void 0 ? _b : "");
        this.printRoomsCount();
        return (roomData === null || roomData === void 0 ? void 0 : roomData.user1.socket.id) !== socketid ? roomData === null || roomData === void 0 ? void 0 : roomData.user1.socket : roomData === null || roomData === void 0 ? void 0 : roomData.user2.socket;
    }
    onNewOffer(offer, roomid, socketid) {
        console.log("Creating new Offer", offer, roomid);
        let room = this.rooms.get(roomid);
        let reciever = (room === null || room === void 0 ? void 0 : room.user1.socket.id) === socketid ? room === null || room === void 0 ? void 0 : room.user2 : room === null || room === void 0 ? void 0 : room.user1;
        reciever === null || reciever === void 0 ? void 0 : reciever.socket.emit("sendAnswer", offer);
    }
    onAnswer(answer, roomid, socketid) {
        console.log("Creating new Answer", answer, roomid);
        let room = this.rooms.get(roomid);
        let reciever = (room === null || room === void 0 ? void 0 : room.user1.socket.id) === socketid ? room === null || room === void 0 ? void 0 : room.user2 : room === null || room === void 0 ? void 0 : room.user1;
        reciever === null || reciever === void 0 ? void 0 : reciever.socket.emit("gotAnswer", answer);
    }
}
exports.RoomManager = RoomManager;
//# sourceMappingURL=RoomManager.js.map