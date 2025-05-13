import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, Button, Container, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Перенаправляем на страницу входа, если пользователь не авторизован
      window.location.href = '/login';
      return;
    }

    try {
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
        throw new Error('Failed to add item to cart');
      }

      // Показываем уведомление об успешном добавлении
      alert('Товар добавлен в корзину!');
    } catch (err) {
      alert('Ошибка при добавлении товара в корзину');
    }
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
              <MenuImage src={item.imageUrl} alt={item.name} />
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
    </Container>
  );
};

export default Menu; 