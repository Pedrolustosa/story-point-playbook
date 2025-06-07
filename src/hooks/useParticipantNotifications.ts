
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { User } from '../types/game';

export const useParticipantNotifications = (users: User[], currentUser: User | null) => {
  const previousUsersRef = useRef<User[]>([]);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Early return if we don't have the required data
    if (!users || users.length === 0 || !currentUser) {
      previousUsersRef.current = users || [];
      isInitialLoadRef.current = true;
      return;
    }

    // Skip notifications on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousUsersRef.current = users;
      return;
    }

    const previousUsers = previousUsersRef.current;
    console.log('Previous users:', previousUsers);
    console.log('Current users:', users);
    console.log('Current user:', currentUser);
    
    const newUsers = users.filter(user => 
      !previousUsers.some(prevUser => prevUser.id === user.id) &&
      user.id !== currentUser?.id // Don't notify for the current user
    );

    console.log('New users detected:', newUsers);

    // Show toast for each new user
    newUsers.forEach(user => {
      console.log('Processing new user:', user);
      console.log('User name:', user.name);
      console.log('User object keys:', Object.keys(user));
      
      const userName = user.name || 'Usuário desconhecido';
      console.log('Final userName for toast:', userName);
      
      toast.success(`${userName} entrou na sala!`, {
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
