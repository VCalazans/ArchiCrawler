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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
} from '@mui/icons-material';
import { TestFlow, TestExecution } from '../../types';
import { useTestExecutions } from '../../hooks/useTestFlows';

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
      id={`test-flow-detail-tabpanel-${index}`}
      aria-labelledby={`test-flow-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface TestFlowDetailDialogProps {
  open: boolean;
  onClose: () => void;
  flow: TestFlow | null;
  onExecute?: (flowId: string) => void;
  onUpdateFlow?: (flow: TestFlow) => void;
}

const TestFlowDetailDialog: React.FC<TestFlowDetailDialogProps> = ({
  open,
  onClose,
  flow,
  onExecute,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const { data: executionsData } = useTestExecutions(flow?.id);
  const executions = executionsData?.data || [];

  if (!flow) return null;

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'navigate': return '🌐';
      case 'click': return '👆';
      case 'fill': return '✏️';
      case 'screenshot': return '📸';
      case 'wait': return '⏳';
      case 'assert': return '✅';
      case 'extract': return '📋';
      default: return '⚙️';
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
      default: 'default';
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
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="test flow detail tabs"
          >
            <Tab label="Passos" icon={<SettingsIcon />} iconPosition="start" />
            <Tab label="Execuções" icon={<PlayIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Aba de Passos */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">
              Passos do Fluxo ({flow.steps?.length || 0})
            </Typography>
          </Box>

          {!flow.steps || flow.steps.length === 0 ? (
            <Alert severity="info">
              Este fluxo ainda não possui passos configurados.
            </Alert>
          ) : (
            <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {flow.steps.map((step, index) => (
                <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ fontSize: '1.2em', mr: 1 }}>
                          {getStepIcon(step.type)}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {index + 1}. {step.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.type} • Timeout: {step.config.timeout || 'N/A'}ms
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Tipo:</strong> {step.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Timeout:</strong> {step.timeout}ms
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Configuração:</strong>
                        </Typography>
                        <Box sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                          <pre style={{ margin: 0, fontSize: '0.8em', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(step.config, null, 2)}
                          </pre>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Aba de Execuções */}
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
              {executions.map((execution, index) => (
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
                            {formatDate(execution.updatedAt)}
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
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Passos:</strong> {execution.completedSteps}/{execution.totalSteps} completados
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Falhas:</strong> {execution.failedSteps}
                        </Typography>
                        
                        {execution.steps && execution.steps.length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                              Detalhes dos Passos:
                            </Typography>
                            <List dense>
                              {execution.steps.map((step, stepIndex) => (
                                <ListItem key={stepIndex}>
                                  <ListItemText
                                    primary={`${stepIndex + 1}. ${step.stepId}`}
                                    secondary={
                                      <Box>
                                        <Typography variant="body2" component="span">
                                          Status: {step.status} • Duração: {step.duration}ms
                                        </Typography>
                                        {step.error && (
                                          <Typography variant="body2" color="error" component="div">
                                            Erro: {step.error}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />
                                  <ListItemSecondaryAction>
                                    <Chip
                                      label={step.status}
                                      color={step.status === 'success' ? 'success' : 'error'}
                                      size="small"
                                    />
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
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

export default TestFlowDetailDialog; 