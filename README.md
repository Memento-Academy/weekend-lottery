# Sepolia Weekend Lottery

<img src="https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge&logo=solidity" alt="Solidity" /> <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js" /> <img src="https://img.shields.io/badge/Foundry-Framework-EF6C00?style=for-the-badge" alt="Foundry" /> <img src="https://img.shields.io/badge/Account_Abstraction-ZeroDev-blue?style=for-the-badge" alt="AA" /> <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />

*A fair, transparent, and **gasless** on-chain lottery built with Foundry and Next.js. Featuring automated 72h cycles and sponsored entries via Account Abstraction.*

---

## How It Works

The Sepolia Weekend Lottery is designed for maximum accessibility and transparency. It leverages **Account Abstraction** to provide a seamless "gasless" experience for users.

### Lifecycle

```
Deploy (set ticket price)
  └─► Users connect via Privy (Social/Wallet)
        └─► Smart Account (Kernel) is generated
              └─► Users enter for FREE (Gas sponsored)
                    └─► Automated Draw every 72h
                          └─► Prize transferred automatically
```

### Gasless Entries (Account Abstraction)

We use **ZeroDev (Kernel)** and **Privy** to simplify the Web3 onboarding experience:

- **Social Login**: Enter with just an email—no seed phrase required.
- **Sponsored Transactions**: Gas fees are fully paid by our Paymaster. Users don't need ETH in their wallet to participate.
- **Smart Accounts**: Every user gets a dedicated Smart Account for secure, batchable transactions.

---

## System Architecture

```mermaid
graph TD
    User([User])
    Frontend[Next.js Frontend]
    Privy[Privy Auth]
    ZeroDev[ZeroDev Paymaster/AA]
    SmartAccount[Smart Account - Kernel]
    Lottery[WeekendLottery.sol]
    Sepolia[Sepolia Testnet]

    User -- "Login / OAuth" --> Privy
    User -- "Enter Lottery" --> Frontend
    Frontend -- "Request Sponsorship" --> ZeroDev
    ZeroDev -- "Sign & Pay Gas" --> SmartAccount
    SmartAccount -- "execute: enterLottery" --> Lottery
    Lottery -- "Verify & Store" --> Sepolia
    Lottery -- "Automated Draw" --> Sepolia
```

---

## Technology Stack

### Smart Contracts

- **Language**: [Solidity](https://soliditylang.org/) ^0.8.19
- **Framework**: [Foundry](https://book.getfoundry.sh/) (Forge, Cast, Anvil)
- **Deployment**: Sepolia Testnet

### Frontend & AA

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: Tailwind CSS & Lucide Icons
- **Auth**: [Privy](https://www.privy.io/) (Embedded Wallets & Login)
- **Account Abstraction**: [ZeroDev](https://zerodev.app/) (Kernel v2.1)
- **UI Components**: Radix UI (Accordion)

---

## Features

- **Premium Responsive UI**: A dark, high-end aesthetic inspired by modern Web3 apps.
- **Linear Header**: Sleek, horizontal navigation with quick-copy Smart Account link.
- **Interactive FAQ**: Explaining pricing models and gas sponsorship in detail.
- **Automated Cycles**: The contract is designed for 72h automated lottery rounds via Chainlink Automation.
- **Winner Banner**: Displays the last winner's Smart Account address, prize amount, and round ID once the lottery closes. Highlights "That's you!" if the connected user won.
- **On-chain Verification**: Every winner announcement includes a direct link to the `performUpkeep` transaction on Etherscan Sepolia — proof that the prize was transferred automatically without manual intervention.
- **Security First**: Fuzz testing, access controls, and reentrancy protection.

---

## Testing Strategy

The project includes a comprehensive test suite using Forge.

### Core Testing Areas

- **Unit Tests**: Ticket purchase logic, state guards, and access controls.
- **Fuzz Testing**: Validating price enforcement across thousands of randomized inputs.
- **AA Compatibility**: Ensuring contract functions are optimized for smart account calls.

Run tests:

```bash
forge test -vvv
```

---

## Getting Started

### Smart Contract Setup

```bash
# Clone
git clone https://github.com/CallejaJ/lottery-with-foundry.git
cd lottery-with-foundry

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Build
forge build
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup Environment
cp .env.example .env.local
# Add your PRIVY_APP_ID and ZERODEV_PROJECT_ID

# Run Dev Server
npm run dev
```

---

Built for the Web3 Community.
