import { createContext, useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../config.js";

const readStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value && value !== "null" && value !== "undefined" ? value : null;
  } catch {
    return null;
  }
};

const readUser = () => {
  try {
    const raw = readStorage("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: readUser(),
  role: readStorage("role"),
  token: readStorage("token"),
};

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { user: null, role: null, token: null };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user || null,
        role: action.payload.role,
        token: action.payload.token,
      };
    case "LOGOUT":
      return { user: null, role: null, token: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const store = (key, value) =>
        value ? localStorage.setItem(key, value) : localStorage.removeItem(key);
      store("user", state.user ? JSON.stringify(state.user) : null);
      store("token", state.token);
      store("role", state.role);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [state]);

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Login failed");

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: result.data, token: result.token, role: result.role },
      });

      toast.success(result.message);
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      navigate(redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/");
    } catch (err) {
      dispatch({ type: "LOGOUT" });
      toast.error(err.message || "Failed to connect to server");
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <authContext.Provider
      value={{
        user: state.user,
        token: state.token,
        role: state.role,
        dispatch,
        login,
        logout,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => useContext(authContext);