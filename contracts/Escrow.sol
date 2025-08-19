//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
// giveng all party it's variable's..

    address public lender;
    address public nftAddress;
    address payable public seller;
    address public inspector;

// storing info while contract uplod only 1 time
    constructor(
        address _nftAddress,
        address  payable _seller,
        address _lender, 
        address _inspector
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        lender = _lender;
        inspector = _inspector;
    }

}
