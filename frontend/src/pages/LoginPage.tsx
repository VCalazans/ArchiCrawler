import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Container,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box
      className="min-h-screen flex items-center justify-center gradient-bg"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Box sx={{ p: 4 }}>
              <Box textAlign="center" mb={4}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                  ArchiCrawler
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Plataforma de Testes de Interface
                </Typography>
              </Box>

              <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <CardContent sx={{ p: 0 }}>
                  <form onSubmit={handleSubmit}>
                    <Box mb={3}>
                      <TextField
                        fullWidth
                        label="Usuário"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>

                    <Box mb={3}>
                      <TextField
                        fullWidth
                        label="Senha"
                        name="password"
                        type="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>

                    {error && (
                      <Box mb={3}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          {error}
                        </Alert>
                      </Box>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #3b82f6 30%, #1d4ed8 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #2563eb 30%, #1e40af 90%)',
                        }
                      }}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>

                  <Box mt={3} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Não tem uma conta?{' '}
                      <Link 
                        to="/register" 
                        className="text-primary-600 hover:text-primary-700 font-medium"
                        style={{ textDecoration: 'none' }}
                      >
                        Registre-se aqui
                      </Link>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage; 