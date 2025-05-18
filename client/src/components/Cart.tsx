import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Alert,
  Divider,
  Paper,
  Pagination
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageBase64?: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке корзины');
      }
      
      const data = await response.json();
      setCartItems(data.items);
    } catch (error) {
      setError('Не удалось загрузить корзину');
    }
  };

  const updateQuantity = async (menuItemId: string, newQuantity: number) => {
    try {
      const response = await fetch(`/api/cart/items/${menuItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении количества');
      }

      await fetchCart();
    } catch (error) {
      setError('Не удалось обновить количество');
    }
  };

  const removeItem = async (menuItemId: string) => {
    try {
      const response = await fetch(`/api/cart/items/${menuItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении товара');
      }

      await fetchCart();
    } catch (error) {
      setError('Не удалось удалить товар');
    }
  };

  const handleOrder = async () => {
    if (!deliveryAddress.trim()) {
      setError('Пожалуйста, укажите адрес доставки');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryAddress })
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании заказа');
      }

      navigate('/orders');
    } catch (error) {
      setError('Не удалось создать заказ');
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const paginatedItems = cartItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

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
          🛒 Корзина
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

        {cartItems.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center',
            py: 4
          }}>
            <Typography variant="h6" sx={{ 
              color: 'var(--text-color)',
              mb: 2
            }}>
              Корзина пуста
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/menu')}
              sx={{
                backgroundColor: 'var(--primary-color)',
                color: '#FFFFFF',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'var(--primary-hover)'
                }
              }}
            >
              Перейти в меню
            </Button>
          </Box>
        ) : (
          <>
            {paginatedItems.map((item) => (
              <Card key={item.id} sx={{ 
                mb: 2,
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
                <CardContent sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {item.imageBase64 && (
                    <Box sx={{ 
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={item.imageBase64} 
                        alt={item.name}
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 1,
                      color: 'var(--text-color)',
                      fontWeight: 600
                    }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'var(--primary-color)',
                      fontWeight: 600
                    }}>
                      {item.price} ₽
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      sx={{
                        color: 'var(--primary-color)',
                        backgroundColor: 'rgba(127,223,212,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(127,223,212,0.2)'
                        }
                      }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      sx={{
                        color: 'var(--primary-color)',
                        backgroundColor: 'rgba(127,223,212,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(127,223,212,0.2)'
                        }
                      }}
                    >
                      <Add />
                    </IconButton>
                    <IconButton
                      onClick={() => removeItem(item.menuItemId)}
                      sx={{
                        color: 'var(--error-color)',
                        '&:hover': {
                          color: '#d63031'
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {cartItems.length > itemsPerPage && (
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                my: 3
              }}>
                <Pagination
                  count={Math.ceil(cartItems.length / itemsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Адрес доставки"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'var(--background-color)',
                    '& fieldset': { borderColor: 'var(--border-color)' },
                    '&:hover fieldset': { borderColor: 'var(--primary-color)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' }
                  }
                }}
              />
            </Box>

            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
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
                {totalAmount} ₽
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleOrder}
              sx={{
                py: 1.5,
                backgroundColor: 'var(--primary-color)',
                color: '#FFFFFF',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'var(--primary-hover)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(127,223,212,0.2)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Оформить заказ
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Cart; 