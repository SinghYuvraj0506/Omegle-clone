"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
class UserManager {
    constructor() {
        this.usersToSocket = new Map();
        this.socketIdToUser = new Map();
        this.queue = [];
        this.rooms = new RoomManager_1.RoomManager();
    }
    addUser(userName, socket) {
        try {
            let already = this.usersToSocket.get(userName);
            if (already) {
                socket.emit("ErrorOccured", "username already in use");
                return;
            }
            this.usersToSocket.set(userName, socket);
            this.socketIdToUser.set(socket.id, userName);
            console.log("added user --------------------", userName);
            console.log("Users count ----", this.socketIdToUser.size);
            this.queue.push(socket.id);
            socket.emit("GoToWaiting");
            this.startSearch(socket);
            this.socketHandlers(socket);
        }
        catch (error) {
            console.log(error);
        }
    }
    startSearch(socket) {
        // get a random other user -------------
        console.log("queue count", this.queue.length);
        if (this.queue.length < 2) {
            return;
        }
        // Generate a random index within the range of the array length
        const randomIndex = Math.floor(Math.random() * this.queue.length);
        const randomUser = this.queue[randomIndex];
        // same iuser ----------
        if (randomUser === socket.id) {
            return this.startSearch(socket);
        }
        let user1 = this.socketIdToUser.get(socket.id);
        let user2 = this.socketIdToUser.get(randomUser);
        //  remove from queue -------------------------------
        this.queue.splice(randomIndex, 1);
        this.queue = this.queue.filter((e) => {
            e !== socket.id;
        });
        // if user has left ------------------
        if (!user1 || !user2) {
            return this.startSearch(socket);
        }
        console.log("creating room for the user...... ");
        this.rooms.createRoom({ name: user1, socket: this.usersToSocket.get(user1) }, { name: user2, socket: this.usersToSocket.get(user2) });
    }
    removeUser(socket) {
        let userName = this.socketIdToUser.get(socket.id);
        // remove from bothe maps
        if (userName) {
            this.usersToSocket.delete(userName);
        }
        this.socketIdToUser.delete(socket.id);
        let remainingUser = this.rooms.removeRoom(socket.id);
        //  start searching for this --------
        if (remainingUser) {
            this.queue.push(remainingUser.id);
            this.startSearch(remainingUser);
        }
        console.log("users left ---", this.usersToSocket.size);
    }
    socketHandlers(socket) {
        socket.on("offer", (data) => {
            console.log(data);
            this.rooms.onNewOffer(data === null || data === void 0 ? void 0 : data.offer, data === null || data === void 0 ? void 0 : data.roomId, socket.id);
        });
        socket.on("answer", (data) => {
            this.rooms.onAnswer(data === null || data === void 0 ? void 0 : data.answer, data === null || data === void 0 ? void 0 : data.roomId, socket.id);
        });
    }
}
exports.UserManager = UserManager;
//# sourceMappingURL=UserManager.js.map