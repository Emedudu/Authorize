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
        // gonna require(isAdmin)
        _tokenIds.increment();
        uint256 newKeyId = _tokenIds.current();
        _safeMint(caller, newKeyId);
        setUserKey(caller, newKeyId);
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

    function getUserBooks(address user)public view returns(uint256[] memory){
        uint256 userKey=getUserKey(user);
        return accessibleBooks[userKey];
    }

    function setUserKey(address user,uint256 keyId)public{
        require(ownerOf(keyId)==user,"Not owner of key");
        ownerToKey[user]=keyId;
    }
    function swapKeys(address user1, address user2) external {
        uint256 user1Key = getUserKey(user1);
        uint256 user2Key = getUserKey(user2);
        // check if both keys have been approved by this address to spend it

        safeTransferFrom(user1, user2, user1Key);
        safeTransferFrom(user2, user1, user2Key);

        setUserKey(user1, user2Key);
        setUserKey(user2, user1Key);
    }
}
