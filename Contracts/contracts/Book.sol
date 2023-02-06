// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {MarketAPI} from "@zondax/filecoin-solidity/contracts/v0.8/MarketAPI.sol";
import {MarketTypes} from "@zondax/filecoin-solidity/contracts/v0.8/types/MarketTypes.sol";
import {BookTypes} from "./types/BookTypes.sol";
import "./Key.sol";

contract Book is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    Key public immutable _key;
    uint8 public _feePercentage;

    mapping(uint256 => BookTypes.bookStruct) public bookIdToBookStruct;

    event BookCreated(address author, string cid, uint256 indexed bookId);

    event BookPublished(uint256 indexed bookId,uint256 purchasePrice,uint256 rentPrice);

    event Expires(uint256 period);

    constructor(uint8 feePercentage, address key) ERC721("Book", "Bk") {
        _feePercentage = feePercentage;
        _key = Key(key);
    }

    // only callable by bookshop dao which is the onlyOwner
    // function setFeePercentage(uint8 feePercentage) external {
    //     _feePercentage = feePercentage;
    // }

    // should mint a new book
    function createBook(string memory cid) external {
        _tokenIds.increment();
        uint256 newBookId = _tokenIds.current();
        _safeMint(msg.sender, newBookId);
        _setTokenURI(newBookId, cid);

        BookTypes.bookStruct storage newBook = bookIdToBookStruct[newBookId];
        newBook.cid = cid;
        emit BookCreated(msg.sender, cid, newBookId);
    }
    // should upload book for purchase and rent
    function uploadBook(uint256 bookId, uint256 purchasePrice, uint256 rentPrice) external {
        require(bookId>0&&bookId<=_tokenIds.current(),"Non-existent book");
        require(ownerOf(bookId)==msg.sender,"not book owner");
        bookIdToBookStruct[bookId].purchasePrice = purchasePrice;
        bookIdToBookStruct[bookId].rentPrice = rentPrice;
        emit BookPublished(bookId,purchasePrice,rentPrice);
    }
    // allows caller to view the book forever
    function buyAccess(uint256 bookId) external payable {
        BookTypes.bookStruct storage bookDetails = bookIdToBookStruct[bookId];
        require(msg.value >= bookDetails.purchasePrice, "not enough FIL sent");
        uint256 keyId = _key.getUserKey(msg.sender);
        if(keyId==0){_key.generateKey(msg.sender);keyId=_key.getUserKey(msg.sender);}
       
        bookDetails.keyToPeriod[keyId] = 2 ** 256 - 1;
        bookDetails.totalRevenue += _calculateProfit(_feePercentage, bookDetails.purchasePrice);
        _key.addBook(keyId, bookId);
        
    }
    // allows caller to view the book for a period
    function rentAccess(uint256 bookId) external payable {
        BookTypes.bookStruct storage bookDetails = bookIdToBookStruct[bookId];
        require(msg.value>=bookDetails.rentPrice,"not enough FIL sent");
        uint256 keyId = _key.getUserKey(msg.sender);
        if(keyId==0){_key.generateKey(msg.sender);keyId=_key.getUserKey(msg.sender);}

        uint256 viewExpiryDate=block.timestamp+(msg.value*86400/bookDetails.rentPrice);
        bookDetails.keyToPeriod[keyId] = viewExpiryDate;
        bookDetails.totalRevenue += _calculateProfit(_feePercentage, bookDetails.rentPrice);
        _key.addBook(keyId, bookId);
        
        emit Expires(msg.value*86400/bookDetails.rentPrice);

    }
    // allow owner of book to withdraw his profit
    function withdrawProfit(uint256 bookId) external payable {
        require(ownerOf(bookId) == msg.sender, "not book owner");
        uint256 revenue=bookIdToBookStruct[bookId].totalRevenue ;
        bookIdToBookStruct[bookId].totalRevenue = 0;
        payable(ownerOf(bookId)).transfer(revenue);
    }

    function canAccessBook(uint256 bookId,address caller) public view returns (bool) {
        if(ownerOf(bookId)==caller)return true;
        // using lighthouse, I can't query based on NFT, so this is a simple work around
        uint256 keyId = _key.getUserKey(caller);
        if(keyId==0)return false;
        BookTypes.bookStruct storage bookDetails = bookIdToBookStruct[bookId];
        if (bookDetails.keyToPeriod[keyId] > block.timestamp) {
            return true;
        }
        return false;
    }

    function getBookProfit(uint256 bookId) public view returns(uint256){
        BookTypes.bookStruct storage bookDetails = bookIdToBookStruct[bookId];
        return bookDetails.totalRevenue;
    }

    function sellBookOwnership(uint256 keyId) public {}

    function buyBookOwnership(uint256 keyId) public {}

    function _calculateProfit(uint8 feePercentage, uint256 price) internal pure returns (uint256) {
        return ((100 - feePercentage) * price) / 100;
    }

    receive()external payable{}
}
