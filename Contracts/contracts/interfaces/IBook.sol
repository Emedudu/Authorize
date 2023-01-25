// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IBook {
    function issue(address receiver) external;

    function claim() external;
}