const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let  buyer, seller, lender, inspector;
    let realEstate, escrow;

    beforeEach( async() => {
    [buyer, seller, lender, inspector] = await ethers.getSigners();
    console.log('Buyer: ', buyer.address,"seller: ",seller.address);
    
    // Deploy The RealEstate Contract in HardHat
    const RealEstate = await ethers.getContractFactory('RealEstate');
    realEstate = await RealEstate.deploy();
    
    // Mint
    let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
    await transaction.wait();
    // seting address 
    const Escrow = await ethers.getContractFactory('Escrow');
    escrow = await Escrow.deploy( // must be in same order as in Escrow.sol constructor
        realEstate.address,
        seller.address,
        lender.address,
        inspector.address
    );
    });

    describe('Deployment', ()=>{

        it("It Return's NFT Address", async () => {
        const result =await escrow.nftAddress(); // by using let we can change variable data by const we cannot change variable data        
        expect(result).to.be.equal(realEstate.address) 
        });
    
        it("It Return's Seller Address", async () => {
        // checking seller address as above
        const result = await escrow.seller();
        expect(result).to.be.equal(seller.address)
        });
    
        it("It Return's Lender Address", async () => {
        // checking seller address as above
        const result = await escrow.lender();
        expect(result).to.be.equal(lender.address)
        });
    
        it("It Return's Inspector Address", async () => {
        // checking seller address as above
        const result = await escrow.inspector();
        expect(result).to.be.equal(inspector.address)
        });
    });

})
