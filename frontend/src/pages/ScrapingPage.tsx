import React, { useState, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Screenshot as ScreenshotIcon,
  PictureAsPdf as PdfIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useExtractData, useTakeScreenshot, useGeneratePDF, useEvaluateScript, useAvailableEngines } from '../hooks/useScraper';
import type { ScrapeRequest, ScreenshotRequest, EngineType } from '../types';

const ScrapingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [engine, setEngine] = useState<EngineType>('playwright');
  const [script, setScript] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Opções avançadas
  const [options, setOptions] = useState({
    headless: true,
    timeout: 30000,
    userAgent: '',
    width: 1280,
    height: 720,
    waitForSelector: '',
    fullPage: false,
    quality: 90,
    format: 'png' as 'png' | 'jpeg',
  });

  const { data: enginesData } = useAvailableEngines();
  const extractDataMutation = useExtractData();
  const takeScreenshotMutation = useTakeScreenshot();
  const generatePDFMutation = useGeneratePDF();
  const evaluateScriptMutation = useEvaluateScript();

  const resultRef = useRef<HTMLDivElement>(null);

  const availableEngines = enginesData?.availableEngines || ['playwright', 'puppeteer'];

  const handleExtractData = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const request: ScrapeRequest = {
        url,
        selector: selector || undefined,
        engine,
        waitForSelector: options.waitForSelector || undefined,
        options: {
          headless: options.headless,
          timeout: options.timeout,
          userAgent: options.userAgent || undefined,
          width: options.width,
          height: options.height,
        },
      };

      const response = await extractDataMutation.mutateAsync(request);
      setResult(response);
    } catch (error) {
      console.error('Erro na extração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeScreenshot = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const request: ScreenshotRequest = {
        url,
        selector: selector || undefined,
        engine,
        options: {
          headless: options.headless,
          timeout: options.timeout,
          width: options.width,
          height: options.height,
          fullPage: options.fullPage,
          quality: options.quality,
          format: options.format,
        },
      };

      const blob = await takeScreenshotMutation.mutateAsync(request);
      
      // Criar URL do blob e fazer download
      const url_download = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_download;
      a.download = `screenshot-${Date.now()}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url_download);
      
      setResult({ success: true, message: 'Screenshot baixado com sucesso!' });
    } catch (error) {
      console.error('Erro no screenshot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const blob = await generatePDFMutation.mutateAsync({
        url,
        options: {
          width: options.width,
          height: options.height,
        },
      });
      
      // Criar URL do blob e fazer download
      const url_download = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_download;
      a.download = `page-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url_download);
      
      setResult({ success: true, message: 'PDF baixado com sucesso!' });
    } catch (error) {
      console.error('Erro na geração do PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateScript = async () => {
    if (!url.trim() || !script.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await evaluateScriptMutation.mutateAsync({
        url,
        script,
        engine,
        options: {
          headless: options.headless,
          timeout: options.timeout,
          width: options.width,
          height: options.height,
        },
      });
      
      setResult(response);
    } catch (error) {
      console.error('Erro na execução do script:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Paper sx={{ p: 3, mt: 3 }} ref={resultRef}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Resultado</Typography>
          <Tooltip title="Expandir">
            <IconButton size="small">
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            p: 2,
            borderRadius: 1,
            maxHeight: 400,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
        Web Scraping
      </Typography>

      <Grid container spacing={4}>
        {/* Painel de Controle */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ position: 'sticky', top: 24 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Configuração
                </Typography>

                {/* URL */}
                <TextField
                  fullWidth
                  label="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  sx={{ mb: 3 }}
                  helperText="URL da página que deseja analisar"
                />

                {/* Seletor CSS */}
                <TextField
                  fullWidth
                  label="Seletor CSS (opcional)"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  placeholder="body, .container, #main"
                  sx={{ mb: 3 }}
                  helperText="Elemento específico para extrair/capturar"
                />

                {/* Engine */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Engine</InputLabel>
                  <Select
                    value={engine}
                    label="Engine"
                    onChange={(e) => setEngine(e.target.value as EngineType)}
                  >
                    {availableEngines.map((eng) => (
                      <MenuItem key={eng} value={eng}>
                        {eng.charAt(0).toUpperCase() + eng.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Script para execução */}
                {activeTab === 3 && (
                  <TextField
                    fullWidth
                    label="JavaScript"
                    multiline
                    rows={6}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="document.title"
                    sx={{ mb: 3, fontFamily: 'monospace' }}
                    helperText="Código JavaScript para executar na página"
                  />
                )}

                {/* Opções Avançadas */}
                <Accordion sx={{ mb: 3 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">
                      <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Opções Avançadas
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={options.headless}
                            onChange={(e) => setOptions({ ...options, headless: e.target.checked })}
                          />
                        }
                        label="Modo Headless"
                      />
                      
                      <TextField
                        label="Timeout (ms)"
                        type="number"
                        value={options.timeout}
                        onChange={(e) => setOptions({ ...options, timeout: parseInt(e.target.value) || 30000 })}
                        size="small"
                      />
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Largura"
                          type="number"
                          value={options.width}
                          onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) || 1280 })}
                          size="small"
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Altura"
                          type="number"
                          value={options.height}
                          onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value) || 720 })}
                          size="small"
                          sx={{ flex: 1 }}
                        />
                      </Box>

                      {activeTab === 1 && (
                        <>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={options.fullPage}
                                onChange={(e) => setOptions({ ...options, fullPage: e.target.checked })}
                              />
                            }
                            label="Página Completa"
                          />
                          
                          <FormControl size="small">
                            <InputLabel>Formato</InputLabel>
                            <Select
                              value={options.format}
                              label="Formato"
                              onChange={(e) => setOptions({ ...options, format: e.target.value as 'png' | 'jpeg' })}
                            >
                              <MenuItem value="png">PNG</MenuItem>
                              <MenuItem value="jpeg">JPEG</MenuItem>
                            </Select>
                          </FormControl>

                          <TextField
                            label="Qualidade (1-100)"
                            type="number"
                            value={options.quality}
                            onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) || 90 })}
                            size="small"
                            inputProps={{ min: 1, max: 100 }}
                          />
                        </>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Botões de Ação */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleExtractData}
                    disabled={isLoading || !url.trim()}
                    fullWidth
                  >
                    {isLoading && activeTab === 0 ? <CircularProgress size={20} /> : 'Extrair Dados'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ScreenshotIcon />}
                    onClick={handleTakeScreenshot}
                    disabled={isLoading || !url.trim()}
                    fullWidth
                  >
                    {isLoading && activeTab === 1 ? <CircularProgress size={20} /> : 'Capturar Screenshot'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    onClick={handleGeneratePDF}
                    disabled={isLoading || !url.trim()}
                    fullWidth
                  >
                    {isLoading && activeTab === 2 ? <CircularProgress size={20} /> : 'Gerar PDF'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<CodeIcon />}
                    onClick={handleEvaluateScript}
                    disabled={isLoading || !url.trim() || !script.trim()}
                    fullWidth
                  >
                    {isLoading && activeTab === 3 ? <CircularProgress size={20} /> : 'Executar Script'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Área de Resultado */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ minHeight: 600 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Preview & Resultados
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`Engine: ${engine}`} size="small" />
                    <IconButton size="small" onClick={() => setResult(null)}>
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Box>

                {!result && !isLoading && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 300,
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Configure uma operação
                    </Typography>
                    <Typography variant="body2">
                      Insira uma URL e selecione uma ação para começar
                    </Typography>
                  </Box>
                )}

                {isLoading && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 300,
                    }}
                  >
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      Processando...
                    </Typography>
                  </Box>
                )}

                {renderResult()}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ScrapingPage; 