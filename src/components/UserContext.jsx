
// the UserContext
import {createContext, useState} from "react";

export const UserContext = createContext();

// the UserProvider component
export function UserProvider({ children }) {
    const [name, setName] = useState("");

    return <UserContext.Provider value={{ name, setName }}>{children}</UserContext.Provider>;
}