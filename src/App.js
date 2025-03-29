import React from 'react';
import './App.css'; // Подключаем стили

function App() {
  return (
    <div className="App">
      {/* Шапка */}
      <header className="header">
        <div className="logo">
          <a href="/">MySite</a>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><a href="/">Home</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/shop">Shop</a></li>
          </ul>
        </nav>
        <div className="auth">
          <a href="/login" className="login">Login</a>
          <a href="/register" className="register">Register</a>
        </div>
      </header>

      <section className="banner">
        <div className="banner-content">
          <h1>Цаааааарский бургер</h1>
          <p>Мощное хрючево для мощных ребят</p>
        </div>
      </section>
    </div>
  );
}

export default App;