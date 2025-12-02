// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
// TODO: Importer ERC20 d'OpenZeppelin
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// TODO: Importer AccessControl d'OpenZeppelin
// import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DoneToken
 * @notice Token ERC20 de fidélité pour récompenser les clients
 * @dev Standard ERC20 avec fonctions mint() et burn()
 * @dev Système de récompenses : 1 token DONE par 10€ dépensés
 * @dev Tokens transférables et échangeables
 * @dev 18 decimals (standard ERC20)
 */
contract DoneToken {
    // TODO: Hériter de ERC20 et AccessControl
    // contract DoneToken is ERC20, AccessControl {

    // === RÔLES ===
    // TODO: Définir le rôle MINTER_ROLE
    // bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // === CONSTRUCTOR ===
    /**
     * @notice Initialise le token avec nom "DONE Token" et symbole "DONE"
     * @dev TODO: Appeler le constructor ERC20("DONE Token", "DONE")
     * @dev TODO: Configurer DEFAULT_ADMIN_ROLE pour msg.sender
     * @dev TODO: Configurer MINTER_ROLE pour msg.sender (initial)
     * @dev Les tokens ont 18 decimals par défaut (standard ERC20)
     */
    constructor() {
        // TODO: Appeler ERC20("DONE Token", "DONE")
        // TODO: _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // TODO: _grantRole(MINTER_ROLE, msg.sender);
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Mint des tokens DONE (réservé au MINTER_ROLE)
     * @dev TODO: Implémenter la fonction mint
     * - Vérifier que msg.sender a le rôle MINTER_ROLE (modifier onlyRole)
     * - Appeler _mint(to, amount) d'ERC20
     * - Les tokens sont minés automatiquement après chaque commande livrée
     * 
     * Utilisation:
     * - Appelé par DoneOrderManager après confirmDelivery()
     * - Formule: tokensToMint = (foodPrice / 10 ether) * 1 ether
     * - Exemple: foodPrice = 100 ether → tokensToMint = 10 ether (10 tokens)
     * 
     * @param to Adresse destinataire des tokens
     * @param amount Montant à mint (en wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external {
        // TODO: Vérifier le rôle MINTER_ROLE avec onlyRole(MINTER_ROLE)
        // TODO: Appeler _mint(to, amount) pour créer les tokens
    }

    /**
     * @notice Burn des tokens DONE (consommation pour réductions)
     * @dev TODO: Implémenter la fonction burn
     * - Vérifier que msg.sender a suffisamment de tokens
     * - Appeler _burn(msg.sender, amount) d'ERC20
     * - Les tokens peuvent être brûlés pour obtenir des réductions
     * 
     * @param amount Montant à burn (en wei)
     */
    function burn(uint256 amount) external {
        // TODO: Appeler _burn(msg.sender, amount) pour détruire les tokens
        // Note: ERC20 vérifie automatiquement que msg.sender a suffisamment de tokens
    }

    /**
     * @notice Calculer le montant de tokens à mint pour un montant dépensé
     * @dev TODO: Implémenter la fonction calculateReward
     * - Formule: (foodPrice / 10 ether) * 1 ether = 1 token par 10€
     * - Exemple: foodPrice = 100 ether → return 10 ether (10 tokens)
     * - Exemple: foodPrice = 50 ether → return 5 ether (5 tokens)
     * - Exemple: foodPrice = 15 ether → return 1 ether (1 token)
     * 
     * Note: Cette fonction est pure (pas de modification d'état)
     * 
     * @param foodPrice Prix des plats en wei
     * @return tokensToMint Montant de tokens à mint
     */
    function calculateReward(uint256 foodPrice) public pure returns (uint256) {
        // TODO: return (foodPrice / 10 ether) * 1 ether;
        // Note: Division entière, donc 15 ether / 10 ether = 1, puis * 1 ether = 1 token
    }

    // === FONCTIONS ERC20 STANDARD ===
    // TODO: Les fonctions ERC20 standard sont héritées automatiquement:
    // - transfer(to, amount)
    // - transferFrom(from, to, amount)
    // - approve(spender, amount)
    // - balanceOf(account)
    // - totalSupply()
    // - allowance(owner, spender)
    // - name() → "DONE Token"
    // - symbol() → "DONE"
    // - decimals() → 18
}

