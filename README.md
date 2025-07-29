# Solana Crowdfunding dApp

A modern crowdfunding platform built on the Solana blockchain. Create, discover, and support projects with fast, low-fee transactions.

## Features

- Create campaigns with title, description, image, and funding goal
- Donate SOL to campaigns directly from your wallet
- Withdraw funds as a campaign creator
- Connect with Phantom or other Solana wallets
- Responsive, user-friendly UI

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Blockchain:** Solana, @solana/web3.js, Anchor (future)
- **Wallet:** @solana/wallet-adapter

## Getting Started

1. **Clone the repo:**
   ```
   git clone https://github.com/your-username/solana-crowdfunding.git
   cd solana-crowdfunding
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env` and set your Solana RPC URL and network.

4. **Run the app:**
   ```
   npm run dev
   ```

5. **Open in browser:**
   - Visit [http://localhost:5173](http://localhost:5173)

## Development Notes

- The dApp currently simulates transactions for demo purposes.
- To connect to a real Solana program, update the program ID and logic in `src/hooks/useCrowdfunding.ts` and `src/lib/solana.ts`.
- Campaign and donation data are not persisted on-chain in this demo.

## Folder Structure

- `src/pages/` — Main app pages (Campaigns, Create, NotFound)
- `src/components/` — UI components (CampaignCard, DonationModal, etc.)
- `src/hooks/` — Custom React hooks for Solana and app logic
- `src/lib/` — Solana utility functions and constants

## License

MIT
