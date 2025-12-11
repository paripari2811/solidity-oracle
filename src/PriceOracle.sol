// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract PriceOracle {
    uint256 private value;

    event ValueUpdated(uint256 oldValue, uint256 newValue);

    function setValue(uint256 _value) external {
        uint256 oldValue = value;
        value = _value;
        emit ValueUpdated(oldValue, _value);
    }

    function getValue() external view returns (uint256) {
        return value;
    }
}
