// src/utility/useStats.js

import { useEffect, useState } from "react";
import axios from "axios";

export const useStats = () => {
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    comments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/stats");

        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};