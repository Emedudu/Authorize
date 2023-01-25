// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Book.sol";
import "./Key.sol";

contract Bookshop {
    Book public immutable _book;
    Key public immutable _key;


    mapping(uint256 => address) public bookIdToOwner;

    event BookPublished(address indexed owner,uint256 indexed bookId);

    constructor(address book, address key) {
        _book = Book(book);
        _key = Key(key);
    }
    // callable by a book writer who wants to upload his book for sale or rent
    // key is the nft that can access his collection
    // use dealId or CID of metadata which contains encrypted file from lighthouse, displayImage
    // mints a Book to the caller's address
    // require that the deal period is greater than now
    function uploadBook(uint256 bookId) external {
        _book.safeTransferFrom(msg.sender, address(this), bookId);
        bookIdToOwner[bookId] = msg.sender;
        emit BookPublished(msg.sender, bookId);
    }

    function withdrawProfit(uint256 bookId) public {
        require(bookIdToOwner[bookId] == msg.sender, "Not book owner");
        uint256 initialBalance = address(this).balance;
        _book.withdrawProfit(bookId);
        uint256 finalBalance = address(this).balance;
        uint256 profit = finalBalance - initialBalance;
        if (profit > 0) {
            payable(msg.sender).transfer(profit);
        }
    }
    function swapKeys(address user1,address user2)external{
        uint256 user1Key=_key.getUserKey(user1);
        uint256 user2Key=_key.getUserKey(user2);
        // check if both keys have been approved by this address to spend it

        _key.safeTransferFrom(user1,user2,user1Key);
        _key.safeTransferFrom(user2,user1,user2Key);

        _key.setUserKey(user1, user2Key);
        _key.setUserKey(user2, user1Key);
    }

    // callable by the bookshop DAO
    function setFeePercentage() public {}
}
