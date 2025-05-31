import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  Play,
  Pause,
  StopCircle,
  Eye,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Image,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
import { TestExecutionResult } from '../../types/llm-tests';

// Hooks
import { useTestExecutions, useLLMNotifications } from '../../hooks/useLLMTests';

const LLMTestExecutions: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [selectedExecution, setSelectedExecution] = useState<TestExecutionResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { executions, isLoading, stopExecution, isStopping } = useTestExecutions();
  const { addNotification } = useLLMNotifications();

  const handleStopExecution = (executionId: string) => {
    stopExecution(executionId, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Execução Interrompida',
          message: 'A execução foi interrompida com sucesso.',
        });
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Erro ao Interromper',
          message: 'Não foi possível interromper a execução.',
        });
      },
    });
  };

  const handleViewDetails = (execution: TestExecutionResult) => {
    setSelectedExecution(execution);
    setDetailsOpen(true);
  };

  const getStatusColor = (success: boolean, completedAt?: Date) => {
    if (!completedAt) return 'warning'; // Running
    return success ? 'success' : 'error';
  };

  const getStatusLabel = (success: boolean, completedAt?: Date) => {
    if (!completedAt) return 'Executando';
    return success ? 'Concluído' : 'Falhou';
  };

  const getStatusIcon = (success: boolean, completedAt?: Date) => {
    if (!completedAt) return <Clock size={16} />;
    return success ? <CheckCircle size={16} /> : <XCircle size={16} />;
  };

  const filteredExecutions = executions.filter((execution) => {
    const matchesSearch = execution.testId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         execution.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'running' && !execution.completedAt) ||
                         (statusFilter === 'completed' && execution.completedAt && execution.success) ||
                         (statusFilter === 'failed' && execution.completedAt && !execution.success);

    return matchesSearch && matchesStatus;
  });

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Header com filtros */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Histórico de Execuções
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {/* Busca */}
              <TextField
                size="small"
                placeholder="Buscar execuções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} className="mr-2 text-gray-400" />,
                }}
                sx={{ minWidth: 200 }}
              />

              {/* Filtro por status */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  label="Status"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="running">Executando</MenuItem>
                  <MenuItem value="completed">Concluído</MenuItem>
                  <MenuItem value="failed">Falhou</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                startIcon={<Filter size={16} />}
              >
                Limpar Filtros
              </Button>
            </Box>
          </Box>

          {/* Loading */}
          {isLoading && <LinearProgress />}

          {/* Tabela */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID da Execução</TableCell>
                  <TableCell>Teste</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Screenshots</TableCell>
                  <TableCell>Erros</TableCell>
                  <TableCell>Iniciado em</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExecutions.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma execução encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExecutions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((execution) => (
                      <TableRow
                        key={execution.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {execution.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {execution.testId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(execution.success, execution.completedAt)}
                            label={getStatusLabel(execution.success, execution.completedAt)}
                            size="small"
                            color={getStatusColor(execution.success, execution.completedAt)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDuration(execution.duration)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Image size={16} className="mr-1 text-gray-400" />
                            <Typography variant="body2">
                              {execution.screenshots.length}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {execution.errors.length > 0 ? (
                              <>
                                <XCircle size={16} className="mr-1 text-red-500" />
                                <Typography variant="body2" color="error">
                                  {execution.errors.length}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} className="mr-1 text-green-500" />
                                <Typography variant="body2" color="success.main">
                                  0
                                </Typography>
                              </>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(execution.startedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Ver detalhes">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(execution)}
                              >
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                            
                            {!execution.completedAt && (
                              <Tooltip title="Parar execução">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleStopExecution(execution.id)}
                                  disabled={isStopping}
                                >
                                  <StopCircle size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Download logs">
                              <IconButton size="small">
                                <Download size={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginação */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredExecutions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes da Execução
          {selectedExecution && (
            <Typography variant="body2" color="text.secondary">
              ID: {selectedExecution.id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedExecution && (
            <Box>
              {/* Informações gerais */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informações Gerais
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusIcon(selectedExecution.success, selectedExecution.completedAt)}
                      label={getStatusLabel(selectedExecution.success, selectedExecution.completedAt)}
                      size="small"
                      color={getStatusColor(selectedExecution.success, selectedExecution.completedAt)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Duração
                    </Typography>
                    <Typography variant="body2">
                      {formatDuration(selectedExecution.duration)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Iniciado em
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(selectedExecution.startedAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </Typography>
                  </Box>
                  {selectedExecution.completedAt && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Concluído em
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(selectedExecution.completedAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Screenshots */}
              {selectedExecution.screenshots.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Screenshots ({selectedExecution.screenshots.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedExecution.screenshots.map((screenshot, index) => (
                      <Chip
                        key={index}
                        icon={<Image size={16} />}
                        label={`Screenshot ${index + 1}`}
                        size="small"
                        variant="outlined"
                        clickable
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Erros */}
              {selectedExecution.errors.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="error">
                    Erros ({selectedExecution.errors.length})
                  </Typography>
                  <List sx={{ bgcolor: 'error.50', borderRadius: 1 }}>
                    {selectedExecution.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontFamily="monospace" color="error">
                              {error}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Logs */}
              {selectedExecution.logs.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Logs ({selectedExecution.logs.length})
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    {selectedExecution.logs.map((log, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        component="div"
                        sx={{ mb: 0.5 }}
                      >
                        {log}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Comandos MCP */}
              {selectedExecution.mcpCommandResults.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Comandos MCP ({selectedExecution.mcpCommandResults.length})
                  </Typography>
                  <List>
                    {selectedExecution.mcpCommandResults.map((result, index) => (
                      <ListItem key={index} sx={{ bgcolor: result.success ? 'success.50' : 'error.50', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={500}>
                                {result.command.action}
                                {result.command.selector && ` (${result.command.selector})`}
                              </Typography>
                              <Chip
                                icon={result.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                label={result.success ? 'Sucesso' : 'Falhou'}
                                size="small"
                                color={result.success ? 'success' : 'error'}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Duração: {formatDuration(result.duration)}
                              </Typography>
                              {result.error && (
                                <Typography variant="caption" color="error" display="block">
                                  Erro: {result.error}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
          <Button variant="outlined" startIcon={<Download size={16} />}>
            Download Completo
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default LLMTestExecutions; 