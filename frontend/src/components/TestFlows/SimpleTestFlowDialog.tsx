import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  Chip,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { TestFlow, TestStep } from '../../types';
import { useTestExecutions, useUpdateTestFlowSteps } from '../../hooks/useTestFlows';
import TestFlowStepEditor from './TestFlowStepEditor';

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
      id={`simple-test-flow-tabpanel-${index}`}
      aria-labelledby={`simple-test-flow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface SimpleTestFlowDialogProps {
  open: boolean;
  onClose: () => void;
  flow: TestFlow | null;
  onExecute?: (flowId: string) => void;
}

const SimpleTestFlowDialog: React.FC<SimpleTestFlowDialogProps> = ({
  open,
  onClose,
  flow,
  onExecute,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [localSteps, setLocalSteps] = useState<TestStep[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: executionsData } = useTestExecutions(flow?.id);
  const updateFlowMutation = useUpdateTestFlowSteps();
  const executions = executionsData?.data || [];

  // Sincronizar passos locais quando o fluxo mudar
  React.useEffect(() => {
    if (flow) {
      setLocalSteps((flow as any).steps || []);
      setHasUnsavedChanges(false);
    }
  }, [flow]);

  if (!flow) return null;

  const handleStepsChange = (newSteps: TestStep[]) => {
    setLocalSteps(newSteps);
    setHasUnsavedChanges(true);
  };

  const handleSaveSteps = async () => {
    if (!flow) return;

    try {
      await updateFlowMutation.mutateAsync({
        id: flow.id,
        steps: localSteps
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao salvar passos:', error);
    }
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'running': return <ScheduleIcon color="primary" />;
      case 'pending': return <ScheduleIcon color="warning" />;
      default: return <ScheduleIcon />;
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'running': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {flow.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flow.description || 'Sem descrição'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasUnsavedChanges && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSteps}
                disabled={updateFlowMutation.isPending}
                size="small"
              >
                Salvar Passos
              </Button>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {hasUnsavedChanges && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Você tem alterações não salvas nos passos. Clique em "Salvar Passos" para aplicar as mudanças.
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="simple test flow detail tabs"
          >
            <Tab label="Passos" icon={<SettingsIcon />} iconPosition="start" />
            <Tab label="Execuções" icon={<PlayIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TestFlowStepEditor
            steps={localSteps}
            onStepsChange={handleStepsChange}
            readOnly={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Histórico de Execuções ({executions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={() => onExecute?.(flow.id)}
              disabled={flow.status !== 'active'}
            >
              Executar Agora
            </Button>
          </Box>

          {executions.length === 0 ? (
            <Alert severity="info">
              Este fluxo ainda não foi executado.
            </Alert>
          ) : (
            <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {executions.map((execution: any, index: number) => (
                <Card key={execution.id} sx={{ mb: 2 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ mr: 2 }}>
                          {getExecutionStatusIcon(execution.status)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Execução #{index + 1}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(execution.updatedAt || execution.createdAt)}
                            {execution.duration && ` • ${execution.duration}ms`}
                          </Typography>
                        </Box>
                        <Chip
                          label={execution.status.toUpperCase()}
                          color={getExecutionStatusColor(execution.status) as any}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Status:</strong> {execution.status}
                        </Typography>
                        {execution.completedSteps !== undefined && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Passos:</strong> {execution.completedSteps}/{execution.totalSteps || 0} completados
                          </Typography>
                        )}
                        {execution.failedSteps !== undefined && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Falhas:</strong> {execution.failedSteps}
                          </Typography>
                        )}
                        {execution.error && (
                          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            <strong>Erro:</strong> {execution.error}
                          </Typography>
                        )}
                        
                        {execution.steps && execution.steps.length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                              Detalhes dos Passos:
                            </Typography>
                            <Box>
                              {execution.steps.map((step: any, stepIndex: number) => (
                                <Box key={stepIndex} sx={{ 
                                  p: 1, 
                                  mb: 1, 
                                  backgroundColor: step.status === 'success' ? '#e8f5e8' : '#ffebee',
                                  borderRadius: 1 
                                }}>
                                  <Typography variant="body2">
                                    <strong>{stepIndex + 1}. {step.stepId}</strong>
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Status: {step.status} • Duração: {step.duration || 0}ms
                                  </Typography>
                                  {step.error && (
                                    <Typography variant="body2" color="error">
                                      Erro: {step.error}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          </>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleTestFlowDialog; 