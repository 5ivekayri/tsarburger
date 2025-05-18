import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Paper,
  Pagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  deliveryAddress: string;
  orderTime: string;
  items: OrderItem[];
  totalAmount: number;
}

const statusColors: { [key: string]: string } = {
  PENDING: '#fdcb6e',
  CONFIRMED: '#74b9ff',
  PREPARING: '#a29bfe',
  READY: '#55efc4',
  ON_THE_WAY: '#ffeaa7',
  DELIVERED: '#00b894',
  CANCELLED: '#ff7675'
};

const statusLabels: { [key: string]: string } = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтвержден',
  PREPARING: 'Готовится',
  READY: 'Готов к доставке',
  ON_THE_WAY: 'В пути',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменен'
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке заказов');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setError('Не удалось загрузить заказы');
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedOrders = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ 
      py: 4,
      minHeight: '100vh',
      backgroundColor: 'var(--background-color)'
    }}>
      <Paper elevation={0} sx={{ 
        p: 4,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 20px var(--shadow-color)'
      }}>
        <Typography variant="h4" sx={{ 
          mb: 4,
          color: 'var(--text-color)',
          fontWeight: 700,
          textAlign: 'center',
          fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
          📦 Мои заказы
        </Typography>

        {error && (
          <Alert severity="error" sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(214,48,49,0.05)',
            color: 'var(--error-color)',
            border: '1px solid rgba(214,48,49,0.1)'
          }}>
            {error}
          </Alert>
        )}

        {orders.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center',
            py: 4
          }}>
            <Typography variant="h6" sx={{ 
              color: 'var(--text-color)',
              mb: 2
            }}>
              У вас пока нет заказов
            </Typography>
          </Box>
        ) : (
          <>
            {paginatedOrders.map((order) => (
              <Card key={order.id} sx={{ 
                mb: 3,
                borderRadius: 3,
                backgroundColor: 'var(--card-bg)',
                boxShadow: '0 4px 24px var(--shadow-color)',
                transition: 'transform 0.25s cubic-bezier(.39,.575,.56,1), box-shadow 0.25s',
                animation: 'fadeIn 0.7s cubic-bezier(.39,.575,.56,1) both',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 32px var(--shadow-color)'
                }
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: 'var(--text-color)',
                      fontWeight: 600
                    }}>
                      Заказ #{order.id}
                    </Typography>
                    <Chip
                      label={statusLabels[order.status]}
                      sx={{
                        backgroundColor: statusColors[order.status],
                        color: 'var(--text-color)',
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ 
                    color: '#636e72',
                    mb: 2
                  }}>
                    {new Date(order.orderTime).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" sx={{ 
                    color: 'var(--text-color)',
                    mb: 2
                  }}>
                    Адрес доставки: {order.deliveryAddress}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {order.items.map((item, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: 'var(--text-color)'
                      }}>
                        {item.name} x {item.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'var(--primary-color)',
                        fontWeight: 600
                      }}>
                        {item.price * item.quantity} ₽
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: 'var(--text-color)',
                      fontWeight: 600
                    }}>
                      Итого:
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: 'var(--primary-color)',
                      fontWeight: 700
                    }}>
                      {order.totalAmount} ₽
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {orders.length > itemsPerPage && (
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                mt: 4
              }}>
                <Pagination
                  count={Math.ceil(orders.length / itemsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Orders; 