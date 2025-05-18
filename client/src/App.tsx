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
        <AppBar position="static" sx={{ 
          backgroundColor: 'var(--primary-color)',
          color: 'var(--text-color)',
          boxShadow: '0 2px 8px var(--shadow-color)',
          borderBottomLeftRadius: '18px',
          borderBottomRightRadius: '18px',
          animation: 'fadeInDown 0.7s cubic-bezier(.39,.575,.56,1) both'
        }}>
          <Toolbar>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                color: 'var(--primary-color)',
                fontWeight: 800,
                fontSize: '2rem',
                fontFamily: 'Montserrat, Arial, sans-serif',
                letterSpacing: '0.03em',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              🍔 BurgerHouse
            </Typography>
            {isAuthenticated ? (
              <>
                <Button 
                  component={Link} 
                  to="/orders"
                  sx={{ 
                    color: 'var(--text-color)',
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(127,223,212,0.1)'
                    }
                  }}
                >
                  Мои заказы
                </Button>
                <IconButton
                  component={Link}
                  to="/cart"
                  sx={{ 
                    ml: 2,
                    color: 'var(--text-color)',
                    '&:hover': {
                      backgroundColor: 'rgba(127,223,212,0.1)'
                    }
                  }}
                >
                  <Badge badgeContent={cartItemsCount} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
                {roles.includes('ROLE_ADMIN') && (
                  <Button 
                    component={Link} 
                    to="/admin"
                    sx={{ 
                      color: 'var(--text-color)',
                      mx: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(127,223,212,0.1)'
                      }
                    }}
                  >
                    Админ панель
                  </Button>
                )}
                <Button 
                  onClick={handleLogout}
                  sx={{ 
                    color: 'var(--text-color)',
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(127,223,212,0.1)'
                    }
                  }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <Button 
                component={Link} 
                to="/login"
                sx={{ 
                  color: 'var(--text-color)',
                  '&:hover': {
                    backgroundColor: 'rgba(127,223,212,0.1)'
                  }
                }}
              >
                Войти
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Container>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}

export default App
