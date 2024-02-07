"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOManager = void 0;
const socket_io_1 = require("socket.io");
class IOManager {
    static getIO(expressServer) {
        if (!this.io) {
            this.io = new socket_io_1.Server(expressServer, {
                cors: {
                    origin: [
                        "http://localhost:5173",
                        "https://2335-45-118-156-154.ngrok-free.app",
                    ],
                },
            });
            return this.io;
        }
        return this.io;
    }
}
exports.IOManager = IOManager;
//# sourceMappingURL=IoManager.js.map