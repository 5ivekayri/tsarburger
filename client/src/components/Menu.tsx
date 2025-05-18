import React, { useState, useEffect } from 'react';
import { 
  Card, Grid, Typography, Button, Container, Box, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  ButtonGroup, Pagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  imageBase64?: string;
  category: string;
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
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  const categories = ['Все', 'Бургеры', 'Напитки', 'Сайды'];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    let result = [...menuItems];
    
    // Фильтрация по категории
    if (selectedCategory !== 'Все') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Сортировка по цене
    if (sortOrder) {
      result.sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      });
    }
    
    setFilteredItems(result);
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  }, [menuItems, selectedCategory, sortOrder]);

  // Вычисляем текущие элементы для отображения
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
      setFilteredItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке меню');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleSortChange = (order: 'asc' | 'desc' | null) => {
    setSortOrder(order);
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

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Категория</InputLabel>
          <Select
            value={selectedCategory}
            label="Категория"
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ButtonGroup variant="outlined" aria-label="sort buttons">
          <Button
            onClick={() => handleSortChange('asc')}
            startIcon={<ArrowUpwardIcon />}
            color={sortOrder === 'asc' ? 'primary' : 'inherit'}
          >
            По возрастанию
          </Button>
          <Button
            onClick={() => handleSortChange('desc')}
            startIcon={<ArrowDownwardIcon />}
            color={sortOrder === 'desc' ? 'primary' : 'inherit'}
          >
            По убыванию
          </Button>
          <Button
            onClick={() => handleSortChange(null)}
            color={sortOrder === null ? 'primary' : 'inherit'}
          >
            Сбросить
          </Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={4}>
        {currentItems.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <MenuItemCard>
              <MenuImage 
                src={item.imageBase64 || item.imageUrl} 
                alt={item.name} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Категория: {item.category}
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

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
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

export default Menu;