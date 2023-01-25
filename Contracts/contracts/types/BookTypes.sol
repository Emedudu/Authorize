// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library BookTypes {
    struct bookStruct {
        string cid;
        uint256 purchasePrice;
        uint256 totalRevenue;
        uint256 pricePerEpoch;
        mapping(uint256 => uint256) keyToPeriod;
    }
}
