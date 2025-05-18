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
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from './components/Menu';

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
  const isMobile = useMediaQuery('(max-width:600px)');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      })
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
      }
      const data = await response.json()
      setCartItemsCount(data.length)
    } catch (e) {
      console.error('Ошибка при получении количества товаров в корзине:', e)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUsername('')
    setRoles([])
    setCartItemsCount(0)
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/products" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App