
import { useEffect, useRef } from 'react';
import { Story } from '../types/game';
import { toast } from 'sonner';

export const useStoryNotifications = (stories: Story[]) => {
  const previousStoriesCount = useRef(stories.length);

  useEffect(() => {
    // Se temos mais histórias do que antes, uma nova foi adicionada
    if (stories.length > previousStoriesCount.current && previousStoriesCount.current > 0) {
      const newStory = stories[stories.length - 1];
      console.log('Nova história detectada:', newStory);
      
      toast.success('Nova história adicionada!', {
        description: newStory.title,
        duration: 3000,
      });
    }

    // Atualiza a contagem anterior
    previousStoriesCount.current = stories.length;
  }, [stories]);
};
