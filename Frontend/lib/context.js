import { createContext } from "react";
import { voidUserData } from "./constants";

export const LoaderContext = createContext({
  loading: false,
  setLoading: () => {},
});

export const UserContext = createContext(voidUserData);
