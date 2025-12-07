// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DoneToken
 * @notice Token ERC20 de fidélité pour récompenser les clients
 */
contract DoneToken is ERC20, AccessControl {
    
    // === RÔLES ===
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // === CONSTRUCTOR ===
    constructor() ERC20("DONE Token", "DONE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender); // ✔ déployeur = minter initial
    }

    // === MINT ===
    function mint(address to, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        _mint(to, amount);
    }

    // === BURN (client) ===
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // === BURN-FROM (ex: utilisé par contrat promotions) ===
    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Not allowed");
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
    }

    // === CALCUL REWARD ===
    /**
     * @notice Calcule la reward DONE pour un prix donné
     * @dev 1 DONE / 10 ETH dépensés → adapter selon besoin
     */
    function calculateReward(uint256 foodPrice) public pure returns (uint256) {
    return foodPrice / 10; // 10% du montant
}

}
