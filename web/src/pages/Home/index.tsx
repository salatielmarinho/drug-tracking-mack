import React  from 'react';
import logo from '../../assets/Logo-DrugTrackingMack-svg350.svg';
import './styles.css';
import { FiLogIn } from 'react-icons/fi'
import { Link } from 'react-router-dom';

const Home = () =>{
    return (
        <div id="page-home">
            <div className="content">
            <header>
                <img src={logo} alt="Drug Trancking MACK"/>
            </header>

            <main>
                <h1>Seu marketplace de rastreabilidade de medicamentos.</h1>
                <p>Ajudamos pessoas a rastrearem medicamentos de forma eficiente.</p>
                <Link to="/create-point">
                    <span>
                       <FiLogIn />
                    </span>
                    <strong>Cadastre um medicamento</strong>
                </Link>
            </main>
            </div>
        </div>
    )
}

export default Home;