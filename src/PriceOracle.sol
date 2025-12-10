// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract PriceOracle {
    uint256 private price;

    event PriceUpdated(uint256 oldPrice, uint256 newPrice);

    function setPrice(uint256 _price) external {
        uint256 oldPrice = price;
        price = _price;
        emit PriceUpdated(oldPrice, _price);
    }

    function getPrice() external view returns (uint256) {
        return price;
    }
}
