# 🔧 Guia de Solução de Problemas - Frontend ArchiCrawler

## 🚨 **Problemas Comuns e Soluções**

### **1. ❌ Erro de Ícone Material-UI**
```
SyntaxError: The requested module does not provide an export named 'Smart'
```

**Causa:** Ícone não existe no Material-UI Icons  
**Solução:** Verificar ícones disponíveis em https://mui.com/material-ui/material-icons/

```typescript
// ❌ Incorreto
import { Smart as SmartIcon } from '@mui/icons-material';

// ✅ Correto
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
```

### **2. 🔗 Erro de Conexão API**
```
Error: Network Error / CORS
```

**Causa:** Backend não está rodando ou problemas de CORS  
**Soluções:**
```bash
# 1. Verificar se backend está rodando
cd backend && npm run dev

# 2. Verificar URL no frontend
# Em dynamic-test-api.ts
private baseURL = 'http://localhost:3000'; // Porta correta?

# 3. Verificar CORS no backend
# No main.ts do NestJS
app.enableCors({
  origin: 'http://localhost:5173', // Porta do Vite
  credentials: true
});
```

### **3. 📡 Erro Server-Sent Events (SSE)**
```
EventSource failed / Connection refused
```

**Causa:** Endpoint SSE não disponível ou URL incorreta  
**Soluções:**
```typescript
// Verificar endpoint SSE
GET http://localhost:3000/llm-tests/chat/stream/{executionId}

// Verificar implementação no hook
const eventSource = new EventSource(`${baseURL}/llm-tests/chat/stream/${executionId}`);

// Adicionar tratamento de erro
eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  // Tentar reconectar após delay
};
```

### **4. 🎨 Problemas de Material-UI**
```
TypeError: Cannot read properties of undefined
```

**Causa:** Versão incompatível ou importação incorreta  
**Soluções:**
```bash
# Verificar versões
npm list @mui/material @mui/icons-material

# Atualizar se necessário
npm update @mui/material @mui/icons-material @emotion/react @emotion/styled

# Verificar importações
import { ThemeProvider } from '@mui/material/styles'; // ✅
import { ThemeProvider } from '@mui/styles'; // ❌ Deprecated
```

### **5. 🔄 Hook useDynamicTest não funciona**
```
TypeError: Cannot read properties of undefined (reading 'startTest')
```

**Causa:** Hook não está sendo importado corretamente  
**Solução:**
```typescript
// ✅ Importação correta
import { useDynamicTest } from '../../hooks/useDynamicTest';

// ✅ Uso correto
const { isExecuting, steps, startTest } = useDynamicTest();

// ❌ Não fazer destructuring incorreto
const dynamicTest = useDynamicTest();
// Use: dynamicTest.startTest()
```

### **6. 🚀 Animações Framer Motion não funcionam**
```
Module not found: Can't resolve 'framer-motion'
```

**Solução:**
```bash
# Instalar dependência
npm install framer-motion

# Uso correto
import { motion, AnimatePresence } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Conteúdo animado
</motion.div>
```

### **7. 📱 Layout responsivo quebrado**
```
Components se sobrepondo em mobile
```

**Solução:**
```typescript
// Use Stack ao invés de Grid se houver problemas
import { Stack } from '@mui/material';

<Stack 
  direction={{ xs: 'column', lg: 'row' }} 
  spacing={2}
>
  <Box sx={{ flex: { lg: 2 } }}>Conteúdo principal</Box>
  <Box sx={{ flex: { lg: 1 } }}>Sidebar</Box>
</Stack>
```

## 🛠️ **Comandos Úteis para Debug**

### **Verificar Status dos Serviços:**
```bash
# Backend
cd backend
npm run dev
# Deve rodar em http://localhost:3000

# Frontend  
cd frontend
npm run dev
# Deve rodar em http://localhost:5173
```

### **Verificar Logs do Console:**
```typescript
// Adicionar logs para debug
console.log('Estado atual:', { isExecuting, steps, error });

// Verificar chamadas de API
console.log('Enviando request:', request);

// Verificar eventos SSE
eventSource.onmessage = (event) => {
  console.log('SSE Data:', event.data);
  // ... resto do código
};
```

### **Verificar Requisições de Rede:**
1. Abrir DevTools (F12)
2. Aba Network
3. Verificar se chamadas para `/llm-tests/chat/` estão sendo feitas
4. Verificar status codes (200, 404, 500, etc.)

### **Verificar Estados do React:**
```typescript
// Adicionar React DevTools extension
// Ou usar console.log temporários

useEffect(() => {
  console.log('Steps updated:', steps);
}, [steps]);

useEffect(() => {
  console.log('Execution status:', isExecuting);
}, [isExecuting]);
```

## 🔍 **Checklist de Verificação**

### **✅ Antes de Reportar Bug:**
- [ ] Backend está rodando e acessível
- [ ] Frontend está rodando sem erros de build
- [ ] API key está configurada corretamente
- [ ] Console do navegador não mostra erros
- [ ] Network tab mostra requisições sendo feitas
- [ ] Versões das dependências estão corretas

### **✅ Para Nova Instalação:**
```bash
# 1. Clone e instale
git clone [repo]
cd ArchiCrawler

# 2. Backend
cd backend
npm install
npm run dev

# 3. Frontend (nova aba terminal)
cd frontend  
npm install
npm run dev

# 4. Acesse http://localhost:5173/dynamic-test
```

### **✅ Para Desenvolvimento:**
```bash
# Hot reload automático
npm run dev  # Backend e frontend

# Verificar tipos TypeScript
npm run type-check

# Lint e format
npm run lint
npm run format
```

## 🆘 **Quando Pedir Ajuda**

Se os problemas persistirem, forneça:

1. **Erro completo** com stack trace
2. **Versões** das dependências (`npm list`)
3. **Logs do console** (frontend e backend)
4. **Passos para reproduzir** o problema
5. **Screenshots** se relevante

## 🎯 **Dicas de Performance**

### **Otimizar Re-renders:**
```typescript
// Use useCallback para funções
const handleStart = useCallback(async () => {
  await startTest(request);
}, [startTest]);

// Use useMemo para valores computados
const sortedSteps = useMemo(() => 
  steps.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
, [steps]);
```

### **Gerenciar EventSource:**
```typescript
// Sempre fazer cleanup
useEffect(() => {
  return () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };
}, []);
```

### **Lazy Loading:**
```typescript
// Para componentes grandes
const DynamicTestPage = lazy(() => import('./pages/DynamicTestPage'));

<Suspense fallback={<div>Carregando...</div>}>
  <DynamicTestPage />
</Suspense>
```

---

**💡 Dica:** Mantenha sempre o console aberto durante desenvolvimento para catch early errors! 