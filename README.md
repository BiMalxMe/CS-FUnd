#Live Demo
https://youtu.be/O8zNzC2StoI  
https://youtu.be/O8zNzC2StoI

# 🌊 Solana Crowdfunding dApp

A **decentralized crowdfunding platform** built on **Solana** using **Anchor**.  
This dApp allows users to create campaigns, donate SOL, withdraw funds, and manage campaigns securely with automatic platform fee handling.

---

## 🚀 Features

- **Wallet Integration**: Connect with Phantom or Solflare wallets.
- **Create Campaigns**: Launch fundraising campaigns with title, description, image, and goal.
- **Donate SOL**: Contribute to campaigns directly via your wallet.
- **Track Campaigns**: View funds raised, donors, and goal completion progress.
- **Withdraw Funds**: Campaign creators can withdraw donations with an automatic platform fee.
- **Update Platform Fee**: Deployer can change platform fees securely.
- **Deactivate Campaigns**: Safely deactivate campaigns instead of permanent deletion.

---

## 📦 Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)
- [@coral-xyz/anchor](https://www.anchor-lang.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

**Smart Contract:**
- [Anchor](https://www.anchor-lang.com/) (Rust-based Solana framework)

**Program ID:**
CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm

 #⚡ Program Methods Overview
Method	Description
initialize	Initializes program state with platform fee
createCampaign	Creates a new crowdfunding campaign
updateCampaign	Updates campaign details
donate	Donates SOL to a campaign
withdraw	Withdraws funds (creator only, with fee)
updatePlatformSettings	Updates platform fee (deployer only)
deleteCampaign	Deactivates a campaign
