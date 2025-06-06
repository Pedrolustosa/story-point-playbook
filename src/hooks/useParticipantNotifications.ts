
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { User } from '../types/game';

export const useParticipantNotifications = (users: User[], currentUser: User | null) => {
  const previousUsersRef = useRef<User[]>([]);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Skip notifications on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousUsersRef.current = users;
      return;
    }

    const previousUsers = previousUsersRef.current;
    const newUsers = users.filter(user => 
      !previousUsers.some(prevUser => prevUser.id === user.id) &&
      user.id !== currentUser?.id // Don't notify for the current user
    );

    // Show toast for each new user
    newUsers.forEach(user => {
      toast({
        title: "Novo participante!",
        description: `${user.name} entrou na sala`,
        duration: 3000,
      });
    });

    previousUsersRef.current = users;
  }, [users, currentUser]);
};
