import React from 'react';
import './App.css';
import ProductContainer from './ProductContainer';
import productsData from './productsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'

function App() {
  return (
    <div className="App">
      <header className="header">
        <div className="logo">
          <span>Tsar Burger</span>
        </div>
        <nav className="nav">
            <ul className="nav-list">
              <li><button>Главная</button></li>
              <li><button>Меню</button></li>
              <li><button>Контакты</button></li>
              <li>
                <button>
                  <FontAwesomeIcon 
                    icon={faCircleUser} 
                    className="nav-icon" 
                    style={{ fontSize: '1.2rem' }}
                  />
                </button>
              </li>
            </ul>
          </nav>
      </header>

      <section className="banner">
        <div className="banner-content">
          <h1>tsarskie burgeri</h1>
          <p>get stomache right now!</p>
        </div>
      </section>

      <section className="menu-section">
        <h2 className="section-title">Наше меню</h2>
        <ProductContainer/>
      </section>
    </div>
  );
}

export default App;