import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { TestStep, TestStepType } from '../../types';

interface TestFlowStepEditorProps {
  steps: TestStep[];
  onStepsChange: (steps: TestStep[]) => void;
  readOnly?: boolean;
}

interface StepFormData {
  id: string;
  type: TestStepType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  timeout?: number;
  order: number;
  isEnabled: boolean;
}

const TestFlowStepEditor: React.FC<TestFlowStepEditorProps> = ({
  steps,
  onStepsChange,
  readOnly = false,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<StepFormData | null>(null);
  const [isNewStep, setIsNewStep] = useState(false);

  const stepTypes = [
    { value: TestStepType.NAVIGATE, label: 'Navegar para URL', icon: '🌐' },
    { value: TestStepType.CLICK, label: 'Clique em Elemento', icon: '👆' },
    { value: TestStepType.FILL, label: 'Preencher Campo', icon: '✏️' },
    { value: TestStepType.SCREENSHOT, label: 'Capturar Tela', icon: '📸' },
    { value: TestStepType.ASSERT, label: 'Validar Elemento', icon: '✅' },
    { value: TestStepType.EXTRACT, label: 'Extrair Dados', icon: '📊' },
    { value: TestStepType.WAIT, label: 'Aguardar', icon: '⏳' },
  ];

  const getStepIcon = (type: TestStepType) => {
    return stepTypes.find(st => st.value === type)?.icon || '⚙️';
  };

  const getStepLabel = (type: TestStepType) => {
    return stepTypes.find(st => st.value === type)?.label || type;
  };

  const handleAddStep = () => {
    const newStep: StepFormData = {
      id: `step-${Date.now()}`,
      type: TestStepType.NAVIGATE,
      name: '',
      description: '',
      config: {},
      timeout: 30000,
      order: steps.length,
      isEnabled: true,
    };
    setEditingStep(newStep);
    setIsNewStep(true);
    setEditDialogOpen(true);
  };

  const handleEditStep = (step: TestStep) => {
    setEditingStep({ ...step });
    setIsNewStep(false);
    setEditDialogOpen(true);
  };

  const handleDeleteStep = (stepId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este passo?')) {
      const updatedSteps = steps.filter(s => s.id !== stepId);
      onStepsChange(updatedSteps);
    }
  };

  const handleSaveStep = () => {
    if (!editingStep || !editingStep.name.trim()) {
      return;
    }

    let updatedSteps: TestStep[];
    
    if (isNewStep) {
      updatedSteps = [...steps, editingStep as TestStep];
    } else {
      updatedSteps = steps.map(s => s.id === editingStep.id ? editingStep as TestStep : s);
    }

    onStepsChange(updatedSteps);
    setEditDialogOpen(false);
    setEditingStep(null);
  };

  const renderStepConfigFields = () => {
    if (!editingStep) return null;

    switch (editingStep.type) {
      case TestStepType.NAVIGATE:
        return (
          <TextField
            label="URL"
            fullWidth
            value={editingStep.config.url || ''}
            onChange={(e) => setEditingStep(prev => prev ? {
              ...prev,
              config: { ...prev.config, url: e.target.value }
            } : null)}
            placeholder="https://example.com"
            sx={{ mb: 2 }}
          />
        );

      case TestStepType.CLICK:
      case TestStepType.ASSERT:
      case TestStepType.EXTRACT:
        return (
          <TextField
            label="Seletor CSS"
            fullWidth
            value={editingStep.config.selector || ''}
            onChange={(e) => setEditingStep(prev => prev ? {
              ...prev,
              config: { ...prev.config, selector: e.target.value }
            } : null)}
            placeholder="Ex: #botao-submit, .form-button, [data-testid='login']"
            sx={{ mb: 2 }}
          />
        );

      case TestStepType.FILL:
        return (
          <>
            <TextField
              label="Seletor CSS"
              fullWidth
              value={editingStep.config.selector || ''}
              onChange={(e) => setEditingStep(prev => prev ? {
                ...prev,
                config: { ...prev.config, selector: e.target.value }
              } : null)}
              placeholder="Ex: #email, .username, [name='password']"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Texto a Inserir"
              fullWidth
              value={editingStep.config.value || ''}
              onChange={(e) => setEditingStep(prev => prev ? {
                ...prev,
                config: { ...prev.config, value: e.target.value }
              } : null)}
              placeholder="Texto que será digitado no campo"
              sx={{ mb: 2 }}
            />
          </>
        );

      case TestStepType.WAIT:
        return (
          <TextField
            label="Tempo de Espera (ms)"
            type="number"
            fullWidth
            value={editingStep.config.timeout || 1000}
            onChange={(e) => setEditingStep(prev => prev ? {
              ...prev,
              config: { ...prev.config, timeout: parseInt(e.target.value) }
            } : null)}
            sx={{ mb: 2 }}
          />
        );

      case TestStepType.SCREENSHOT:
        return (
          <TextField
            label="Nome do Arquivo (opcional)"
            fullWidth
            value={editingStep.config.name || ''}
            onChange={(e) => setEditingStep(prev => prev ? {
              ...prev,
              config: { ...prev.config, name: e.target.value }
            } : null)}
            placeholder="screenshot-login"
            sx={{ mb: 2 }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Passos do Fluxo ({steps.length})
        </Typography>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStep}
            size="small"
          >
            Adicionar Passo
          </Button>
        )}
      </Box>

      {/* Lista de Passos */}
      {steps.length === 0 ? (
        <Alert severity="info">
          Nenhum passo configurado. Clique em "Adicionar Passo" para começar.
        </Alert>
      ) : (
        <Box>
          {steps.map((step, index) => (
            <Card key={step.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {!readOnly && (
                      <IconButton
                        size="small"
                        sx={{ mr: 1 }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <DragIcon />
                      </IconButton>
                    )}
                    <Typography sx={{ fontSize: '1.2em', mr: 1 }}>
                      {getStepIcon(step.type)}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {index + 1}. {step.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getStepLabel(step.type)} • Timeout: {step.config.timeout || 30000}ms
                      </Typography>
                    </Box>
                    <Chip 
                      label={step.isEnabled ? 'Ativo' : 'Inativo'} 
                      color={step.isEnabled ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Descrição:</strong> {step.description || 'Sem descrição'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Configuração:</strong>
                    </Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1, mb: 2 }}>
                      <pre style={{ margin: 0, fontSize: '0.8em', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(step.config, null, 2)}
                      </pre>
                    </Box>
                    
                    {!readOnly && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditStep(step)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteStep(step.id)}
                        >
                          Excluir
                        </Button>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog de Edição/Criação */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isNewStep ? 'Adicionar Novo Passo' : 'Editar Passo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome do Passo"
              fullWidth
              value={editingStep?.name || ''}
              onChange={(e) => setEditingStep(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Ex: Login no sistema, Preencher formulário"
            />

            <TextField
              label="Descrição (opcional)"
              fullWidth
              multiline
              rows={2}
              value={editingStep?.description || ''}
              onChange={(e) => setEditingStep(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="Descrição detalhada do que este passo faz"
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de Ação</InputLabel>
              <Select
                value={editingStep?.type || TestStepType.NAVIGATE}
                label="Tipo de Ação"
                onChange={(e) => setEditingStep(prev => prev ? { 
                  ...prev, 
                  type: e.target.value as TestStepType,
                  config: {} // Reset config when changing type
                } : null)}
              >
                {stepTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {renderStepConfigFields()}

            <TextField
              label="Timeout (ms)"
              type="number"
              fullWidth
              value={editingStep?.timeout || 30000}
              onChange={(e) => setEditingStep(prev => prev ? { 
                ...prev, 
                timeout: parseInt(e.target.value) 
              } : null)}
              inputProps={{ min: 1000, max: 300000 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveStep} 
            variant="contained"
            disabled={!editingStep?.name.trim()}
          >
            {isNewStep ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestFlowStepEditor; 