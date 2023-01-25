// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Key is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256[]) public accessibleBooks;
    mapping(address=>uint256) public ownerToKey;

    constructor() ERC721("Key", "Ky") {}

    function generateKey(address caller) external returns (uint256) {
        _tokenIds.increment();
        uint256 newKeyId = _tokenIds.current();
        _safeMint(caller, newKeyId);
        return newKeyId;
    }

    // will create an internal version of _addBook
    function addBook(uint256 keyId, uint256 bookId) public {
        // probably check that it is called by the Book contract alone
        uint256[] storage myBooks = accessibleBooks[keyId];
        myBooks.push(bookId);
        accessibleBooks[keyId] = myBooks;
    }
    function getUserKey(address user)public view returns(uint256){
        return ownerToKey[user];
    }
    function setUserKey(address user,uint256 keyId)public{
        require(ownerOf(keyId)==user,"Not owner of key");
        ownerToKey[user]=keyId;
    }
}
