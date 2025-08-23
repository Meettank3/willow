import React, { useEffect, useState } from "react";
import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
  const [hasBrought, setHasBrought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);
  const [hasSold, setHasSold] = useState(false);

  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);
  const [owner, setOwner] = useState(null);

  const fetchDetails = async () => {
    if (!escrow || !home?.id) return;
    try {
      setBuyer(await escrow.buyer(home.id));
      setSeller(await escrow.seller());
      setLender(await escrow.lender());
      setInspector(await escrow.inspector());
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  const fetchOwner = async () => {
    if (!escrow || !home?.id) return;
    try {
      const listed = await escrow.isListed(home.id);
      if (!listed) {
        setOwner(await escrow.buyer(home.id));
      }
    } catch (err) {
      console.error("Error fetching owner:", err);
    }
  };

  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(home.id);
    const signer = await provider.getSigner();


    // Deposit earnest amount
    let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount });
    await transaction.wait();

    // Buyer approves the sale
    transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    setHasBrought(true);
  };

  const inspectHandler = async () => {
    const signer = await provider.getSigner();
    const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true);
    await transaction.wait();
    setHasInspected(true);
  };

  const lendHandler = async () => {
    const signer = await provider.getSigner();

    // Lender approves the sale
    let transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    // Send loan funds = purchasePrice - escrowAmount
    const purchasePrice = await escrow.purchasePrice(home.id);
    const escrowAmt = await escrow.escrowAmount(home.id);
    const lendAmount = purchasePrice.sub(escrowAmt);

    await signer.sendTransaction({
      to: escrow.address,
      value: lendAmount,
      gasLimit: 60000
    });

    setHasLended(true);
  };

  const sellHandler = async () => {
    const signer = await provider.getSigner();

    // Seller approves the sale
    let transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    // Seller finalizes the sale
    transaction = await escrow.connect(signer).finalizeSale(home.id);
    await transaction.wait();

    setHasSold(true);
  };

  useEffect(() => {
    if (escrow && home?.id) {
      fetchDetails();
      fetchOwner();
    }
  }, [escrow, home]);

  if (!home) return null;

  return (
    <div className="home">
      <div className="home__details">
        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>

        <div className="home__overview">
          <h1>{home.name}</h1>
          <p>
            <strong>{home.attributes[2].value}</strong> Bed Rooms |{" "}
            <strong>{home.attributes[3].value}</strong> Bathrooms |{" "}
            <strong>{home.attributes[4].value}</strong> sqft
          </p>
          <p>{home.address}</p>
          <h2>{home.attributes[0].value} ETH</h2>

          {owner ? (
            <div className="home__owned">
              Owned by {owner.slice(0, 6)}...{owner.slice(38, 42)}
            </div>
          ) : (
            <div>
              {account === inspector ? (
                <button className="home__buy" onClick={inspectHandler} disabled={hasInspected}>
                  Approve Inspection
                </button>
              ) : account === lender ? (
                <button className="home__buy" onClick={lendHandler} disabled={hasLended}>
                  Approve & Lend
                </button>
              ) : account === seller ? (
                <button className="home__buy" onClick={sellHandler} disabled={hasSold}>
                  Approve & Finalize Sale
                </button>
              ) : (
                <button className="home__buy" onClick={buyHandler} disabled={hasBrought}>
                  Buy
                </button>
              )}
              <button className="home__contact">Contact Agent</button>
            </div>
          )}

          <div>
            <hr />
            <h2>Overview</h2>
            <p>{home.description}</p>

            <hr />
            <h2>Facts and Features</h2>
            <ul>
              {home.attributes.map((attribute, index) => (
                <li key={index}>
                  <strong>{attribute.trait_type}</strong>: {attribute.value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button onClick={togglePop} className="home__close">
          <img src={close} alt="close" />
        </button>
      </div>
    </div>
  );
};

export default Home;
