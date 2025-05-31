import React, { useState, Suspense } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Fab,
  CircularProgress,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestFlows, useCreateTestFlow, useDeleteTestFlow, useExecuteTestFlow } from '../hooks/useTestFlows';
import type { TestFlow, TestStep, TestStepType, TestFlowStatus } from '../types';

const TestFlowsPage: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<TestFlow | null>(null);
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    status: 'draft' as TestFlowStatus,
    steps: [] as TestStep[],
  });

  const { data: testFlowsData, isLoading } = useTestFlows();
  const createFlowMutation = useCreateTestFlow();
  const deleteFlowMutation = useDeleteTestFlow();
  const executeFlowMutation = useExecuteTestFlow();

  const testFlows = testFlowsData?.data || [];

  const handleCreateFlow = () => {
    if (newFlow.name.trim()) {
      createFlowMutation.mutate({
        ...newFlow,
        userId: 'current-user', // TODO: Pegar do contexto de auth
        isActive: newFlow.status === 'active',
      });
      setCreateDialogOpen(false);
      setNewFlow({ name: '', description: '', status: 'draft', steps: [] });
    }
  };

  const handleDeleteFlow = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fluxo?')) {
      deleteFlowMutation.mutate(id);
    }
  };

  const handleExecuteFlow = (id: string) => {
    executeFlowMutation.mutate(id);
  };

  const getStatusColor = (status: TestFlowStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'default';
      case 'paused': return 'warning';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: TestFlowStatus) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'paused': return 'Pausado';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Fluxos de Teste
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Novo Fluxo
        </Button>
      </Box>

      <AnimatePresence>
        <Grid container spacing={3}>
          {testFlows.map((flow, index) => (
            <Grid item xs={12} md={6} lg={4} key={flow.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, flex: 1 }}>
                        {flow.name}
                      </Typography>
                      <Chip 
                        label={getStatusLabel(flow.status)}
                        color={getStatusColor(flow.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {flow.description || 'Sem descrição'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {flow.steps.length} passos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {flow.lastRun ? `Última execução: ${new Date(flow.lastRun).toLocaleDateString()}` : 'Nunca executado'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleExecuteFlow(flow.id)}
                        disabled={executeFlowMutation.isPending || flow.status !== 'active'}
                      >
                        <PlayIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="default"
                        onClick={() => setEditingFlow(flow)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteFlow(flow.id)}
                        disabled={deleteFlowMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </AnimatePresence>

      {testFlows.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Nenhum fluxo de teste encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crie seu primeiro fluxo de teste para começar
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Criar Primeiro Fluxo
          </Button>
        </Box>
      )}

      {/* Dialog de Criação */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Criar Novo Fluxo de Teste</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Nome do Fluxo"
              fullWidth
              value={newFlow.name}
              onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
              placeholder="Ex: Teste de Login"
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={newFlow.description}
              onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
              placeholder="Descreva o que este fluxo irá testar..."
            />
            <FormControl fullWidth>
              <InputLabel>Status Inicial</InputLabel>
              <Select
                value={newFlow.status}
                label="Status Inicial"
                onChange={(e) => setNewFlow({ ...newFlow, status: e.target.value as TestFlowStatus })}
              >
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="paused">Pausado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateFlow}
            variant="contained"
            disabled={!newFlow.name.trim() || createFlowMutation.isPending}
          >
            {createFlowMutation.isPending ? <CircularProgress size={20} /> : 'Criar Fluxo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="adicionar fluxo"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default TestFlowsPage; 