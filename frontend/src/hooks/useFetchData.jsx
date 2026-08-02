import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const useFetchData = (url) => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        let message = `Error ${res.status}: ${res.statusText}`;
        try {
          const result = JSON.parse(text);
          message = result.message || message;
        } catch (jsonErr) {
          // If parsing fails, use the status text
        }
        throw new Error(message);
      }
      const result = await res.json();
      setData(result.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  }, [url, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetchData;