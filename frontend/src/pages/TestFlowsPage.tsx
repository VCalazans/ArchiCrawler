import React, { useState, Suspense } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
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
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AutoFixHigh as AutoIcon,
  CameraAlt as VisualIcon,
  Speed as PerformanceIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestFlows, useCreateTestFlow, useUpdateTestFlow, useDeleteTestFlow, useExecuteTestFlow } from '../hooks/useTestFlows';
import AutomatedTestSuite from '../components/TestBuilder/AutomatedTestSuite';
import VisualRegressionTester from '../components/TestBuilder/VisualRegressionTester';
import PerformanceMonitor from '../components/TestBuilder/PerformanceMonitor';
import TestFlowDetailDialog from '../components/TestFlows/SimpleTestFlowDialog';
import { TestFlowStatus, TestFlow } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
      id={`test-flows-tabpanel-${index}`}
      aria-labelledby={`test-flows-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TestFlowsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<TestFlow | null>(null);
  const [editingFlow, setEditingFlow] = useState<TestFlow | null>(null);
  const [newFlow, setNewFlow] = useState<{
    name: string;
    description: string;
    status: TestFlowStatus;
    steps: never[];
  }>({
    name: '',
    description: '',
    status: TestFlowStatus.DRAFT,
    steps: [],
  });

  const { user } = useAuth();
  const { data: testFlowsData, isLoading } = useTestFlows();
  const createFlowMutation = useCreateTestFlow();
  const updateFlowMutation = useUpdateTestFlow();
  const deleteFlowMutation = useDeleteTestFlow();
  const executeFlowMutation = useExecuteTestFlow();

  const testFlows = testFlowsData?.data || [];

  const handleCreateFlow = () => {
    if (newFlow.name.trim()) {
      const flowData = {
        ...newFlow,
        isActive: newFlow.status === TestFlowStatus.ACTIVE,
        userId: user?.id || '',
      };
      
      createFlowMutation.mutate(flowData);
      setCreateDialogOpen(false);
      setNewFlow({ name: '', description: '', status: TestFlowStatus.DRAFT, steps: [] });
    }
  };

  const handleEditFlow = (flow: TestFlow) => {
    setEditingFlow(flow);
    setEditDialogOpen(true);
  };

  const handleViewFlow = (flow: TestFlow) => {
    setSelectedFlow(flow);
    setDetailDialogOpen(true);
  };

  const handleUpdateFlow = () => {
    if (editingFlow && editingFlow.name.trim()) {
      updateFlowMutation.mutate({ 
        id: editingFlow.id, 
        flow: {
          name: editingFlow.name,
          description: editingFlow.description,
          status: editingFlow.status,
          isActive: editingFlow.status === TestFlowStatus.ACTIVE,
        }
      });
      setEditDialogOpen(false);
      setEditingFlow(null);
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
      case TestFlowStatus.ACTIVE: return 'success';
      case TestFlowStatus.DRAFT: return 'default';
      case TestFlowStatus.PAUSED: return 'warning';
      case TestFlowStatus.ARCHIVED: return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: TestFlowStatus) => {
    switch (status) {
      case TestFlowStatus.ACTIVE: return 'Ativo';
      case TestFlowStatus.DRAFT: return 'Rascunho';
      case TestFlowStatus.PAUSED: return 'Pausado';
      case TestFlowStatus.ARCHIVED: return 'Arquivado';
      default: return status;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Centro de Testes Automatizados
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="test flows tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="Fluxos Salvos" 
            icon={<ViewIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            label="Criador de Testes" 
            icon={<AutoIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            label="Testes Visuais" 
            icon={<VisualIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            label="Monitor Performance" 
            icon={<PerformanceIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Fluxos de Teste Salvos
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

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <AnimatePresence>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {testFlows.map((flow, index) => (
                <Box key={flow.id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.333% - 16px)' } }}>
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
                            color="info"
                            onClick={() => handleViewFlow(flow)}
                            title="Ver Detalhes"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleExecuteFlow(flow.id)}
                            disabled={executeFlowMutation.isPending || flow.status !== TestFlowStatus.ACTIVE}
                            title="Executar"
                          >
                            <PlayIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => handleEditFlow(flow)}
                            title="Editar"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFlow(flow.id)}
                            disabled={deleteFlowMutation.isPending}
                            title="Excluir"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              ))}
            </Box>
          </AnimatePresence>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Suspense fallback={<CircularProgress />}>
          <AutomatedTestSuite />
        </Suspense>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Suspense fallback={<CircularProgress />}>
          <VisualRegressionTester />
        </Suspense>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Suspense fallback={<CircularProgress />}>
          <PerformanceMonitor />
        </Suspense>
      </TabPanel>

      {/* Dialog de Criação */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Novo Fluxo de Teste</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Nome do Fluxo"
              fullWidth
              value={newFlow.name}
              onChange={(e) => setNewFlow(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={newFlow.description}
              onChange={(e) => setNewFlow(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Status Inicial</InputLabel>
              <Select
                value={newFlow.status}
                label="Status Inicial"
                onChange={(e) => setNewFlow(prev => ({ ...prev, status: e.target.value as TestFlowStatus }))}
              >
                <MenuItem value={TestFlowStatus.DRAFT}>Rascunho</MenuItem>
                <MenuItem value={TestFlowStatus.ACTIVE}>Ativo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateFlow} variant="contained">Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Fluxo de Teste</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Nome do Fluxo"
              fullWidth
              value={editingFlow?.name || ''}
              onChange={(e) => setEditingFlow(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={editingFlow?.description || ''}
              onChange={(e) => setEditingFlow(prev => prev ? { ...prev, description: e.target.value } : null)}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingFlow?.status || TestFlowStatus.DRAFT}
                label="Status"
                onChange={(e) => setEditingFlow(prev => prev ? { ...prev, status: e.target.value as TestFlowStatus } : null)}
              >
                <MenuItem value={TestFlowStatus.DRAFT}>Rascunho</MenuItem>
                <MenuItem value={TestFlowStatus.ACTIVE}>Ativo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdateFlow} variant="contained">Atualizar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <TestFlowDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        flow={selectedFlow}
        onExecute={handleExecuteFlow}
      />
    </Container>
  );
};

export default TestFlowsPage; 