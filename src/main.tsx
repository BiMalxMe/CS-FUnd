import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'


// Make Buffer available globally for Solana libraries
(window as any).Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);
