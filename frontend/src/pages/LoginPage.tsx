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
  Paper,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff, Terminal, Code, Security } from '@mui/icons-material';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const featureItems = [
    { icon: <Terminal />, title: 'Automação Avançada', description: 'Testes automatizados de interface' },
    { icon: <Code />, title: 'Web Scraping', description: 'Extração inteligente de dados' },
    { icon: <Security />, title: 'Seguro & Confiável', description: 'Plataforma robusta e segura' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Background Effects */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: { xs: 4, lg: 8 },
            alignItems: 'center',
            maxWidth: '1200px',
            mx: 'auto'
          }}
        >
          {/* Left Side - Branding and Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: { xs: 'center', lg: 'left' }, mb: { xs: 4, lg: 0 } }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  mb: 2, 
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.1
                }}
              >
                ArchiCrawler
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#94a3b8',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                  fontWeight: 400
                }}
              >
                Plataforma Avançada de Testes de Interface e Web Scraping
              </Typography>

              {/* Features Grid */}
              <Box 
                sx={{ 
                  display: { xs: 'none', lg: 'grid' },
                  gridTemplateColumns: '1fr',
                  gap: 3,
                  mt: 4
                }}
              >
                {featureItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(16, 185, 129, 0.1)',
                          transform: 'translateX(8px)'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#e2e8f0', fontSize: '1rem', mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(51, 65, 85, 0.3)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Gradient overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)'
                }}
              />

              <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Box textAlign="center" mb={4}>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#f8fafc',
                      fontSize: { xs: '1.75rem', sm: '2rem' }
                    }}
                  >
                    Bem-vindo de volta
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#94a3b8',
                      fontSize: { xs: '0.95rem', sm: '1rem' }
                    }}
                  >
                    Entre na sua conta para continuar
                  </Typography>
                </Box>

                <Card 
                  elevation={0} 
                  sx={{ 
                    backgroundColor: 'transparent',
                    backgroundImage: 'none'
                  }}
                >
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
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }
                          }}
                        />
                      </Box>

                      <Box mb={3}>
                        <TextField
                          fullWidth
                          label="Senha"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={credentials.password}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={togglePasswordVisibility}
                                  edge="end"
                                  sx={{ color: '#94a3b8' }}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }
                          }}
                        />
                      </Box>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Box mb={3}>
                            <Alert 
                              severity="error" 
                              sx={{ 
                                borderRadius: 2,
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                '& .MuiAlert-icon': {
                                  color: '#ef4444'
                                }
                              }}
                            >
                              {error}
                            </Alert>
                          </Box>
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{
                          py: { xs: 1.5, sm: 2 },
                          borderRadius: 3,
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          fontWeight: 600,
                          textTransform: 'none',
                          mb: 3
                        }}
                      >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>

                    <Box textAlign="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#94a3b8',
                          fontSize: { xs: '0.875rem', sm: '0.95rem' }
                        }}
                      >
                        Não tem uma conta?{' '}
                        <Link 
                          to="/register" 
                          style={{ 
                            color: '#10b981',
                            textDecoration: 'none',
                            fontWeight: 600,
                            transition: 'color 0.2s ease'
                          }}
                          onMouseOver={(e) => (e.target as HTMLElement).style.color = '#34d399'}
                          onMouseOut={(e) => (e.target as HTMLElement).style.color = '#10b981'}
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
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage; 