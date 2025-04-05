import React from 'react';
import './App.css';
import ProductContainer from './ProductContainer';
import productsData from './productsData';

function App() {
  return (
    <div className="App">
      <header className="header">
        <div className="logo">
          <span>MySite</span>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><button>Home</button></li>
            <li><button>Menu</button></li>
            <li><button>About</button></li>
            <li><button>Shop</button></li>
          </ul>
        </nav>
      </header>

      <section className="banner">
        <div className="banner-content">
          <h1>Best Burgers</h1>
          <p>Buy right now</p>
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