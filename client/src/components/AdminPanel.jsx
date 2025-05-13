import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField, Grid, Card, CardContent, CardActions, IconButton, Box
} from '@mui/material';
import { Delete, Edit, Save, Add } from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const AdminPanel = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageBase64: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setMenuItems(data);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageBase64: reader.result }));
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setForm({ name: '', description: '', price: '', imageBase64: '', category: '' });
    setImageFile(null);
    fetchMenu();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item, imageBase64: item.imageBase64 || '' });
  };

  const handleSave = async (id) => {
    await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setEditingId(null);
    setForm({ name: '', description: '', price: '', imageBase64: '', category: '' });
    setImageFile(null);
    fetchMenu();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchMenu();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Админ-панель: Меню</Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Добавить новое блюдо</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}><TextField label="Название" name="name" value={form.name} onChange={handleInputChange} fullWidth /></Grid>
          <Grid item xs={12} sm={3}><TextField label="Описание" name="description" value={form.description} onChange={handleInputChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Категория" name="category" value={form.category} onChange={handleInputChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Цена" name="price" value={form.price} onChange={handleInputChange} type="number" fullWidth /></Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{ width: '100%' }}
            >
              Загрузить картинку
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {imageFile && <Typography variant="caption">{imageFile.name}</Typography>}
            <Typography variant="caption" color="textSecondary">
              Поддерживаются форматы: JPG, PNG, GIF
            </Typography>
          </Grid>
          <Grid item xs={12} sm={1}><Button variant="contained" color="primary" onClick={handleAdd} startIcon={<Add />}>Добавить</Button></Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              {item.imageBase64 && <img src={item.imageBase64} alt={item.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
              <CardContent>
                {editingId === item.id ? (
                  <>
                    <TextField label="Название" name="name" value={form.name} onChange={handleInputChange} fullWidth sx={{ mb: 1 }} />
                    <TextField label="Описание" name="description" value={form.description} onChange={handleInputChange} fullWidth sx={{ mb: 1 }} />
                    <TextField label="Категория" name="category" value={form.category} onChange={handleInputChange} fullWidth sx={{ mb: 1 }} />
                    <TextField label="Цена" name="price" value={form.price} onChange={handleInputChange} type="number" fullWidth sx={{ mb: 1 }} />
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                      sx={{ width: '100%', mt: 1 }}
                    >
                      Загрузить картинку
                      <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>
                    <Typography variant="caption" color="textSecondary">
                      Поддерживаются форматы: JPG, PNG, GIF
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography>{item.description}</Typography>
                    <Typography>Категория: {item.category}</Typography>
                    <Typography>Цена: {item.price} ₽</Typography>
                  </>
                )}
              </CardContent>
              <CardActions>
                {editingId === item.id ? (
                  <Button startIcon={<Save />} onClick={() => handleSave(item.id)}>Сохранить</Button>
                ) : (
                  <IconButton onClick={() => handleEdit(item)}><Edit /></IconButton>
                )}
                <IconButton onClick={() => handleDelete(item.id)}><Delete /></IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminPanel; 