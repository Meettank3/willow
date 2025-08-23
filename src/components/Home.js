import close from '../assets/close.svg';


const Home = ({ home, provider, escrow, togglePop }) => {
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
                    <div>
                        <button className='home__buy' >
                            Buy
                        </button>
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
