
import { useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface AppError {
  message: string;
  code?: string;
  details?: string;
  shouldStopProcess?: boolean;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, context?: string): AppError => {
    console.error('Error occurred:', error, 'Context:', context);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    let errorCode: string | undefined;
    let shouldStopProcess = true;
    
    // Parse different error types
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Network errors
    if (error?.message?.includes('Network error') || error?.message?.includes('fetch')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      errorCode = 'NETWORK_ERROR';
    }
    
    // API errors
    if (error?.status) {
      errorCode = `HTTP_${error.status}`;
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos enviados para o servidor.';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Acesso negado para esta operação.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
      }
    }
    
    // JSON parsing errors
    if (error?.message?.includes('JSON')) {
      errorMessage = 'Erro ao processar resposta do servidor.';
      errorCode = 'JSON_PARSE_ERROR';
    }
    
    // Add context to message if provided
    const finalMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    // Show toast notification with custom styling
    toast.error(finalMessage, {
      duration: 6000,
      description: errorCode ? `Código: ${errorCode}` : undefined,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      style: {
        borderLeft: '4px solid #ef4444',
      },
      className: 'border-l-red-500',
    });
    
    const appError: AppError = {
      message: finalMessage,
      code: errorCode,
      details: error?.stack || JSON.stringify(error),
      shouldStopProcess
    };
    
    return appError;
  }, []);
  
  const handleSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, {
      duration: 4000,
      description,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      style: {
        borderLeft: '4px solid #22c55e',
      },
      className: 'border-l-green-500',
    });
  }, []);
  
  const handleWarning = useCallback((message: string, description?: string) => {
    toast.warning(message, {
      duration: 5000,
      description,
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      style: {
        borderLeft: '4px solid #eab308',
      },
      className: 'border-l-yellow-500',
    });
  }, []);

  const handleInfo = useCallback((message: string, description?: string) => {
    toast.info(message, {
      duration: 4000,
      description,
      icon: <Info className="h-5 w-5 text-blue-500" />,
      style: {
        borderLeft: '4px solid #3b82f6',
      },
      className: 'border-l-blue-500',
    });
  }, []);
  
  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo
  };
};
