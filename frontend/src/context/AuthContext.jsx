import { createContext, useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const initialState = {
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  role: localStorage.getItem("role") || null,
  token: localStorage.getItem("token") || null,
};

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        role: null,
        token: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user || null,
        role: action.payload.role,
        token: action.payload.token,
      };
    case "LOGOUT":
      return {
        user: null,
        role: null,
        token: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem("user", state.user ? JSON.stringify(state.user) : null);
      localStorage.setItem("token", state.token);
      localStorage.setItem("role", state.role);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [state]);

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const baseUrl = "http://localhost:5000/api/v1"; // Hardcode for now
      console.log("Fetching login at:", `${baseUrl}/auth/login`); // Debug log
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorText = await res.text(); // Get raw response for debugging
        console.error("Login response error:", res.status, errorText);
        throw new Error(`Login failed with status ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: result.data,
          token: result.token,
          role: result.role,
        },
      });

      toast.success(result.message);
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/home";
      navigate(redirect);
    } catch (err) {
      dispatch({ type: "LOGOUT" });
      console.error("Login error:", err);
      toast.error(err.message || "Failed to connect to server");
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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