import logo from '../assets/logo.svg';

const Navigation = ({ accounts, setAccount }) => {

    const connectHandeler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]); // Set the first account    
        console.log(accounts[0]);
    }

    return(
        <nav>
            <ul className='nav__links'>
                <li><a href='#'>Buy</a></li>
                <li><a href='#'>Rent</a></li>
                <li><a href='#'>Sell</a></li>   
            </ul>

            <div className="nav__brand">
                <img src={logo} alt='Logo' />
                <h1>Millow</h1>
            </div>

            {accounts ? (
                <button 
                type="button"
                className="nav__connect">
                    {accounts.slice(0, 6) + '...' + accounts.slice(38,42)}
                </button>
            ) : (
                <button 
                type="button" 
                className="nav__connect"
                onClick={connectHandeler}>
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;
