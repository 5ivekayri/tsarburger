import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PREPARING':
        return 'info';
      case 'READY':
        return 'success';
      case 'DELIVERED':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) return <Typography>Загрузка заказов...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мои заказы
      </Typography>

      {orders.length === 0 ? (
        <Typography>У вас пока нет заказов</Typography>
      ) : (
        <List>
          {orders.map((order) => (
            <Paper key={order.id} elevation={3} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        Заказ #{order.id}
                      </Typography>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Адрес доставки: {order.deliveryAddress}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.primary">
                        Дата заказа: {new Date(order.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
              <List>
                {order.items.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} x ${item.price} ₽`}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" align="right">
                  Итого: {order.totalAmount} ₽
                </Typography>
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Orders; 