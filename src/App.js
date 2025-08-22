import { ethers } from "ethers"; // ✅ Works in browser
import { useEffect, useState } from "react";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
// ABIs
import RealEstate from "./abis/RealEstate.json";
// Config
import config from "./config.json";


function App() {
  
  const [provider,setProvider] = useState(null);
  const [account,setAccount] = useState(null);
  
  const loadBlockChainData = async () => {  
    const provider = new ethers.providers.Web3Provider(window.ethereum);   
    setProvider(provider); // Update the provider state 
    
    // connect to network
    const network = await provider.getNetwork();
    console.log("Chain ID:", network.chainId);

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    const totalSupply = await realEstate.totalSupply()

    console.log("Total Supply: ", totalSupply.toString() );


    
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

  return (
    <div>
      <Navigation accounts ={account} setAccount={setAccount} > </Navigation>

      <Search />
      <div className='cards__section'>

        <h3>Homes for you</h3>

        <hr/>

        <div className="cards">
          <div className="card" >
            <div className="card__image">
              <img src="" alt="Home" />
            </div>
            <div className="card__info">
              <h4>1 ETH</h4>
              <p>
                <strong>1</strong> bds |
                <strong>2</strong> ba |
                <strong>3</strong> sqft
              </p>
              <p>1234 elms street</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default App;
