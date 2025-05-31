import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  Stack
} from '@mui/material';
import { 
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { DynamicTestChat } from '../components/LLMTests/DynamicTestChat';

export const DynamicTestPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AutoAwesomeIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Sistema de Testes Dinâmicos
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Assistente IA que entende objetivos e executa testes automaticamente
              </Typography>
            </Box>
          </Box>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <PsychologyIcon />
              <Typography variant="body2">
                <strong>Inteligente:</strong> Entende linguagem natural
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <SpeedIcon />
              <Typography variant="body2">
                <strong>Dinâmico:</strong> Adapta-se em tempo real
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <VisibilityIcon />
              <Typography variant="body2">
                <strong>Visual:</strong> Feedback com screenshots
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Chat Interface */}
          <Box sx={{ flex: { lg: 2 }, minWidth: 0 }}>
            <Paper sx={{ 
              height: { xs: '60vh', lg: 'calc(100vh - 200px)' }, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <DynamicTestChat />
            </Paper>
          </Box>

          {/* Sidebar com informações */}
          <Box sx={{ flex: { lg: 1 }, minWidth: 0 }}>
            <Stack spacing={2}>
              
              {/* Quick Start */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🚀 Como Usar
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    1. Configure sua API key (ícone ⚙️)<br/>
                    2. Defina a URL do site alvo<br/>
                    3. Descreva o que quer testar<br/>
                    4. Assista a IA executar em tempo real!
                  </Typography>
                </CardContent>
              </Card>

              {/* Exemplos */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💡 Exemplos de Prompts
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip label="Login" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      "Teste se o login funciona no GitHub"
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip label="E-commerce" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      "Adicione um produto ao carrinho e vá para checkout"
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip label="Busca" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      "Teste se a função de busca funciona"
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip label="Navegação" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      "Navegue pelo menu principal e verifique todas as páginas"
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Características */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ✨ Características Únicas
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🧠 <strong>IA Conversacional:</strong> Como ChatGPT para testes
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔄 <strong>Adaptação Dinâmica:</strong> Muda estratégia baseado nos resultados
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      📸 <strong>Screenshots Automáticos:</strong> Captura visual de cada passo
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      ⚡ <strong>Tempo Real:</strong> Veja a IA pensando e executando
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Status Info */}
              <Alert severity="info">
                <AlertTitle>🔗 Integração com MCP</AlertTitle>
                Este sistema usa Model Context Protocol (MCP) para controlar navegadores web de forma inteligente, 
                permitindo que a IA veja e interaja com páginas web como um humano faria.
              </Alert>

              {/* Beta Notice */}
              <Alert severity="warning">
                <AlertTitle>🧪 Versão Beta</AlertTitle>
                Esta é uma versão experimental do sistema dinâmico. 
                Feedback e sugestões são muito bem-vindos!
              </Alert>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}; 