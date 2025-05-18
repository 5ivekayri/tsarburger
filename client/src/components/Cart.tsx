import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Paper,
  Box,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartData {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

interface User {
  id: string;
  address?: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchCart();
    const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
    if (user && user.address) setAddress(user.address);
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      console.log('Fetching cart...');
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data: CartData = await response.json();
      console.log('Received cart data:', data);
      
      if (data && Array.isArray(data.items)) {
        setCartItems(data.items);
      } else {
        console.error('Invalid cart data format:', data);
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке корзины');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      console.log(`Updating quantity for item ${itemId} to ${newQuantity}`);
      const response = await fetch(`/api/cart/items/${itemId}?quantity=${newQuantity}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      setNotification({
        open: true,
        message: 'Количество обновлено',
        severity: 'success'
      });
      fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      setNotification({
        open: true,
        message: 'Ошибка при обновлении количества',
        severity: 'error'
      });
    }
  };

  const removeItem = async (itemId: string) => {
    const token = localStorage.getItem('token');
    try {
      console.log(`Removing item ${itemId}`);
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      setNotification({
        open: true,
        message: 'Товар удален из корзины',
        severity: 'success'
      });
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      setNotification({
        open: true,
        message: 'Ошибка при удалении товара',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const createOrder = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
    let actualAddress = address;
    if (!actualAddress) {
      const input = prompt('Пожалуйста, введите адрес доставки:');
      if (!input) return;
      actualAddress = input;
      setAddress(input);
      try {
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...user, address: input })
        });
      } catch (err) {
        alert('Ошибка при обновлении адреса');
        return;
      }
    }
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryAddress: actualAddress
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      alert('Заказ успешно создан!');
      navigate('/orders');
    } catch (err) {
      alert('Ошибка при создании заказа');
    }
  };

  if (loading) return <Typography>Загрузка корзины...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Корзина
      </Typography>

      {cartItems.length === 0 ? (
        <Typography>Корзина пуста</Typography>
      ) : (
        <>
          <Paper elevation={3} sx={{ mb: 3 }}>
            <List>
              {cartItems.map((item) => (
                <React.Fragment key={item.menuItemId}>
                  <ListItem>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.price} ₽`}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                        <IconButton
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => removeItem(item.menuItemId)}
                          sx={{ ml: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Итого: {total} ₽
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={createOrder}
            >
              Оформить заказ
            </Button>
          </Box>
        </>
      )}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart; 