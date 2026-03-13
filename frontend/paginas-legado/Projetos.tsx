import { useState } from 'react';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  status: 'planejamento' | 'em_andamento' | 'em_pausa' | 'concluido' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  data_inicio: string;
  data_fim: string;
  data_fim_prevista: string;
  responsavel: string;
  cliente: string;
  orcamento: number;
  custo_real: number;
  progresso: number; // 0-100
  equipe: string[];
  tags: string[];
  observacoes: string;
  documentos: number;
  tarefas_total: number;
  tarefas_concluidas: number;
  cor: string;
}

interface Tarefa {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao: string;
  status: 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada' | 'bloqueada';
  prioridade: 'baixa' | 'media' | 'alta';
  responsavel: string;
  data_inicio: string;
  data_fim: string;
  tempo_estimado: number; // em horas
  tempo_gasto: number; // em horas
  progresso: number; // 0-100
  dependencias: string[];
  observacoes: string;
}

export default function Projetos() {
  const [activeTab, setActiveTab] = useState<'lista' | 'kanban' | 'gantt'>('lista');
  const [showProjetoModal, setShowProjetoModal] = useState(false);
  const [showTarefaModal, setShowTarefaModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('todos');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');
  const [selectedProjeto, setSelectedProjeto] = useState<string>('');

  const [projetos, setProjetos] = useState<Projeto[]>([
    {
      id: '1',
      nome: 'Implementação ERP Tech Solutions',
      descricao: 'Implementação completa do sistema ERP para gestão empresarial',
      status: 'em_andamento',
      prioridade: 'alta',
      data_inicio: '2024-01-01',
      data_fim: '2024-06-30',
      data_fim_prevista: '2024-06-30',
      responsavel: 'João Santos',
      cliente: 'Tech Solutions Ltda',
      orcamento: 150000,
      custo_real: 95000,
      progresso: 65,
      equipe: ['João Santos', 'Ana Costa', 'Pedro Silva', 'Maria Oliveira'],
      tags: ['erp', 'enterprise', 'implementacao'],
      observacoes: 'Projeto crítico para o cliente, acompanhar de perto',
      documentos: 25,
      tarefas_total: 45,
      tarefas_concluidas: 29,
      cor: '#3B82F6'
    },
    {
      id: '2',
      nome: 'Desenvolvimento App Mobile',
      descricao: 'Desenvolvimento de aplicativo mobile para gestão de vendas',
      status: 'planejamento',
      prioridade: 'media',
      data_inicio: '2024-02-15',
      data_fim: '2024-08-15',
      data_fim_prevista: '2024-08-15',
      responsavel: 'Ana Costa',
      cliente: 'Startup Innovate',
      orcamento: 80000,
      custo_real: 15000,
      progresso: 15,
      equipe: ['Ana Costa', 'Carlos Silva', 'Julia Santos'],
      tags: ['mobile', 'app', 'vendas'],
      observacoes: 'App React Native com integração a APIs',
      documentos: 8,
      tarefas_total: 32,
      tarefas_concluidas: 5,
      cor: '#10B981'
    },
    {
      id: '3',
      nome: 'Consultoria Processos Santos Consultoria',
      descricao: 'Análise e otimização de processos internos',
      status: 'concluido',
      prioridade: 'baixa',
      data_inicio: '2023-11-01',
      data_fim: '2024-01-31',
      data_fim_prevista: '2024-01-31',
      responsavel: 'Pedro Silva',
      cliente: 'Santos Consultoria',
      orcamento: 35000,
      custo_real: 32000,
      progresso: 100,
      equipe: ['Pedro Silva', 'Mariana Costa'],
      tags: ['consultoria', 'processos', 'otimizacao'],
      observacoes: 'Projeto concluído com sucesso, cliente satisfeito',
      documentos: 18,
      tarefas_total: 20,
      tarefas_concluidas: 20,
      cor: '#8B5CF6'
    }
  ]);

  const [tarefas, setTarefas] = useState<Tarefa[]>([
    {
      id: '1',
      projeto_id: '1',
      titulo: 'Análise de requisitos',
      descricao: 'Levantar todos os requisitos funcionais e não funcionais',
      status: 'concluida',
      prioridade: 'alta',
      responsavel: 'João Santos',
      data_inicio: '2024-01-01',
      data_fim: '2024-01-15',
      tempo_estimado: 40,
      tempo_gasto: 38,
      progresso: 100,
      dependencias: [],
      observacoes: 'Requisitos aprovados pelo cliente',
    },
    {
      id: '2',
      projeto_id: '1',
      titulo: 'Configuração do sistema',
      descricao: 'Configurar módulos principais do ERP',
      status: 'em_andamento',
      prioridade: 'alta',
      responsavel: 'Ana Costa',
      data_inicio: '2024-01-16',
      data_fim: '2024-03-15',
      tempo_estimado: 120,
      tempo_gasto: 75,
      progresso: 65,
      dependencias: ['1'],
      observacoes: 'Configuração em progresso',
    },
    {
      id: '3',
      projeto_id: '1',
      titulo: 'Testes de integração',
      descricao: 'Realizar testes de integração entre módulos',
      status: 'nao_iniciada',
      prioridade: 'media',
      responsavel: 'Pedro Silva',
      data_inicio: '2024-03-16',
      data_fim: '2024-04-30',
      tempo_estimado: 80,
      tempo_gasto: 0,
      progresso: 0,
      dependencias: ['2'],
      observacoes: 'Aguardando conclusão da configuração',
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      planejamento: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-green-100 text-green-800',
      em_pausa: 'bg-yellow-100 text-yellow-800',
      concluido: 'bg-purple-100 text-purple-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTarefaStatusColor = (status: string) => {
    const colors = {
      nao_iniciada: 'bg-gray-100 text-gray-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      concluida: 'bg-green-100 text-green-800',
      atrasada: 'bg-red-100 text-red-800',
      bloqueada: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredProjetos = projetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || projeto.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'todos' || projeto.prioridade === prioridadeFilter;
    const matchesResponsavel = responsavelFilter === 'todos' || projeto.responsavel === responsavelFilter;
    
    return matchesSearch && matchesStatus && matchesPrioridade && matchesResponsavel;
  });

  const projetosPorStatus = {
    planejamento: filteredProjetos.filter(p => p.status === 'planejamento'),
    em_andamento: filteredProjetos.filter(p => p.status === 'em_andamento'),
    em_pausa: filteredProjetos.filter(p => p.status === 'em_pausa'),
    concluido: filteredProjetos.filter(p => p.status === 'concluido'),
    cancelado: filteredProjetos.filter(p => p.status === 'cancelado')
  };

  const tarefasDoProjeto = selectedProjeto ? tarefas.filter(t => t.projeto_id === selectedProjeto) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
            <button
              onClick={() => setShowProjetoModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Novo Projeto</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'lista'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'kanban'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'gantt'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gantt
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar projeto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="planejamento">Planejamento</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="em_pausa">Em Pausa</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
              <select
                value={prioridadeFilter}
                onChange={(e) => setPrioridadeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todas</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
              <select
                value={responsavelFilter}
                onChange={(e) => setResponsavelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="João Santos">João Santos</option>
                <option value="Ana Costa">Ana Costa</option>
                <option value="Pedro Silva">Pedro Silva</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista View */}
        {activeTab === 'lista' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjetos.map((projeto) => (
              <div key={projeto.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: projeto.cor }}
                      ></div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{projeto.nome}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(projeto.status)}`}>
                        {projeto.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadeColor(projeto.prioridade)}`}>
                        {projeto.prioridade}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{projeto.descricao}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progresso</span>
                      <span className="font-medium">{projeto.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${projeto.progresso}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Início:</span>
                        <div className="font-medium">{new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Fim:</span>
                        <div className="font-medium">{new Date(projeto.data_fim).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Tarefas:</span>
                      <span className="font-medium">{projeto.tarefas_concluidas}/{projeto.tarefas_total}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Orçamento:</span>
                      <span className="font-medium">R$ {projeto.orcamento.toLocaleString('pt-BR')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">Equipe:</span>
                      <div className="flex -space-x-2">
                        {projeto.equipe.slice(0, 3).map((membro, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
                            title={membro}
                          >
                            {membro.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {projeto.equipe.length > 3 && (
                          <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{projeto.equipe.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                    <div className="text-sm text-gray-500">
                      Cliente: <span className="font-medium text-gray-900">{projeto.cliente}</span>
                    </div>
                    <button
                      onClick={() => setSelectedProjeto(projeto.id)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kanban View */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {Object.entries(projetosPorStatus).map(([status, projetos]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {projetos.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {projetos.map((projeto) => (
                    <div key={projeto.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: projeto.cor }}
                        ></div>
                        <h4 className="font-medium text-gray-900 text-sm truncate">{projeto.nome}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{projeto.descricao}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-500">Progresso</span>
                        <span className="font-medium">{projeto.progresso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${projeto.progresso}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">👤 {projeto.responsavel.split(' ')[0]}</span>
                        <span className="text-gray-500">📅 {new Date(projeto.data_fim).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gantt View */}
        {activeTab === 'gantt' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Visualização Gantt</h3>
              <p className="text-gray-600">Em breve: visualização de cronograma com timeline interativo</p>
            </div>
          </div>
        )}

        {/* New Project Modal */}
        {showProjetoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Projeto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do projeto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descrição detalhada do projeto..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="João Santos">João Santos</option>
                      <option value="Ana Costa">Ana Costa</option>
                      <option value="Pedro Silva">Pedro Silva</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observações importantes..."
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowProjetoModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowProjetoModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Projeto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Task Modal */}
        {showTarefaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Tarefa</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione um projeto</option>
                    <option value="1">Implementação ERP Tech Solutions</option>
                    <option value="2">Desenvolvimento App Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da Tarefa</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título da tarefa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descrição detalhada..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="João Santos">João Santos</option>
                      <option value="Ana Costa">Ana Costa</option>
                      <option value="Pedro Silva">Pedro Silva</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Estimado (horas)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTarefaModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowTarefaModal(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Criar Tarefa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}