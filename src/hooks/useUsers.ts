import { useEffect, useState } from 'react';
import { client } from '../utils/fetchClient';
import { User } from '../types/User';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(false);

      try {
        const data = await client.get<User[]>('/users');

        setUsers(data);
      } catch {
        setUsers([]);
        setUsersError(true);
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  return { users, usersLoading, usersError };
}
