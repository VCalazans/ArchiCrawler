import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Configurações
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personalize sua experiência na plataforma ArchiCrawler
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, 1fr)',
          },
          gap: 4,
          mb: 4,
        }}
      >
        {/* Configurações Gerais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Configurações Gerais
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Ativar notificações por email"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Executar testes automaticamente"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Modo debug"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Salvar logs de execução"
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Configurações de Segurança */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 2, color: 'error.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Segurança
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Autenticação de dois fatores"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Timeout de sessão automático"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Permitir acesso externo"
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Button variant="outlined" color="primary" fullWidth>
                  Alterar Senha
                </Button>
                <Button variant="outlined" color="secondary" fullWidth>
                  Gerenciar API Keys
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Configurações de Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Interface
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch />}
                  label="Tema escuro"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Animações"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Sons de notificação"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Modo compacto"
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Configurações de Notificações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notificações
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Notificar quando teste finalizar"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Notificar falhas de execução"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Relatórios semanais"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Alertas de sistema"
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Button variant="outlined" color="primary" fullWidth>
                  Configurar Webhooks
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Botões de Ação */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" color="secondary">
          Cancelar
        </Button>
        <Button variant="contained" color="primary">
          Salvar Configurações
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage; 