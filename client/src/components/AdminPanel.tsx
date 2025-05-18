import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField, Grid, Card, CardContent, CardActions, IconButton, Box, Alert,
  Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Delete, Edit, Save, Add, Person, ShoppingCart, PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageBase64?: string;
}

interface MenuForm {
  name: string;
  description: string;
  price: string;
  imageBase64: string;
  category: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  deliveryAddress: string;
  orderTime: string;
  items: OrderItem[];
  totalAmount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuForm>({ 
    name: '', 
    description: '', 
    price: '', 
    imageBase64: '', 
    category: '' 
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const categories = ["Бургеры", "Напитки", "Сайды"];
  const orderStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "ON_THE_WAY", "DELIVERED", "CANCELLED"];

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        throw new Error('Ошибка при загрузке меню');
      }
      
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setError('Ошибка при загрузке меню');
    }
  };

  useEffect(() => {
    const checkAdminRole = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN');
      if (!hasAdminRole) {
        setError('Нет прав для доступа к админ-панели. Требуется роль ADMIN.');
        return;
      }
      // Если есть права админа, загружаем данные
      fetchMenu();
      fetchUsers();
      fetchOrders();
    };

    if (token) {
      checkAdminRole();
    } else {
      setError('Требуется авторизация');
    }
  }, [token]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      fetchUsers();
    } else if (newValue === 2) {
      fetchOrders();
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with token:', token);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
        if (response.status === 401) {
          setError('Нет прав для просмотра пользователей. Требуется роль ADMIN.');
          return;
        }
        throw new Error(errorData?.message || 'Ошибка при загрузке пользователей');
      }
      
      const data = await response.json();
      console.log('Users loaded:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке пользователей');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        throw new Error('Ошибка при загрузке заказов');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Ошибка при загрузке заказов');
    }
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleOrderEdit = (order: Order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const handleUserSave = async () => {
    if (!selectedUser) return;

    try {
      console.log('Saving user:', selectedUser);
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedUser)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        throw new Error(errorData?.message || 'Ошибка при обновлении пользователя');
      }

      const updatedUser = await response.json();
      console.log('User updated:', updatedUser);
      setUserDialogOpen(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при обновлении пользователя');
    }
  };

  const handleOrderSave = async () => {
    if (!selectedOrder) return;

    try {
      console.log('Sending status update:', selectedOrder.status);
      const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: selectedOrder.status })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        throw new Error(errorData?.message || 'Ошибка при обновлении заказа');
      }

      const updatedOrder = await response.json();
      console.log('Order updated:', updatedOrder);
      
      setOrderDialogOpen(false);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при обновлении заказа');
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      console.log('Deleting user:', userId);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        if (response.status === 403) {
          setError('У вас нет прав для удаления пользователей.');
          return;
        }
        throw new Error(errorData?.message || 'Ошибка при удалении пользователя');
      }

      console.log('User deleted successfully');
      setError('');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при удалении пользователя');
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Нет прав для удаления заказа');
          return;
        }
        throw new Error('Ошибка при удалении заказа');
      }

      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Ошибка при удалении заказа');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Размер файла не должен превышать 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, imageBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    try {
      if (!form.name || !form.description || !form.price || !form.category) {
        setError('Пожалуйста, заполните все обязательные поля');
        return;
      }

      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price)
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        throw new Error('Ошибка при добавлении блюда');
      }

      setForm({ name: '', description: '', price: '', imageBase64: '', category: '' });
      setImageFile(null);
      setError('');
      await fetchMenu();
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при добавлении блюда');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({ 
      ...item, 
      price: item.price.toString(),
      imageBase64: item.imageBase64 || '' 
    });
  };

  const handleSave = async (id: string) => {
    try {
      if (!form.name || !form.description || !form.price || !form.category) {
        setError('Пожалуйста, заполните все обязательные поля');
        return;
      }

      const response = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price)
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        throw new Error('Ошибка при обновлении блюда');
      }

      setEditingId(null);
      setForm({ name: '', description: '', price: '', imageBase64: '', category: '' });
      setImageFile(null);
      setError('');
      await fetchMenu();
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при обновлении блюда');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/menu/${id}`, { 
        method: 'DELETE', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          return;
        }
        throw new Error('Ошибка при удалении блюда');
      }

      setError('');
      await fetchMenu();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при удалении блюда');
    }
  };

  if (!token) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ 
      mt: 4,
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      py: 4,
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#2d3436',
        fontWeight: 700,
        mb: 4,
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        textAlign: 'center'
      }}>
        🍔 Админ-панель BurgerHouse
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ 
          mb: 2,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(255,0,0,0.1)'
        }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        '& .MuiTabs-indicator': {
          backgroundColor: '#7fdfd4',
          height: 3
        }
      }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{
          backgroundColor: 'var(--primary-color)',
          borderRadius: '12px',
          mb: 3,
          boxShadow: '0 2px 8px var(--shadow-color)',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: 16,
            color: 'var(--text-color)',
            fontWeight: 600,
            transition: 'color 0.2s',
            '&.Mui-selected': {
              color: 'var(--secondary-color)',
              backgroundColor: 'rgba(208,245,234,0.15)',
              borderRadius: '10px'
            },
            '&:hover': {
              color: 'var(--primary-hover)',
              backgroundColor: 'rgba(227,230,243,0.15)'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--secondary-color)',
            height: 3
          }
        }}>
          <Tab icon={<ShoppingCart sx={{ color: tabValue === 0 ? '#7fdfd4' : '#2d3436' }} />} 
               label="Меню" 
               sx={{ 
                 textTransform: 'none', 
                 fontSize: 16,
                 color: tabValue === 0 ? '#7fdfd4' : '#2d3436',
                 '&:hover': { color: '#5dbeae' }
               }} />
          <Tab icon={<Person sx={{ color: tabValue === 1 ? '#7fdfd4' : '#2d3436' }} />} 
               label="Пользователи" 
               sx={{ 
                 textTransform: 'none', 
                 fontSize: 16,
                 color: tabValue === 1 ? '#7fdfd4' : '#2d3436',
                 '&:hover': { color: '#5dbeae' }
               }} />
          <Tab icon={<ShoppingCart sx={{ color: tabValue === 2 ? '#7fdfd4' : '#2d3436' }} />} 
               label="Заказы" 
               sx={{ 
                 textTransform: 'none', 
                 fontSize: 16,
                 color: tabValue === 2 ? '#7fdfd4' : '#2d3436',
                 '&:hover': { color: '#5dbeae' }
               }} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ 
          mb: 3,
          backgroundColor: '#fff',
          p: 3,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6" sx={{ 
            color: '#2d3436',
            mb: 3,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Add sx={{ color: '#7fdfd4' }} /> Добавить новое блюдо
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Название"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { borderColor: '#eee' },
                    '&:hover fieldset': { borderColor: '#7fdfd4' },
                    '&.Mui-focused fieldset': { borderColor: '#7fdfd4' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Цена"
                name="price"
                type="number"
                value={form.price}
                onChange={handleInputChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { borderColor: '#eee' },
                    '&:hover fieldset': { borderColor: '#7fdfd4' },
                    '&.Mui-focused fieldset': { borderColor: '#7fdfd4' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleSelectChange}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eee' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7fdfd4' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7fdfd4' }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                name="description"
                multiline
                rows={3}
                value={form.description}
                onChange={handleInputChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': { borderColor: '#eee' },
                    '&:hover fieldset': { borderColor: '#7fdfd4' },
                    '&.Mui-focused fieldset': { borderColor: '#7fdfd4' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera sx={{ color: '#7fdfd4' }} />}
                sx={{ 
                  width: '100%',
                  borderColor: '#e0e0e0',
                  borderRadius: 3,
                  color: '#2d3436',
                  '&:hover': {
                    borderColor: '#7fdfd4',
                    backgroundColor: 'rgba(127,223,212,0.05)'
                  }
                }}
              >
                Загрузить картинку
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  onChange={handleImageChange} 
                />
              </Button>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                onClick={handleAdd}
                sx={{
                  width: '100%',
                  backgroundColor: '#7fdfd4',
                  color: '#fff',
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: '#5dbeae'
                  }
                }}
              >
                Добавить
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ 
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
                  {item.imageBase64 && (
                    <Box sx={{ 
                      width: '100%', 
                      height: 200, 
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden'
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
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.description}</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>{item.price} ₽</Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(item)}
                    sx={{
                      color: 'var(--secondary-color)',
                      fontWeight: 600,
                      '&:hover': { color: 'var(--primary-hover)' }
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(item.id)}
                    sx={{
                      color: 'var(--error-color)',
                      fontWeight: 600,
                      '&:hover': { color: '#d63031' }
                    }}
                  >
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#2d3436',
          fontWeight: 600,
          mb: 3
        }}>
          Управление пользователями
        </Typography>
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3,
          border: '1px solid #f0f0f0',
          '& .MuiTableCell-head': {
            backgroundColor: '#7fdfd4',
            color: '#fff',
            fontWeight: 600
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'rgba(127,223,212,0.05)'
          }
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя пользователя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роли</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.roles.join(', ')}</TableCell>
                  <TableCell>{user.enabled ? 'Активен' : 'Заблокирован'}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleUserEdit(user)} 
                      sx={{ color: '#7fdfd4', '&:hover': { color: '#5dbeae' } }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleUserDelete(user.id)}
                      sx={{ color: '#ff7675', '&:hover': { color: '#d63031' } }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#2d3436',
          fontWeight: 600,
          mb: 3
        }}>
          Управление заказами
        </Typography>
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3,
          border: '1px solid #f0f0f0',
          '& .MuiTableCell-head': {
            backgroundColor: '#7fdfd4',
            color: '#fff',
            fontWeight: 600
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'rgba(127,223,212,0.05)'
          }
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID заказа</TableCell>
                <TableCell>ID пользователя</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Адрес доставки</TableCell>
                <TableCell>Дата заказа</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.deliveryAddress}</TableCell>
                  <TableCell>{new Date(order.orderTime).toLocaleString()}</TableCell>
                  <TableCell>{order.totalAmount} ₽</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOrderEdit(order)}
                      sx={{ color: '#7fdfd4', '&:hover': { color: '#5dbeae' } }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOrderDelete(order.id)}
                      sx={{ color: '#ff7675', '&:hover': { color: '#d63031' } }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#2d3436',
          fontWeight: 600,
          borderBottom: '1px solid #eee',
          pb: 2
        }}>
          Редактировать пользователя
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Имя пользователя"
                value={selectedUser.username}
                onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Роли</InputLabel>
                <Select
                  multiple
                  value={selectedUser.roles}
                  onChange={(e) => setSelectedUser({ ...selectedUser, roles: e.target.value as string[] })}
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  <MenuItem value="ROLE_USER">Пользователь</MenuItem>
                  <MenuItem value="ROLE_ADMIN">Администратор</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={selectedUser.enabled ? 'enabled' : 'disabled'}
                  onChange={(e) => setSelectedUser({ ...selectedUser, enabled: e.target.value === 'enabled' })}
                >
                  <MenuItem value="enabled">Активен</MenuItem>
                  <MenuItem value="disabled">Заблокирован</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUserDialogOpen(false)}
            sx={{
              color: '#2d3436',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleUserSave} 
            variant="contained"
            sx={{
              backgroundColor: '#7fdfd4',
              color: '#fff',
              '&:hover': { backgroundColor: '#5dbeae' }
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={orderDialogOpen} 
        onClose={() => setOrderDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#2d3436',
          fontWeight: 600,
          borderBottom: '1px solid #eee',
          pb: 2
        }}>
          Изменить статус заказа
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Статус заказа</InputLabel>
                <Select
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                >
                  {orderStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOrderDialogOpen(false)}
            sx={{
              color: '#2d3436',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleOrderSave} 
            variant="contained"
            sx={{
              backgroundColor: '#7fdfd4',
              color: '#fff',
              '&:hover': { backgroundColor: '#5dbeae' }
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 