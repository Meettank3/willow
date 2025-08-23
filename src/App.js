import { ethers } from "ethers"; // ✅ Works in browser
import { useEffect, useState } from "react";


// Components
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Search from "./components/Search";
// ABIs
import Escrow from "./abis/Escrow.json";
import RealEstate from "./abis/RealEstate.json";
// Config
import config from "./config.json";

function App() {
  
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);
  const [homes, setHomes] = useState([]);
  // for toggleProp
  const [home, setHome] = useState([]);
  const [toggle, setToggle] = useState([false]);
  
  const loadBlockChainData = async () => {  
    const provider = new ethers.providers.Web3Provider(window.ethereum);   
    setProvider(provider); // Update the provider state 
    
    // connect to network
    const network = await provider.getNetwork();
    console.log("Chain ID:", network.chainId);

    // Connecting RealEstate Contract
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    const totalSupply = await realEstate.totalSupply()

    // Adding Homes from ipfs
    const homes = [];

    for (let i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      homes.push(metadata);
    }
    setHomes(homes); // Update the homes state
    console.log(homes);

    // Connecting Escrow Contract
    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider);
    setEscrow(escrow); // Update the escrow state


    
    // update if account is been changed
    window.ethereum.on('accountsChanged', async() => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account); // Update the account state
  });

  }
  useEffect(() => {
    loadBlockChainData()
  },[] )

  const togglePop = (home) => {
    setHome(home); // Update the home state for selected property
    toggle ? setToggle(false) : setToggle(true); // Toggle the state
  }

  return (
    <div>
      <Navigation accounts ={account} setAccount={setAccount} > </Navigation>

      <Search />
      <div className='cards__section'>

        <h3>Homes For You</h3>

        <hr/>

        <div className="cards">
          {homes.map((home, index) => (

            <div className="card" key={index} onClick = { () => togglePop(home) } >
            <div className="card__image">
              <img src={home.image} alt="Home" />
            </div>
            <div  className="card__info">
              <h4> {home.attributes[0].value} ETH</h4>
              <p>
                <strong> {home.attributes[2].value} </strong> Bed Rooms |
                <strong> {home.attributes[3].value} </strong> Bathrooms |
                <strong> {home.attributes[4].value} </strong> sqft
              </p>
              <p> {home.address} </p>
            </div>
            </div>

          ))}

        </div>

      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;
