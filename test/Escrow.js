const { expect } = require('chai');
const { ethers } = require('hardhat');

// this convert value/Currency into Eths
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let  buyer, seller, lender, inspector;
    let realEstate, escrow;

    beforeEach( async() => {
    [buyer, seller, lender, inspector] = await ethers.getSigners();    
    
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

    // Approve property
    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait();    

    // list the property
    transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5));
    await transaction.wait();
});

    describe('Deployment', () => {

        it("It Returns NFT Address", async () => {
        const result =await escrow.nftAddress(); // by using let we can change variable data by const we cannot change variable data        
        expect(result).to.be.equal(realEstate.address) 
        });
    
        it("It Returns Seller Address", async () => {
        // checking seller address as above
        const result = await escrow.seller();
        expect(result).to.be.equal(seller.address)
        });
    
        it("It Returns Lender Address", async () => {
        // checking seller address as above
        const result = await escrow.lender();
        expect(result).to.be.equal(lender.address)
        });
    
        it("It Returns Inspector Address", async () => {
        // checking seller address as above
        const result = await escrow.inspector();
        expect(result).to.be.equal(inspector.address)
        });
    });
    
    describe('Listing', () => {

        // this check if bool in mapping is marked as true instade of false in Escrow.sol file 
        it("Update as List",async () => {
            const result = await escrow.isListed(1);
            expect(result).to.be.equal(true);
        });

        it("Update the Ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
        });

        it("Returns Buyer", async () => {
            const result = await escrow.buyer(1);
            expect(result).to.be.equal(buyer.address);
        });

        it("Returns Purchase Price", async () => {
            const result = await escrow.purchasePrice(1);
            expect(result).to.be.equal(tokens(10));
        });

        it("Returns Escrow Amount", async () => {
            const result = await escrow.escroAmount(1);
            expect(result).to.be.equal(tokens(5));
        });
    
    });

})
