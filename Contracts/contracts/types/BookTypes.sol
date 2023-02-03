// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library BookTypes {
    struct bookStruct {
        string cid;
        uint256 purchasePrice;
        uint256 rentPrice;
        uint256 totalRevenue;
        mapping(uint256 => uint256) keyToPeriod;
    }
}
