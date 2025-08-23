import React, { useEffect, useState } from "react";
import close from '../assets/close.svg';


const Home = ({ home, provider,account , escrow, togglePop }) => {

    const [hasBrought, setHasBrought] = useState(false);
    const [hasLended, setHasLended] = useState(false);
    const [hasInspected, setHasInspected] = useState(false);
    const [hasSold, setHasSold] = useState(false);

    const [buyer, setBuyer] = useState(null);
    const [lender, setlender] = useState(null);
    const [inspector, setInspector] = useState(null);
    const [seller, setSeller] = useState(null);
    const [owner, setOwner] = useState(null);


    const fetchDetails = async () => {
        if (!escrow || !home?.id) return;  // safeguard

        try {
        // Fetching buyer, seller, lender, and inspector addresses from the escrow contract
        const buyerAddress = await escrow.buyer(home.id);
        setBuyer(buyerAddress);

        const sellerAddress = await escrow.seller();
        setSeller(sellerAddress);

        const lenderAddress = await escrow.lender();
        setlender(lenderAddress);

        const inspectorAddress = await escrow.inspector();
        setInspector(inspectorAddress);      
          // optional: approvals/inspection if your contract supports them
        } catch (err) {
        console.error("Error fetching details:", err);
        }
    };

    const fetchOwner = async () => {
        if (!escrow || !home?.id) return;  // safeguard
    
        try {
        const listed = await escrow.isListed(home.id);
        if (!listed) {
            const ownerAddress = await escrow.buyer(home.id);
            setOwner(ownerAddress);
        }
        } catch (err) {
            console.error("Error fetching owner:", err);
        }
    };

    const buyHandler = async () => {
        const escroAmount = await escrow.escrowAmount(home.id);
        const signer = await provider.getSigner();

        // lets Deposite ernest amount to escrow contract
        let transaction = await escrow.connect(signer).deposit(home.id, { value: escroAmount });
        await transaction.wait();

        // Buyer Approves the escrow contract to transfer the NFT
        transaction = await escrow.connect(signer).approve(home.id);
        await transaction.wait();
        setHasBrought(true);
    }

    const inspectHandler = async () => {

        const signer = await provider.getSigner();

        // Inspector approves the inspection
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id,true);
        await transaction.wait();
        setHasInspected(true);
    }
    const lendHandler = async () => {
        const signer = await provider.getSigner();

        // Lender approves the loan
        const transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();
        setHasInspected(true);

        // lender send funds to contract
        const lendAmount =  (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id));
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gassLimit: 60000 });
        setHasLended(true);
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner();

        // Seller approves the sale
        let transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        // seller transfers the NFT to the buyer
        transaction = await escrow.connect(signer).finalizeSale(home.id);
        await transaction.wait();

        setHasLended(true);
    }

    useEffect(() => {
        if (escrow && home?.id) {
            fetchDetails();
            fetchOwner();
        }
    }, [escrow, home]);

    
    if (!home) return null;
    console.log("Home metadata:", home);
    return (
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt="Home" />
                </div>
                
                <div className='home__overview'> 
                    <h1> {home.name} </h1>
                    <p>
                        <strong> {home.attributes[2].value} </strong> Bed Rooms |
                        <strong> {home.attributes[3].value} </strong> Bathrooms |
                        <strong> {home.attributes[4].value} </strong> sqft
                    </p>
                    <p> {home.address} </p>
                    <h2> {home.attributes[0].value} ETH </h2>

                    { owner ? (
                        <div className="home__owned">
                            Owned by {owner.slice(0, 6)}...{owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div> 
                            {(account === inspector) ? (
                            <button className='home__buy' onClick={inspectHandler} disabled={hasInspected} >
                                Approve Inspection
                            </button>
                            ) : (account === lender) ? (
                            <button className='home__buy' onClick={lendHandler}  disabled={hasLended} >
                                Approve & Lender
                            </button>
                            ) : (account === seller) ? (
                            <button className='home__buy' onClick={sellHandler} disabled={hasSold} >
                                Approve Inspection
                            </button>
                            ) : (
                                <button className='home__buy'onClick={buyHandler} disabled={hasBrought}>
                                Buy
                            </button>
                            )}
                        <button className='home__contact' >
                            Contact Agent
                        </button>
                        </div>
                    )}

                    <div>
                        <hr/>
                        <h2>Overview</h2>
                        <p>
                            {home.description}
                        </p>

                        <hr/>
                        <h2>Facts and Features</h2>
                        <ul>
                            {home.attributes.map((attribute, index) => (
                                <li key={index}><strong>{attribute.trait_type}</strong>: {attribute.value} </li>
                            ))}
                        </ul>
                    </div>
                </div> 

                <button onClick={ togglePop } className='home__close' >
                    <img src={close} alt="close" />
                </button>

            </div>
        </div>
    );
}

export default Home;
