import { ethers } from "ethers"; // ✅ Works in browser
import { useEffect, useState } from "react";

// Components
import Navigation from "./components/Navigation";
// ABIs
// Config

function App() {
  const [account,setAccount] = useState(null);
  //1.39.31

  const loadBlockChainData = async () => {  
    const provider = new ethers.providers.Web3Provider(window.ethereum);    
    
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
      <div className='cards__section'>

        <h3>Welcome to Millow!</h3>

      </div>

    </div>
  );
}

export default App;
