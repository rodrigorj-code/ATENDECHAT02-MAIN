import { useState } from 'react';

interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'ligacao' | 'email' | 'reuniao' | 'tarefa' | 'visita' | 'proposta' | 'follow_up';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada' | 'atrasada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  data_inicio: string;
  hora_inicio: string;
  data_fim: string;
  hora_fim: string;
  responsavel: string;
  cliente: string;
  lead_id?: string;
  projeto_id?: string;
  localizacao?: string;
  observacoes: string;
  lembrete: boolean;
  tempo_gasto: number; // em minutos
  tags: string[];
  concluida: boolean;
}

interface Comentario {
  id: string;
  atividade_id: string;
  autor: string;
  conteudo: string;
  data_hora: string;
}

export default function Atividades() {
  const [activeTab, setActiveTab] = useState<'lista' | 'calendario' | 'kanban'>('lista');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');

  const [atividades, setAtividades] = useState<Atividade[]>([
    {
      id: '1',
      titulo: 'Reunião de apresentação com Carlos Silva',
      descricao: 'Apresentar proposta de software ERP para empresa Tech Solutions',
      tipo: 'reuniao',
      status: 'pendente',
      prioridade: 'alta',
      data_inicio: '2024-01-15',
      hora_inicio: '14:00',
      data_fim: '2024-01-15',
      hora_fim: '15:30',
      responsavel: 'João Santos',
      cliente: 'Carlos Silva',
      lead_id: '1',
      localizacao: 'Escritório Tech Solutions - Av. Paulista, 1000',
      observacoes: 'Trazer material impresso da apresentação',
      lembrete: true,
      tempo_gasto: 0,
      tags: ['reuniao-importante', 'erp', 'enterprise'],
      concluida: false
    },
    {
      id: '2',
      titulo: 'Follow-up com Maria Oliveira',
      descricao: 'Enviar email com informações adicionais sobre o produto',
      tipo: 'email',
      status: 'concluida',
      prioridade: 'media',
      data_inicio: '2024-01-14',
      hora_inicio: '09:00',
      data_fim: '2024-01-14',
      hora_fim: '10:00',
      responsavel: 'Ana Costa',
      cliente: 'Maria Oliveira',
      lead_id: '2',
      observacoes: 'Email enviado com sucesso',
      lembrete: false,
      tempo_gasto: 30,
      tags: ['follow-up', 'email-marketing'],
      concluida: true
    },
    {
      id: '3',
      titulo: 'Ligar para Pedro Santos',
      descricao: 'Confirmar interesse e agendar demonstração do produto',
      tipo: 'ligacao',
      status: 'em_andamento',
      prioridade: 'baixa',
      data_inicio: '2024-01-16',
      hora_inicio: '11:00',
      data_fim: '2024-01-16',
      hora_fim: '11:30',
      responsavel: 'João Santos',
      cliente: 'Pedro Santos',
      lead_id: '3',
      observacoes: 'Tentar ligar após 11h',
      lembrete: true,
      tempo_gasto: 0,
      tags: ['prospeccao', 'telefone'],
      concluida: false
    },
    {
      id: '4',
      titulo: 'Preparar proposta comercial',
      descricao: 'Elaborar proposta personalizada para cliente Tech Solutions',
      tipo: 'tarefa',
      status: 'pendente',
      prioridade: 'urgente',
      data_inicio: '2024-01-15',
      hora_inicio: '08:00',
      data_fim: '2024-01-15',
      hora_fim: '12:00',
      responsavel: 'Ana Costa',
      cliente: 'Carlos Silva',
      projeto_id: '1',
      observacoes: 'Incluir planos de implementação e valores',
      lembrete: true,
      tempo_gasto: 0,
      tags: ['proposta', 'urgente', 'documentacao'],
      concluida: false
    }
  ]);

  const [comentarios] = useState<Comentario[]>([
    {
      id: '1',
      atividade_id: '1',
      autor: 'João Santos',
      conteudo: 'Cliente confirmou presença na reunião',
      data_hora: '2024-01-14 16:30'
    },
    {
      id: '2',
      atividade_id: '2',
      autor: 'Ana Costa',
      conteudo: 'Email enviado com material completo',
      data_hora: '2024-01-14 09:45'
    }
  ]);

  const getTipoIcon = (tipo: string) => {
    const icons = {
      ligacao: '📞',
      email: '✉️',
      reuniao: '🤝',
      tarefa: '📋',
      visita: '🏢',
      proposta: '📄',
      follow_up: '🔄'
    };
    return icons[tipo as keyof typeof icons] || '📋';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      concluida: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      atrasada: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAtividades = atividades.filter(atividade => {
    const matchesSearch = atividade.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atividade.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atividade.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || atividade.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'todos' || atividade.prioridade === prioridadeFilter;
    const matchesTipo = tipoFilter === 'todos' || atividade.tipo === tipoFilter;
    const matchesResponsavel = responsavelFilter === 'todos' || atividade.responsavel === responsavelFilter;
    
    return matchesSearch && matchesStatus && matchesPrioridade && matchesTipo && matchesResponsavel;
  });

  const atividadesPorStatus = {
    pendente: filteredAtividades.filter(a => a.status === 'pendente'),
    em_andamento: filteredAtividades.filter(a => a.status === 'em_andamento'),
    concluida: filteredAtividades.filter(a => a.status === 'concluida')
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Atividades</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Nova Atividade</span>
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
              onClick={() => setActiveTab('calendario')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'calendario'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendário
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
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar atividade..."
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
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
                <option value="atrasada">Atrasada</option>
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
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="ligacao">Ligação</option>
                <option value="email">Email</option>
                <option value="reuniao">Reunião</option>
                <option value="tarefa">Tarefa</option>
                <option value="visita">Visita</option>
                <option value="proposta">Proposta</option>
                <option value="follow_up">Follow-up</option>
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
              </select>
            </div>
          </div>
        </div>

        {/* Lista View */}
        {activeTab === 'lista' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Atividades ({filteredAtividades.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAtividades.map((atividade) => (
                <div key={atividade.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                          {getTipoIcon(atividade.tipo)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {atividade.titulo}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(atividade.status)}`}>
                            {atividade.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadeColor(atividade.prioridade)}`}>
                            {atividade.prioridade}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{atividade.descricao}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {new Date(atividade.data_inicio).toLocaleDateString('pt-BR')}</span>
                          <span>⏰ {atividade.hora_inicio} - {atividade.hora_fim}</span>
                          <span>👤 {atividade.responsavel}</span>
                          <span>🏢 {atividade.cliente}</span>
                          {atividade.localizacao && (
                            <span>📍 {atividade.localizacao}</span>
                          )}
                        </div>
                        {atividade.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {atividade.tags.map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        Editar
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Concluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban View */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(atividadesPorStatus).map(([status, atividades]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {atividades.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {atividades.map((atividade) => (
                    <div key={atividade.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-start space-x-3 mb-2">
                        <span className="text-lg">{getTipoIcon(atividade.tipo)}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{atividade.titulo}</h4>
                          <p className="text-xs text-gray-600 mt-1">{atividade.descricao}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>👤 {atividade.responsavel}</span>
                        <span>📅 {new Date(atividade.data_inicio).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPrioridadeColor(atividade.prioridade)}`}>
                          {atividade.prioridade}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Mover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendario View */}
        {activeTab === 'calendario' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Visualização de Calendário</h3>
              <p className="text-gray-600">Em breve: visualização mensal/semanal das atividades</p>
            </div>
          </div>
        )}

        {/* New Activity Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Atividade</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título da atividade"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="ligacao">📞 Ligação</option>
                      <option value="email">✉️ Email</option>
                      <option value="reuniao">🤝 Reunião</option>
                      <option value="tarefa">📋 Tarefa</option>
                      <option value="visita">🏢 Visita</option>
                      <option value="proposta">📄 Proposta</option>
                      <option value="follow_up">🔄 Follow-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="baixa">🟢 Baixa</option>
                      <option value="media">🟡 Média</option>
                      <option value="alta">🟠 Alta</option>
                      <option value="urgente">🔴 Urgente</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="João Santos">João Santos</option>
                    <option value="Ana Costa">Ana Costa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Local da atividade (opcional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observações adicionais..."
                  ></textarea>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Definir lembrete
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Atividade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}