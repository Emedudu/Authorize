// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Test {
    uint256 public integer;
    
    event Added(address indexed caller);
    constructor() {
        integer = 1;
    }

    function add() public {
        integer = integer + 1;
        emit Added(msg.sender);
    }

    function access(uint256 age,address user)external pure returns(uint8){
        require(user!=address(0)&&age>=18,"address required");
        return 4;
    }
}
