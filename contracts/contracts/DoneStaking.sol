// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DoneStaking
 * @notice Gestion du staking des livreurs pour la fiabilité + slashing si faute
 */
contract DoneStaking is AccessControl, ReentrancyGuard {

    // === RÔLES ===
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    // === CONSTANTES ===
    uint256 public constant MINIMUM_STAKE = 0.1 ether;

    // === ÉTATS ===
    mapping(address => uint256) public stakedAmount;   // Montant staké par livreur
    mapping(address => bool) private staked;           // Marqueur "est staké"

    // === EVENTS ===
    event Staked(address indexed deliverer, uint256 amount);
    event Unstaked(address indexed deliverer, uint256 amount);
    event Slashed(address indexed deliverer, uint256 amount, address indexed platform);

    // === CONSTRUCTOR ===
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
    }

    // === STAKE ===
    function stakeAsDeliverer() external payable nonReentrant {
        require(msg.value >= MINIMUM_STAKE, "Staking: Minimum stake is 0.1 ETH");
        require(!staked[msg.sender], "Staking: Already staked");

        stakedAmount[msg.sender] = msg.value;
        staked[msg.sender] = true;

        emit Staked(msg.sender, msg.value);
    }

    // === UNSTAKE ===
    function unstake() external nonReentrant {
        require(staked[msg.sender], "Staking: Not staked");

        uint256 amount = stakedAmount[msg.sender];

        stakedAmount[msg.sender] = 0;
        staked[msg.sender] = false;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Staking: Transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    // === SLASH ===
    function slash(address deliverer, uint256 amount)
        external
        onlyRole(PLATFORM_ROLE)
        nonReentrant
    {
        require(staked[deliverer], "Staking: Deliverer not staked");
        require(amount <= stakedAmount[deliverer], "Staking: Exceeds stake");

        stakedAmount[deliverer] -= amount;

        if (stakedAmount[deliverer] == 0) {
            staked[deliverer] = false;
        }

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Staking: Slashing failed");

        emit Slashed(deliverer, amount, msg.sender);
    }

    // === VIEW FUNCTIONS ===

    function isStaked(address deliverer) external view returns (bool) {
        return staked[deliverer];
    }

    function getStakedAmount(address deliverer) external view returns (uint256) {
        return stakedAmount[deliverer];
    }
}
