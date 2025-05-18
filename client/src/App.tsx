import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Badge
} from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import './App.css'
import Cart from './components/Cart';
import Orders from './components/Orders';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';

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

interface AuthUser {
  username: string;
  roles: string[];
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders'>('products')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [username, setUsername] = useState("")
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('/api/auth/validate', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            setIsAuthenticated(true)
            setUsername(user.username || '')
            setRoles(user.roles || [])
            fetchCartItemsCount()
          } else {
            handleLogout()
          }
        } catch (error) {
          console.error('Auth validation failed:', error)
          handleLogout()
        }
      }
    }

    checkAuth()
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
          endpoint = '/api/products'
          break
        case 'users':
          endpoint = '/api/users'
          break
        case 'orders':
          endpoint = '/api/orders'
          break
      }

      response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const fetchCartItemsCount = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItemsCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart items count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCartItemsCount(0);
    setUsername("");
    setRoles([]);
  };

  const retryFetch = () => {
    fetchData()
  }

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
              Food Delivery
            </Typography>
            {isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/orders">
                  Мои заказы
                </Button>
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  sx={{ ml: 2 }}
                >
                  <Badge badgeContent={cartItemsCount} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
                {roles.includes('ROLE_ADMIN') && (
                  <Button color="inherit" component={Link} to="/admin">
                    Админ-панель
                  </Button>
                )}
                <Typography sx={{ mx: 2 }}>{username}</Typography>
                <Button color="inherit" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/login">
                Войти
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={
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
            } />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Auth onLogin={(user: AuthUser) => {
              setIsAuthenticated(true);
              setUsername(user.username);
              setRoles(user.roles || []);
              fetchCartItemsCount();
            }} />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}

export default App
