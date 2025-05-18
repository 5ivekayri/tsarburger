import React, { useState, useEffect } from 'react';
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
import Menu from './components/Menu';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Проверяем только существующий токен, без автоматического входа
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setIsAuthenticated(true);
        setUsername(user.username || '');
        setRoles(user.roles || []);
        fetchCartItemsCount();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const fetchCartItemsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Fetching cart with token:', token);
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCartItemsCount(data.items?.length || 0);
      } else if (response.status === 401) {
        console.error('Unauthorized access to cart');
        handleLogout();
      } else {
        console.error('Error fetching cart:', response.status);
      }
    } catch (error) {
      console.error('Error fetching cart items count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUsername('');
    setRoles([]);
    setCartItemsCount(0);
    navigate('/login');
  };

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
            <Route path="/" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Auth onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
};

export default App; 