import React, { SetStateAction, createContext, useContext, useState } from "react";

interface UserContextProps {
  user:string | null,
  setUser:React.Dispatch<SetStateAction<string | null>>
}

const UserContext = createContext<UserContextProps | null>(null);

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider: React.FC = (props) => {
    const [user, setUser] = useState<string | null>(null)

    return <UserContext.Provider value={{setUser,user}}>
      {props.children}
    </UserContext.Provider>
}