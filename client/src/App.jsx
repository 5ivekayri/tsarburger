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
    const autoLogin = async () => {
      try {
        // Пытаемся войти как админ
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'admin',
            password: '111'
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsAuthenticated(true);
          setUsername(data.user.username);
          setRoles(data.user.roles || []);
          fetchCartItemsCount();
        }
      } catch (error) {
        console.error('Auto login failed:', error);
      }
    };

    // Проверяем, есть ли уже токен
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAuthenticated(true);
      setUsername(user.username || '');
      setRoles(user.roles || []);
      fetchCartItemsCount();
    } else {
      // Если токена нет, пробуем автоматический вход
      autoLogin();
    }
  }, []);

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
    // После выхода сразу входим как админ
    window.location.reload();
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