import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css'

// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
const network = WalletAdapterNetwork.Devnet

// You can also provide a custom RPC endpoint.
const endpoint = clusterApiUrl(network)

// @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
// Only the wallets you configure here will be compiled into your application, and only the dependencies
// of wallets that your users connect to will be loaded.
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
]

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>,
)
