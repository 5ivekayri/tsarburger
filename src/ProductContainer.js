import React from 'react';
import productsData from './productsData';

const ProductContainer = () => {
  return (
    <div className="products-container">
      <div className="header">
        <h1>Наше меню</h1>
        <p>Попробуйте наши вкуснейшие блюда</p>
      </div>
      
      {productsData.categories.map(category => (
        <div className="product-category" key={category.id}>
          <h2>{category.name}</h2>
          <div className="products">
            {category.items.map(product => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">{product.price} ₽</div>
                  <button className="add-to-cart">В корзину</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductContainer;