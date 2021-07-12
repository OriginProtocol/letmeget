// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "OpenZeppelin/openzeppelin-contracts@4.2.0/contracts/token/ERC721/ERC721.sol";

contract RatsMock is ERC721 {
    using Strings for uint256;

    constructor() ERC721("Rats", "RAT") {
        _mint(msg.sender, 1);
        _mint(msg.sender, 2);
        _mint(msg.sender, 3);
        _mint(msg.sender, 4);
        _mint(msg.sender, 5);
        _mint(msg.sender, 6);
        _mint(msg.sender, 7);
        _mint(msg.sender, 8);
        _mint(msg.sender, 9);
        _mint(msg.sender, 10);
    }

    function _baseURI() internal view override returns (string memory) {
        return "https://peer.decentraland.org/lambdas/collections/standard/erc721/1/mch_collection/mch_napoleon_upper_body/";
    }
}
