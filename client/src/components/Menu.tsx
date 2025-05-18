import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, Button, Container, Box, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  imageBase64?: string;
}

const MenuItemCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
});

const MenuImage = styled('img')({
  width: '100%',
  height: 200,
  objectFit: 'cover',
});

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке меню');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      console.log('Adding item to cart:', itemId);
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          menuItemId: itemId,
          quantity: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка при добавлении в корзину: ${response.status}`);
      }

      const data = await response.json();
      console.log('Cart update response:', data);

      setNotification({
        open: true,
        message: 'Товар успешно добавлен в корзину!',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (err) {
      console.error('Ошибка при добавлении в корзину:', err);
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : 'Ошибка при добавлении товара в корзину',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) return <Typography>Загрузка меню...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Меню
      </Typography>
      <Grid container spacing={4}>
        {menuItems.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <MenuItemCard>
              <MenuImage 
                src={item.imageBase64 || item.imageUrl} 
                alt={item.name} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg'; // Fallback image
                }}
              />
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {item.price} ₽
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => addToCart(item.id)}
                  >
                    В корзину
                  </Button>
                </Box>
              </Box>
            </MenuItemCard>
          </Grid>
        ))}
      </Grid>
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

export default Menu;