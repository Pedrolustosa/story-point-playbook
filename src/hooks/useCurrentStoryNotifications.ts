
import { useEffect, useRef } from 'react';
import { Story, User } from '../types/game';
import { toast } from 'sonner';

export const useCurrentStoryNotifications = (
  currentStory: Story | null,
  currentUser: User | null
) => {
  const previousCurrentStoryRef = useRef<Story | null>(null);

  useEffect(() => {
    // Se uma nova história foi selecionada
    if (currentStory && 
        currentStory.id !== previousCurrentStoryRef.current?.id && 
        previousCurrentStoryRef.current !== null) {
      
      console.log('Nova história selecionada detectada:', currentStory.title);
      
      // Não mostra notificação para o próprio PO que selecionou
      if (!currentUser?.isProductOwner) {
        toast.info('Nova história selecionada!', {
          description: `"${currentStory.title}" - Agora você pode votar`,
          duration: 4000,
        });
      } else {
        toast.success('História selecionada!', {
          description: `"${currentStory.title}" - Aguardando votos dos participantes`,
          duration: 3000,
        });
      }
    }

    // Atualiza a referência anterior
    previousCurrentStoryRef.current = currentStory;
  }, [currentStory, currentUser]);
};
