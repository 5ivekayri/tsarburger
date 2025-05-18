import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField, Grid, Card, CardContent, CardActions, IconButton, Box, Alert,
  Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Delete, Edit, Save, Add, Person, ShoppingCart } from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
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
  const orderStatuses = ["PENDING", "PREPARING", "READY", "DELIVERED"];

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
    const init = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/menu', {
          headers: {
            'Authorization': `Bearer ${token}`
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
        console.error('Error initializing admin panel:', error);
        setError('Ошибка при загрузке меню');
      }
    };

    init();
  }, [token, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке пользователей');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Ошибка при загрузке пользователей');
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
        throw new Error('Ошибка при загрузке заказов');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
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
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedUser)
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении пользователя');
      }

      setUserDialogOpen(false);
      fetchUsers();
    } catch (error) {
      setError('Ошибка при обновлении пользователя');
    }
  };

  const handleOrderSave = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: selectedOrder.status })
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении заказа');
      }

      setOrderDialogOpen(false);
      fetchOrders();
    } catch (error) {
      setError('Ошибка при обновлении заказа');
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении пользователя');
      }

      fetchUsers();
    } catch (error) {
      setError('Ошибка при удалении пользователя');
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Админ-панель</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<ShoppingCart />} label="Меню" />
          <Tab icon={<Person />} label="Пользователи" />
          <Tab icon={<ShoppingCart />} label="Заказы" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Добавить новое блюдо</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={2}>
              <TextField 
                label="Название" 
                name="name" 
                value={form.name} 
                onChange={handleInputChange} 
                fullWidth 
                required
                error={!!error && !form.name}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField 
                label="Описание" 
                name="description" 
                value={form.description} 
                onChange={handleInputChange} 
                fullWidth 
                required
                error={!!error && !form.description}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth required error={!!error && !form.category}>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={form.category}
                  label="Категория"
                  name="category"
                  onChange={handleSelectChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField 
                label="Цена" 
                name="price" 
                value={form.price} 
                onChange={handleInputChange} 
                type="number" 
                fullWidth 
                required
                error={!!error && !form.price}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ width: '100%' }}
              >
                Загрузить картинку
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  onChange={handleImageChange} 
                />
              </Button>
              {imageFile && <Typography variant="caption">{imageFile.name}</Typography>}
              <Typography variant="caption" color="textSecondary">
                Поддерживаются форматы: JPG, PNG, GIF (до 5MB)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAdd} 
                startIcon={<Add />}
              >
                Добавить
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                {item.imageBase64 && (
                  <img 
                    src={item.imageBase64} 
                    alt={item.name} 
                    style={{ width: '100%', height: 180, objectFit: 'cover' }} 
                  />
                )}
                <CardContent>
                  {editingId === item.id ? (
                    <>
                      <TextField 
                        label="Название" 
                        name="name" 
                        value={form.name} 
                        onChange={handleInputChange} 
                        fullWidth 
                        required
                        sx={{ mb: 1 }} 
                      />
                      <TextField 
                        label="Описание" 
                        name="description" 
                        value={form.description} 
                        onChange={handleInputChange} 
                        fullWidth 
                        required
                        sx={{ mb: 1 }} 
                      />
                      <FormControl fullWidth required sx={{ mb: 1 }}>
                        <InputLabel>Категория</InputLabel>
                        <Select
                          value={form.category}
                          label="Категория"
                          name="category"
                          onChange={handleSelectChange}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField 
                        label="Цена" 
                        name="price" 
                        value={form.price} 
                        onChange={handleInputChange} 
                        type="number" 
                        fullWidth 
                        required
                        sx={{ mb: 1 }} 
                      />
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCamera />}
                        sx={{ width: '100%', mb: 1 }}
                      >
                        Загрузить картинку
                        <input 
                          type="file" 
                          accept="image/*" 
                          hidden 
                          onChange={handleImageChange} 
                        />
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => handleSave(item.id)}
                        startIcon={<Save />}
                        fullWidth
                      >
                        Сохранить
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography color="textSecondary">{item.description}</Typography>
                      <Typography>Категория: {item.category}</Typography>
                      <Typography>Цена: {item.price} ₽</Typography>
                      <CardActions>
                        <IconButton onClick={() => handleEdit(item)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.id)} color="error">
                          <Delete />
                        </IconButton>
                      </CardActions>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>Управление пользователями</Typography>
        <TableContainer component={Paper}>
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
                    <IconButton onClick={() => handleUserEdit(user)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleUserDelete(user.id)} color="error">
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
        <Typography variant="h6" gutterBottom>Управление заказами</Typography>
        <TableContainer component={Paper}>
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
                    <IconButton onClick={() => handleOrderEdit(order)} color="primary">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
        <DialogTitle>Редактировать пользователя</DialogTitle>
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
          <Button onClick={() => setUserDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleUserSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)}>
        <DialogTitle>Изменить статус заказа</DialogTitle>
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
          <Button onClick={() => setOrderDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleOrderSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 