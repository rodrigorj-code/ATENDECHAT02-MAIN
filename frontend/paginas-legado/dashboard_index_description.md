# Dashboard Index - Descrição Detalhada

## Visão Geral
A página Dashboard Index é a tela inicial do sistema VBSOLUTION, servindo como hub central para visualização de atividades, eventos e informações importantes do usuário.

## Estrutura Visual

### Header da Página
- **Saudação Personalizada**: Exibe "Boa tarde, Davi" (muda baseado no horário do dia e nome do usuário)
- **Botões de Ação**: 
  - Gerenciar Cartões (abre modal para adicionar/remover cards)
  - Configurações (abre modal de configurações de saudação)

### Grid de Cards (Layout Responsivo)
- **Desktop**: 2 colunas (grid-cols-1 md:grid-cols-2)
- **Mobile**: 1 coluna
- **Gap**: 24px entre cards
- **Cards Visuais**: 4 cards principais por padrão

## Cards do Dashboard

### 1. Card "Recentes"
**Função**: Mostra atividades recentes do usuário

**Elementos Visuais**:
- Ícone de relógio
- Lista de atividades com indicadores de status coloridos
- Cada item mostra:
  - Bolinha colorida indicando status (verde=concluído, azul=em progresso, laranja=pentente, vermelho=vencido)
  - Título da atividade
  - Status textual

**Interações**:
- Hover: destaque em cinza claro
- Clique: abre modal com detalhes

### 2. Card "Agenda"
**Função**: Exibe compromissos do dia atual

**Elementos Visuais**:
- Ícone de calendário
- Cabeçalho com navegação de datas
- Botão "Hoje" para voltar ao dia atual
- Lista de eventos com:
  - Hora do evento
  - Título
  - Código de cores por tipo (azul=evento, verde=atividade, roxo=projeto)

**Tipos de Eventos**:
- Eventos de Calendário (azul)
- Atividades (verde)
- Projetos (roxo)

### 3. Card "Pendentes"
**Função**: Lista tarefas pendentes

**Elementos Visuais**:
- Ícone de checklist
- Itens com indicadores laranja (status pendente)
- Informações de título e status

### 4. Card "Andamento"
**Função**: Mostra atividades em progresso

**Elementos Visuais**:
- Ícone de relógio com ponteiro
- Indicadores azuis (status em progresso)
- Progresso textual (ex: "50% completo")

## Funcionalidades Avançadas

### Drag and Drop
- **Reordenar Cards**: Arrastar cards para reorganizar
- **Visual Feedback**: 
  - Opacidade reduzida durante drag
  - Anel roxo ao redor do card de destino
  - Cursor muda para "grabbing"

### Gerenciar Cartões (Modal)
**Acesso**: Botão "Gerenciar Cartões" no header

**Funcionalidades**:
- Adicionar novos cards (ex: Prioridades/LineUp)
- Remover cards existentes
- Reativar cards removidos
- Persistência via Supabase

### Modal de Detalhes
**Abertura**: Clique em qualquer item de atividade/evento

**Conteúdo por Tipo**:
- **Atividades**: Título, descrição, status badge, tipo, data, responsável, botão "Ver na Página de Atividades"
- **Projetos**: Nome, descrição, status, data de criação, botão "Ver na Página de Projetos"
- **Equipes**: Nome, descrição, cor identificadora, membros, setor, projetos ativos
- **Eventos**: Título, descrição, tipo, data, horário, local, participantes

## Estado de Carregamento
- **Spinner animado**: Borda giratória azul
- **Mensagem**: "Carregando dashboard..."
- **Centralizado**: Vertical e horizontalmente

## Responsividade
- **Breakpoints**: Mobile-first com breakpoint em 768px
- **Adaptação**: Cards empilham verticalmente em telas pequenas
- **Fontes**: Reduzem proporcionalmente
- **Espaçamentos**: Ajustados para telas pequenas

## Cores e Estilo

### Esquema de Cores
- **Primário**: #1e293b (azul escuro)
- **Secundário**: #8854F7 (roxo)
- **Fundo**: Gradiente suave cinza-claro
- **Cards**: Branco com sombra suave
- **Bordas**: Cinza claro (#e2e8f0)

### Status Coloridos
- **Concluído**: Verde (#10b981)
- **Em Progresso**: Azul (#3b82f6)
- **Pendente**: Laranja (#f59e0b)
- **Vencido**: Vermelho (#ef4444)

### Tipografia
- **Títulos**: Inter, peso 600, 18px
- **Corpo**: Inter, peso 400, 14px
- **Status**: Inter, peso 400, 12px

## Integrações
- **Supabase**: Para persistência de configurações de cards
- **Google Calendar**: Para eventos do calendário (opcional)
- **APIs Internas**: Para atividades, projetos e equipes

## Acessibilidade
- **ARIA Labels**: Em elementos interativos
- **Contraste**: WCAG AA compliant
- **Navegação por Teclado**: Tab order lógico
- **Focus States**: Visíveis em todos elementos interativos

## Performance
- **Lazy Loading**: Dados carregados sob demanda
- **Debouncing**: Em pesquisas e filtros
- **Otimização de Re-renders**: Uso de useCallback e useMemo
- **Cache**: Dados armazenados localmente quando apropriado