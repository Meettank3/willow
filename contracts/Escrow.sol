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

    modifier onlySeller(){
        require(msg.sender == seller, "Only Seller can call this Methode");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escroAmount;
    mapping(uint256 => address) public buyer;

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

    // this function transfer nft to contract addresss
    function list (
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escroAmount
    ) public payable onlySeller{
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);       
        isListed[_nftID] = true;

        purchasePrice[_nftID] = _purchasePrice;
        buyer[_nftID] = _buyer;
        escroAmount[_nftID] = _escroAmount;
    }

}
