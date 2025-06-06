
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
      toast.success(`${user.name} entrou na sala!`, {
        description: user.isModerator ? 'Product Owner entrou na equipe' : 'Novo membro da equipe',
        duration: 4000,
        className: 'bg-green-50 border-green-200',
        style: {
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          color: '#166534'
        }
      });
    });

    previousUsersRef.current = users;
  }, [users, currentUser]);
};
