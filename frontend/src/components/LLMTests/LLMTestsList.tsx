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
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Filter,
  MoreVertical,
  Play,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  Edit,
  Copy,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
import {
  GeneratedTest,
  TestType,
  TestStatus,
  LLMProvider,
  TestFilters,
} from '../../types/llm-tests';

// Hooks
import { useTests, useTestFilters, useLLMNotifications } from '../../hooks/useLLMTests';

const LLMTestsList: React.FC = () => {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTest, setSelectedTest] = useState<GeneratedTest | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { filters, updateFilters, clearFilters } = useTestFilters();
  const { tests, isLoading, deleteTest, regenerateTest, isDeleting, isRegenerating } = useTests({
    ...filters,
    search: searchTerm,
    page: page + 1,
    limit: rowsPerPage,
  });
  const { addNotification } = useLLMNotifications();

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = tests.map((test) => test.id);
      setSelectedTests(newSelected);
      return;
    }
    setSelectedTests([]);
  };

  const handleSelectTest = (id: string) => {
    const selectedIndex = selectedTests.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedTests, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedTests.slice(1));
    } else if (selectedIndex === selectedTests.length - 1) {
      newSelected = newSelected.concat(selectedTests.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedTests.slice(0, selectedIndex),
        selectedTests.slice(selectedIndex + 1),
      );
    }

    setSelectedTests(newSelected);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, test: GeneratedTest) => {
    setAnchorEl(event.currentTarget);
    setSelectedTest(test);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTest(null);
  };

  const handleDeleteTest = (id: string) => {
    deleteTest(id, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Teste Excluído',
          message: 'O teste foi excluído com sucesso.',
        });
        setSelectedTests(prev => prev.filter(testId => testId !== id));
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Erro ao Excluir',
          message: 'Não foi possível excluir o teste.',
        });
      },
    });
    handleMenuClose();
  };

  const handleRegenerateTest = (id: string) => {
    regenerateTest(id, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Teste Regenerado',
          message: 'Uma nova versão do teste foi gerada.',
        });
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Erro ao Regenerar',
          message: 'Não foi possível regenerar o teste.',
        });
      },
    });
    handleMenuClose();
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case TestStatus.VALIDATED: return 'success';
      case TestStatus.ACTIVE: return 'primary';
      case TestStatus.FAILED: return 'error';
      case TestStatus.DRAFT: return 'warning';
      case TestStatus.ARCHIVED: return 'default';
      default: return 'default';
    }
  };

  const getProviderColor = (provider: LLMProvider) => {
    switch (provider) {
      case LLMProvider.OPENAI: return '#10B981';
      case LLMProvider.ANTHROPIC: return '#8B5CF6';
      case LLMProvider.GEMINI: return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const isSelected = (id: string) => selectedTests.indexOf(id) !== -1;

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
              Meus Testes
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {/* Busca */}
              <TextField
                size="small"
                placeholder="Buscar testes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} className="mr-2 text-gray-400" />,
                }}
                sx={{ minWidth: 200 }}
              />

              {/* Filtro por tipo */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filters.testType || ''}
                  onChange={(e) => updateFilters({ testType: e.target.value as TestType || undefined })}
                  label="Tipo"
                >
                  <MenuItemComponent value="">Todos</MenuItemComponent>
                  {Object.values(TestType).map((type) => (
                    <MenuItemComponent key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </MenuItemComponent>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro por status */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ status: e.target.value as TestStatus || undefined })}
                  label="Status"
                >
                  <MenuItemComponent value="">Todos</MenuItemComponent>
                  {Object.values(TestStatus).map((status) => (
                    <MenuItemComponent key={status} value={status}>
                      {status.toUpperCase()}
                    </MenuItemComponent>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro por provedor */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Provedor</InputLabel>
                <Select
                  value={filters.llmProvider || ''}
                  onChange={(e) => updateFilters({ llmProvider: e.target.value as LLMProvider || undefined })}
                  label="Provedor"
                >
                  <MenuItemComponent value="">Todos</MenuItemComponent>
                  {Object.values(LLMProvider).map((provider) => (
                    <MenuItemComponent key={provider} value={provider}>
                      {provider.toUpperCase()}
                    </MenuItemComponent>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                startIcon={<Filter size={16} />}
              >
                Limpar Filtros
              </Button>
            </Box>

            {/* Ações em lote */}
            {selectedTests.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 size={16} />}
                  disabled={isDeleting}
                >
                  Excluir ({selectedTests.length})
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Download size={16} />}
                >
                  Exportar ({selectedTests.length})
                </Button>
              </Box>
            )}
          </Box>

          {/* Loading */}
          {isLoading && <LinearProgress />}

          {/* Tabela */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedTests.length > 0 && selectedTests.length < tests.length}
                      checked={tests.length > 0 && selectedTests.length === tests.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Provedor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum teste encontrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tests.map((test) => {
                    const isItemSelected = isSelected(test.id);
                    return (
                      <TableRow
                        key={test.id}
                        hover
                        selected={isItemSelected}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onChange={() => handleSelectTest(test.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {test.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {test.description.substring(0, 60)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={test.testType.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={test.llmProvider.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getProviderColor(test.llmProvider),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={test.status}
                            size="small"
                            color={getStatusColor(test.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {test.validationResult?.score ? `${test.validationResult.score}%` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(test.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Mais ações">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, test)}
                            >
                              <MoreVertical size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginação */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={tests.length} // Em uma implementação real, isso viria da API
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

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={handleMenuClose}>
          <Eye size={16} className="mr-2" />
          Visualizar
        </MenuItemComponent>
        <MenuItemComponent onClick={handleMenuClose}>
          <Edit size={16} className="mr-2" />
          Editar
        </MenuItemComponent>
        <MenuItemComponent onClick={handleMenuClose}>
          <Play size={16} className="mr-2" />
          Executar
        </MenuItemComponent>
        <MenuItemComponent onClick={handleMenuClose}>
          <Copy size={16} className="mr-2" />
          Duplicar
        </MenuItemComponent>
        <MenuItemComponent 
          onClick={() => selectedTest && handleRegenerateTest(selectedTest.id)}
          disabled={isRegenerating}
        >
          <RefreshCw size={16} className="mr-2" />
          Regenerar
        </MenuItemComponent>
        <MenuItemComponent onClick={handleMenuClose}>
          <Download size={16} className="mr-2" />
          Exportar
        </MenuItemComponent>
        <MenuItemComponent 
          onClick={() => selectedTest && handleDeleteTest(selectedTest.id)}
          disabled={isDeleting}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} className="mr-2" />
          Excluir
        </MenuItemComponent>
      </Menu>
    </motion.div>
  );
};

export default LLMTestsList; 