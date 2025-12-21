// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IPaymentSplitter.sol";

contract DonePaymentSplitter is Ownable, ReentrancyGuard, IPaymentSplitter {

    uint256 public constant RESTAURANT_PERCENT = 70;
    uint256 public constant DELIVERER_PERCENT = 20;
    uint256 public constant PLATFORM_PERCENT = 10;

    mapping(address => uint256) public balances;

    //  SUPPRIMÉ : l'événement doublon
    // event PaymentSplit(...) {}

    event Withdrawn(address indexed payee, uint256 amount);

    constructor() {}

    function splitPayment(
        uint256 _orderId,
        address payable _restaurant,
        address payable _deliverer,
        address payable _platform
    ) external payable nonReentrant override {

        require(msg.value > 0, "PaymentSplitter: Amount must be greater than 0");
        require(_restaurant != address(0), "PaymentSplitter: Invalid restaurant address");
        require(_deliverer != address(0), "PaymentSplitter: Invalid deliverer address");
        require(_platform != address(0), "PaymentSplitter: Invalid platform address");

        uint256 restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100;
        uint256 delivererAmount = (msg.value * DELIVERER_PERCENT) / 100;
        uint256 platformAmount = (msg.value * PLATFORM_PERCENT) / 100;

        balances[_restaurant] += restaurantAmount;
        balances[_deliverer] += delivererAmount;
        balances[_platform] += platformAmount;

        // 💡 On utilise l'event de l'interface
        emit PaymentSplit(
            _orderId,
            _restaurant,
            _deliverer,
            _platform,
            restaurantAmount,
            delivererAmount,
            platformAmount,
            block.timestamp
        );
    }

    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "PaymentSplitter: No balance to withdraw");

        balances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "PaymentSplitter: Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getPendingBalance(address payee) external view returns (uint256) {
        return balances[payee];
    }
}
