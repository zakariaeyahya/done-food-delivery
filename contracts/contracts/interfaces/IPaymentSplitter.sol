// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPaymentSplitter {

    event PaymentSplit(
        uint256 indexed orderId,
        address indexed restaurant,
        address indexed deliverer,
        address platform,
        uint256 restaurantAmount,
        uint256 delivererAmount,
        uint256 platformAmount,
        uint256 timestamp
    );

    function splitPayment(
        uint256 orderId,
        address payable restaurant,
        address payable deliverer,
        address payable platform
    ) external payable;
}
