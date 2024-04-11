// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
    function getPoolConfigurator() external view returns (address);
    function getPriceOracle() external view returns (address);
    // Add other functions you need from the addresses provider
}
