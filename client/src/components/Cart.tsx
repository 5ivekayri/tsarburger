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
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface User {
  id: string;
  address?: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCartItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке корзины');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      fetchCart();
    } catch (err) {
      alert('Ошибка при обновлении количества');
    }
  };

  const removeItem = async (itemId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      fetchCart();
    } catch (err) {
      alert('Ошибка при удалении товара');
    }
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
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.price} ₽`}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                        <IconButton
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => removeItem(item.id)}
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
    </Container>
  );
};

export default Cart; 