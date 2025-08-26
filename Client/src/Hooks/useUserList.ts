// Hooks/useUserList.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

type User = {
  userName: string;
  email: string;
  role: string;
};

export const useUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<User[]>('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to fetch users: ${err.message}`);
      } else {
        setError('Failed to fetch users due to an unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};