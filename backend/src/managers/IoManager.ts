import { Server } from "socket.io";

export class IOManager {
  private static io: Server;

  public static getIO(expressServer?) {
    if (!this.io) {
      this.io = new Server(expressServer, {
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
