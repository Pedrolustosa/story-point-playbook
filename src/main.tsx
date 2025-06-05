
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnv } from './config/env'

// Valida as variáveis de ambiente antes de inicializar a aplicação
validateEnv();

createRoot(document.getElementById("root")!).render(<App />);
