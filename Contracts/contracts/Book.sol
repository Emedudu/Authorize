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

    constructor(uint8 feePercentage, address key) ERC721("Book", "Bk") {
        _feePercentage = feePercentage;
        _key = Key(key);
    }

    // onlyOwner
    function setFeePercentage(uint8 feePercentage) external {
        _feePercentage = feePercentage;
    }

    // should mint a new book
    function createBook(string memory cid) public {
        _tokenIds.increment();
        uint256 newBookId = _tokenIds.current();
        _safeMint(msg.sender, newBookId);
        _setTokenURI(newBookId, cid);

        BookTypes.bookStruct storage newBook = bookIdToBookStruct[newBookId];
        newBook.cid = cid;
        emit BookCreated(msg.sender, cid, newBookId);
    }

    // emit the time left till book deal is over
    // can only view the book forever(till the deal ends)
    function buyAccess(uint256 bookId) public payable {
        uint256 keyId = _key.getUserKey(msg.sender);
        BookTypes.bookStruct storage bookDetails = bookIdToBookStruct[bookId];

        require(msg.value >= bookDetails.purchasePrice, "not enough FIL sent");

        bookDetails.keyToPeriod[keyId] = 2 ** 256 - 1;
        bookDetails.totalRevenue += calculateProfit(_feePercentage, bookDetails.purchasePrice);
        _key.addBook(keyId, bookId);
    }

    function withdrawProfit(uint256 bookId) public payable {
        require(ownerOf(bookId) == msg.sender, "Not the owner of the book");
        bookIdToBookStruct[bookId].totalRevenue = 0;
        payable(ownerOf(bookId)).transfer(bookIdToBookStruct[bookId].totalRevenue);
    }

    function getPurchasePrice(uint256 bookId) public view returns (uint256) {
        return bookIdToBookStruct[bookId].purchasePrice;
    }

    function calculateProfit(uint8 feePercentage, uint256 price) internal pure returns (uint256) {
        return ((100 - feePercentage) * price) / 100;
    }

    function canAccessBook(uint256 bookId,address caller) external view returns (uint8) {
        require(caller==msg.sender,"Address mismatch");
        // using lighthouse, I can't query based on NFT, so this is a simple work around

        uint256 keyId = _key.getUserKey(caller);
        BookTypes.bookStruct storage bookDetails = bookIdToBookStruct[bookId];
        if (bookDetails.keyToPeriod[keyId] > block.timestamp) {
            return 1;
        }
        return 0;
    }

    // check if the period of rentage is less than the deal period
    // emit the time left till rent expires
    // can only view the book till rent expires
    function rentAccessToBook(uint256 keyId) public {}

    // sell book ownership(callable by owner of the book alone)
    // it can be forever or a pasticular period(lease)
    // becomes new owner of book, and can republish
    function sellBookOwnership(uint256 keyId) public {}

    // buy book ownership
    // it can be forever or a pasticular period(borrow)
    // becomes owner of book for a particular amount of time, and can republish during that period
    function buyBookOwnership(uint256 keyId) public {}

    // TODO: create collection
    // a user can create a collection for all his books(those he can view and those he owns)
    // by default, a person can view his books through his wallet address
    // it will create a transferrable nft called key which can be used to access his collection
    function createCollection(uint256 keyId) public {}

    function setBookPrice(uint256 bookId, uint256 purchasePrice, uint256 rentPrice) public {
        bookIdToBookStruct[bookId].purchasePrice = purchasePrice;
        bookIdToBookStruct[bookId].pricePerEpoch = rentPrice;
    }
}
