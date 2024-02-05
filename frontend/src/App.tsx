import { Socket, io } from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [socket, setSocket] = useState<Socket | null>();
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState<string | null>(null);
  const [data, setdata] = useState([]);
  const [Name, setName] = useState<string | undefined>();

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("connected");
    });

    socket?.on("message", (data) => {
      setdata((prev) => {
        return [...prev, data?.user + " : " + data?.msg];
      });
    });

    socket?.on("new-user-joined", (user) => {
      setdata((prev) => {
        return [...prev, "New user Joined " + user.name];
      });
    });
  }, [socket]);

  const handleConnect = () => {
    if (!Name || Name.length < 1) {
      alert("Enter your name");
    } else {
      const socket = io("http://localhost:8000");
      setSocket(socket);
      socket.emit("newUser", { name: Name });
    }
  };

  const handleSend = () => {
    socket?.emit("new-message", message, room);
    setMessage("");
  };

  const handleJoinRoom = () => {
    if (!room || !Name) {
      alert("Fill the room and name");
    } else {
      const socket = io("http://localhost:8000");
      setSocket(socket);
      socket?.emit("joinRoom", room,{name:Name});
    }
  };

  if (socket) {
    return (
      <div className="flex flex-col gap-5">
        <h2>Hello {Name}</h2>
        {room && <span>Welcome to room {room}</span>}

        <input
          type="text"
          className="border w-1/2"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />

        <button onClick={handleSend} className="border w-max">
          Send Message
        </button>

        <ul className="flex flex-col gap-2">
          {data?.map((e) => {
            return <li>{e}</li>;
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 items-center my-5 border w-max m-auto p-5 rounded">
      <h1 className="text-2xl font-bold">Welcome to Omegle Chat</h1>

      <input
        type="text"
        placeholder="Enter you Name"
        className="w-full border p-3"
        onChange={(e) => {
          setName(e.target.value);
        }}
      />

      <input
        type="number"
        placeholder="Enter room number (optional)"
        className="w-full border p-3"
        onChange={(e) => {
          setRoom(e.target.value);
        }}
      />

      <button className="p-3 border rounded" onClick={handleConnect}>
        Connect to universal chat
      </button>
      <button className="p-3 border rounded" onClick={handleJoinRoom}>
        Connect to room
      </button>
    </div>
  );
}

export default App;
