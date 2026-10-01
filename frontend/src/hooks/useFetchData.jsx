import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const useFetchData = (url) => {
  const { token, dispatch } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const fetchData = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        let message = `Error ${res.status}: ${res.statusText}`;
        try {
          message = JSON.parse(text).message || message;
        } catch {
          // not JSON, keep the status text
        }
        // An expired or invalid session: log out so the user can sign in again.
        if (res.status === 401 && token && id === requestId.current) {
          dispatch?.({ type: "LOGOUT" });
        }
        throw new Error(message);
      }
      const result = await res.json();
      if (id !== requestId.current) return; // a newer request replaced this one
      setData(result.data ?? []);
      setLoading(false);
    } catch (err) {
      if (id !== requestId.current) return;
      setLoading(false);
      setError(err.message);
    }
  }, [url, token, dispatch]);

  useEffect(() => {
    fetchData();
    return () => {
      requestId.current++; // ignore responses after unmount or url change
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetchData;