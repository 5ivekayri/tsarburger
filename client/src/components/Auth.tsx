import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка при авторизации');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Paper elevation={0} sx={{ 
        width: '100%',
        p: 4,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        border: '1px solid rgba(127,223,212,0.1)'
      }}>
        <Typography variant="h4" align="center" sx={{ 
          mb: 4,
          color: '#2d3436',
          fontWeight: 600,
          fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
          {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255,0,0,0.05)',
            color: '#d63031',
            border: '1px solid rgba(214,48,49,0.1)'
          }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Имя пользователя"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: '#F5F5DC',
                '& fieldset': { borderColor: 'rgba(127,223,212,0.2)' },
                '&:hover fieldset': { borderColor: '#7FDFD4' },
                '&.Mui-focused fieldset': { borderColor: '#7FDFD4' }
              }
            }}
          />

          {!isLogin && (
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  backgroundColor: '#F5F5DC',
                  '& fieldset': { borderColor: 'rgba(127,223,212,0.2)' },
                  '&:hover fieldset': { borderColor: '#7FDFD4' },
                  '&.Mui-focused fieldset': { borderColor: '#7FDFD4' }
                }
              }}
            />
          )}

          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: '#F5F5DC',
                '& fieldset': { borderColor: 'rgba(127,223,212,0.2)' },
                '&:hover fieldset': { borderColor: '#7FDFD4' },
                '&.Mui-focused fieldset': { borderColor: '#7FDFD4' }
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: '#7FDFD4',
              color: '#FFFFFF',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#5dbeae',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(127,223,212,0.2)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => setIsLogin(!isLogin)}
            sx={{
              color: '#7FDFD4',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(127,223,212,0.05)'
              }
            }}
          >
            {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт? Войти'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Auth; 