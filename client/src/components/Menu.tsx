import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Pagination
} from '@mui/material';
import { Search, Add, Remove, ShoppingCart } from '@mui/icons-material';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageBase64?: string;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const categories = ['all', 'Бургеры', 'Напитки', 'Сайды'];

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Ошибка при загрузке меню');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      setError('Не удалось загрузить меню');
    }
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const handleAddToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ 
      py: 4,
      backgroundColor: 'var(--background-color)',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        mb: 4,
        backgroundColor: '#FFFFFF',
        p: 3,
        borderRadius: 4,
        boxShadow: '0 4px 20px var(--shadow-color)'
      }}>
        <Typography variant="h4" sx={{ 
          mb: 3,
          color: 'var(--text-color)',
          fontWeight: 700,
          textAlign: 'center',
          fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
          🍔 Меню BurgerHouse
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

        <TextField
          fullWidth
          placeholder="Поиск блюд..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'var(--primary-color)' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              backgroundColor: 'var(--background-color)',
              '& fieldset': { borderColor: 'var(--border-color)' },
              '&:hover fieldset': { borderColor: 'var(--primary-color)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' }
            }
          }}
        />

        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--primary-color)',
              height: 3
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              color: 'var(--text-color)',
              '&.Mui-selected': {
                color: 'var(--primary-color)'
              }
            }
          }}
        >
          {categories.map((category) => (
            <Tab key={category} label={category} value={category} />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {paginatedItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card className="menu-card" sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 4px 24px var(--shadow-color)',
              transition: 'transform 0.25s cubic-bezier(.39,.575,.56,1), box-shadow 0.25s',
              animation: 'fadeIn 0.7s cubic-bezier(.39,.575,.56,1) both',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: '0 8px 32px var(--shadow-color)'
              },
              backgroundColor: 'var(--card-bg)'
            }}>
              {item.imageBase64 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageBase64}
                  alt={item.name}
                  sx={{
                    objectFit: 'cover',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  color: 'var(--text-color)'
                }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 'auto'
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'var(--primary-color)',
                    fontWeight: 600
                  }}>
                    {item.price} ₽
                  </Typography>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    {cart[item.id] ? (
                      <>
                        <IconButton 
                          size="small"
                          onClick={() => handleRemoveFromCart(item.id)}
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
                        <Typography sx={{ mx: 1 }}>{cart[item.id]}</Typography>
                        <IconButton 
                          size="small"
                          onClick={() => handleAddToCart(item.id)}
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
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(item.id)}
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
                        В корзину
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredItems.length > itemsPerPage && (
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mt: 4
        }}>
          <Pagination
            count={Math.ceil(filteredItems.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default Menu;