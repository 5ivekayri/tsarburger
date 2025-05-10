import { useEffect, useState } from 'react'
import './App.css'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  available: boolean;
  preparationTime: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  address: string;
  roles: string[];
  enabled: boolean;
}

interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  contactPhone: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders'>('products')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      let endpoint = ''
      
      switch (activeTab) {
        case 'products':
          endpoint = 'http://localhost:8080/api/products'
          break
        case 'users':
          endpoint = 'http://localhost:8080/api/users'
          break
        case 'orders':
          endpoint = 'http://localhost:8080/api/orders'
          break
      }

      response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      switch (activeTab) {
        case 'products':
          setProducts(data)
          break
        case 'users':
          setUsers(data)
          break
        case 'orders':
          setOrders(data)
          break
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Произошла ошибка при загрузке данных')
      console.error('Ошибка:', e)
    } finally {
      setLoading(false)
    }
  }

  const retryFetch = () => {
    fetchData()
  }

  return (
    <div className="app-container">
      <nav className="nav-tabs">
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Продукты
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
      </nav>

      <div className="content-container">
        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        )}
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={retryFetch} className="retry-button">
              Повторить
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === 'products' && (
              <div className="products-grid">
                {products.length === 0 ? (
                  <p className="no-data">Нет доступных продуктов</p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="product-card">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <p className="price">{product.price}₽</p>
                      <p className="prep-time">Время приготовления: {product.preparationTime} мин.</p>
                      <div className="availability">
                        {product.available ? (
                          <span className="available">В наличии</span>
                        ) : (
                          <span className="unavailable">Нет в наличии</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-list">
                {users.length === 0 ? (
                  <p className="no-data">Нет пользователей</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="user-card">
                      <h3>{user.username}</h3>
                      <p>Email: {user.email}</p>
                      <p>Адрес: {user.address}</p>
                      <p>Роли: {user.roles.join(', ')}</p>
                      <div className="user-status">
                        {user.enabled ? (
                          <span className="enabled">Активен</span>
                        ) : (
                          <span className="disabled">Отключен</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="orders-list">
                {orders.length === 0 ? (
                  <p className="no-data">Нет заказов</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <h3>Заказ #{order.id}</h3>
                      <p>Статус: {order.status}</p>
                      <p>Адрес доставки: {order.deliveryAddress}</p>
                      <p>Сумма: {order.totalAmount}₽</p>
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <p>{item.productName} x {item.quantity}</p>
                            <p>{item.price}₽</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
