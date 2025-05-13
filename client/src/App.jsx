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
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      fetchCartItemsCount();
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        setUsername(parsed.username);
        setRoles(parsed.roles || []);
      }
    } else {
      setUsername("");
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