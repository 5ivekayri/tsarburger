import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField, Grid, Card, CardContent, CardActions, IconButton, Box, Alert
} from '@mui/material';
import { Delete, Edit, Save, Add } from '@mui/icons-material';
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

const AdminPanel: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <Typography variant="h4" gutterBottom>Админ-панель: Меню</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
            <TextField 
              label="Категория" 
              name="category" 
              value={form.category} 
              onChange={handleInputChange} 
              fullWidth 
              required
              error={!!error && !form.category}
            />
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
                    <TextField 
                      label="Категория" 
                      name="category" 
                      value={form.category} 
                      onChange={handleInputChange} 
                      fullWidth 
                      required
                      sx={{ mb: 1 }} 
                    />
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
    </Container>
  );
};

export default AdminPanel; 