import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Réseau local Hardhat (pour tests et développement local)
    hardhat: {
      chainId: 1337,
      // Configuration pour forker Mumbai si nécessaire
      // forking: {
      //   url: process.env.MUMBAI_RPC_URL || "https://rpc.ankr.com/polygon_mumbai"
      // }
    },
    
    // Réseau localhost (pour npx hardhat node)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    
    // Polygon Amoy Testnet (pour développement et tests)
    // NOTE: Amoy est le nouveau testnet qui remplace Mumbai (déprécié)
    // NOTE: Le symbole de devise est "POL" (pas "MATIC")
    amoy: {
      // Options RPC Amoy (utilisez celle de votre .env ou une de ces alternatives):
      // 1. Ankr (gratuit, pas de clé, RECOMMANDÉ pour débuter): https://rpc.ankr.com/polygon_amoy
      // 2. Alchemy (optionnel, plus stable, nécessite compte): https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY
      // 3. Public (peut être instable): https://rpc-amoy.polygon.technology
      // Par défaut, utilise Ankr (gratuit, pas besoin de compte)
      url: process.env.AMOY_RPC_URL || process.env.MUMBAI_RPC_URL || "https://rpc.ankr.com/polygon_amoy",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002, // Amoy chainId
      timeout: 60000,
      httpHeaders: {}
    },
    
    // Polygon Mumbai Testnet (déprécié - utilisez Amoy à la place)
    // Conservé pour compatibilité avec anciens déploiements
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc.ankr.com/polygon_mumbai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      timeout: 60000,
      httpHeaders: {}
    },
    
    // Polygon Mainnet (pour production - à utiliser plus tard)
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      timeout: 60000
    }
  },
  paths: {
    sources: "./",
    tests: "../test",
    scripts: "../scripts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // Configuration pour trouver les scripts depuis le dossier contracts/
  // Les scripts sont dans ../scripts par rapport à contracts/
  mocha: {
    timeout: 40000
  }
};

