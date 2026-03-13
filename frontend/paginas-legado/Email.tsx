import { useState } from 'react';

interface Email {
  id: string;
  assunto: string;
  remetente: string;
  destinatarios: string[];
  cc: string[];
  cco: string[];
  conteudo: string;
  data_envio: string;
  data_recebimento: string;
  lido: boolean;
  importante: boolean;
  spam: boolean;
  arquivado: boolean;
  rascunho: boolean;
  anexos: Anexo[];
  respostas: Email[];
  encaminhamentos: Email[];
  tags: string[];
  categoria: string;
  prioridade: 'baixa' | 'normal' | 'alta';
  status: 'enviado' | 'recebido' | 'lido' | 'respondido' | 'encaminhado';
}

interface Anexo {
  id: string;
  nome: string;
  tamanho: number;
  tipo: string;
  url: string;
}

interface Contato {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  empresa?: string;
  cargo?: string;
  telefone?: string;
  favorito: boolean;
  bloqueado: boolean;
}

export default function Email() {
  const [activeTab, setActiveTab] = useState<'caixa_entrada' | 'enviados' | 'rascunhos' | 'lixeira' | 'spam' | 'arquivados' | 'importante'>('caixa_entrada');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showContatosModal, setShowContatosModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos');
  const [showPreview, setShowPreview] = useState(true);
  const [emailsSelecionados, setEmailsSelecionados] = useState<string[]>([]);

  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      assunto: 'Novo Lead: Tech Solutions - Interesse em ERP',
      remetente: 'contato@techsolutions.com.br',
      destinatarios: ['vendas@empresa.com'],
      cc: [],
      cco: [],
      conteudo: 'Olá,\n\nSou o Carlos da Tech Solutions e estamos interessados em conhecer seu sistema ERP. Podemos marcar uma reunião para demonstração?\n\nAguardo retorno.\n\nAtt,\nCarlos Silva',
      data_envio: '2024-01-15T10:30:00',
      data_recebimento: '2024-01-15T10:32:00',
      lido: false,
      importante: true,
      spam: false,
      arquivado: false,
      rascunho: false,
      anexos: [],
      respostas: [],
      encaminhamentos: [],
      tags: ['lead', 'erp', 'tech-solutions'],
      categoria: 'vendas',
      prioridade: 'alta',
      status: 'recebido'
    },
    {
      id: '2',
      assunto: 'Reunião de Kickoff - Projeto ERP Tech Solutions',
      remetente: 'ana.costa@empresa.com',
      destinatarios: ['contato@techsolutions.com.br'],
      cc: ['pedro.silva@empresa.com'],
      cco: [],
      conteudo: 'Carlos,\n\nConforme conversamos, segue a confirmação da reunião de kickoff para o projeto de implementação do ERP.\n\nData: 20/01/2024\nHorário: 14:00\nLocal: Escritório Tech Solutions\n\nAgenda:\n1. Apresentação da equipe\n2. Definição de escopo\n3. Cronograma inicial\n4. Próximos passos\n\nAnexo: Apresentação do projeto\n\nAtt,\nAna Costa\nGerente de Projetos',
      data_envio: '2024-01-14T16:45:00',
      data_recebimento: '2024-01-14T16:47:00',
      lido: true,
      importante: true,
      spam: false,
      arquivado: false,
      rascunho: false,
      anexos: [
        {
          id: '1',
          nome: 'Apresentacao_ERP_2024.pptx',
          tamanho: 15728640,
          tipo: 'presentation',
          url: '/uploads/apresentacoes/apresentacao_erp_2024.pptx'
        }
      ],
      respostas: [],
      encaminhamentos: [],
      tags: ['projeto', 'kickoff', 'erp', 'tech-solutions'],
      categoria: 'projetos',
      prioridade: 'alta',
      status: 'enviado'
    },
    {
      id: '3',
      assunto: 'Atualização do Sistema - Manutenção Programada',
      remetente: 'suporte@empresa.com',
      destinatarios: ['todos@empresa.com'],
      cc: [],
      cco: [],
      conteudo: 'Prezados,\n\nInformamos que haverá uma manutenção programada em nosso sistema no dia 18/01/2024 das 02:00 às 06:00.\n\nDurante este período, o sistema estará indisponível.\n\nRecomendamos que programem suas atividades considerando este horário.\n\nAtt,\nEquipe de Suporte',
      data_envio: '2024-01-13T09:00:00',
      data_recebimento: '2024-01-13T09:02:00',
      lido: true,
      importante: false,
      spam: false,
      arquivado: true,
      rascunho: false,
      anexos: [],
      respostas: [],
      encaminhamentos: [],
      tags: ['manutencao', 'sistema', 'aviso'],
      categoria: 'sistema',
      prioridade: 'normal',
      status: 'recebido'
    },
    {
      id: '4',
      assunto: 'Promoção Imperdível - Ganhe 50% de Desconto!',
      remetente: 'promocoes@lojaonline.com.br',
      destinatarios: ['vendas@empresa.com'],
      cc: [],
      cco: [],
      conteudo: 'Aproveite nossa promoção especial!\n\n50% de desconto em todos os produtos!\n\nClique aqui e garanta já o seu!',
      data_envio: '2024-01-12T11:30:00',
      data_recebimento: '2024-01-12T11:32:00',
      lido: false,
      importante: false,
      spam: true,
      arquivado: false,
      rascunho: false,
      anexos: [],
      respostas: [],
      encaminhamentos: [],
      tags: ['promocao', 'spam'],
      categoria: 'promocoes',
      prioridade: 'baixa',
      status: 'recebido'
    }
  ]);

  const [contatos, setContatos] = useState<Contato[]>([
    {
      id: '1',
      nome: 'Carlos Silva',
      email: 'contato@techsolutions.com.br',
      empresa: 'Tech Solutions',
      cargo: 'Gerente de TI',
      telefone: '(11) 98765-4321',
      favorito: true,
      bloqueado: false
    },
    {
      id: '2',
      nome: 'Ana Costa',
      email: 'ana.costa@empresa.com',
      empresa: 'Empresa',
      cargo: 'Gerente de Projetos',
      telefone: '(11) 99876-5432',
      favorito: true,
      bloqueado: false
    }
  ]);

  const [composeEmail, setComposeEmail] = useState({
    para: '',
    cc: '',
    cco: '',
    assunto: '',
    conteudo: '',
    anexos: [] as Anexo[]
  });

  const getEmailsPorAba = () => {
    return emails.filter(email => {
      switch (activeTab) {
        case 'caixa_entrada':
          return !email.spam && !email.arquivado && !email.rascunho;
        case 'enviados':
          return email.status === 'enviado';
        case 'rascunhos':
          return email.rascunho;
        case 'lixeira':
          return email.arquivado && !email.importante;
        case 'spam':
          return email.spam;
        case 'arquivados':
          return email.arquivado && !email.spam;
        case 'importante':
          return email.importante;
        default:
          return true;
      }
    }).filter(email => {
      const matchesSearch = email.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.conteudo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoria = categoriaFilter === 'todos' || email.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  };

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    if (!email.lido && email.status === 'recebido') {
      setEmails(emails.map(e => e.id === email.id ? { ...e, lido: true, status: 'lido' } : e));
    }
  };

  const handleEmailSelection = (emailId: string) => {
    if (emailsSelecionados.includes(emailId)) {
      setEmailsSelecionados(emailsSelecionados.filter(id => id !== emailId));
    } else {
      setEmailsSelecionados([...emailsSelecionados, emailId]);
    }
  };

  const getUnreadCount = (tab: string) => {
    return emails.filter(email => {
      switch (tab) {
        case 'caixa_entrada':
          return !email.lido && !email.spam && !email.arquivado;
        case 'importante':
          return !email.lido && email.importante;
        default:
          return false;
      }
    }).length;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowComposeModal(true)}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
          >
            <span>✏️</span>
            <span>Escrever</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-1">
              {[
                { key: 'caixa_entrada', label: 'Caixa de Entrada', icon: '📥' },
                { key: 'enviados', label: 'Enviados', icon: '📤' },
                { key: 'rascunhos', label: 'Rascunhos', icon: '📝' },
                { key: 'importante', label: 'Importante', icon: '⭐' },
                { key: 'spam', label: 'Spam', icon: '🚫' },
                { key: 'lixeira', label: 'Lixeira', icon: '🗑️' }
              ].map((tab) => {
                const unreadCount = getUnreadCount(tab.key);
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Armazenamento</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <div className="text-xs text-gray-600">6.5 GB de 10 GB usados</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === 'caixa_entrada' && 'Caixa de Entrada'}
                {activeTab === 'enviados' && 'Enviados'}
                {activeTab === 'rascunhos' && 'Rascunhos'}
                {activeTab === 'importante' && 'Importante'}
                {activeTab === 'spam' && 'Spam'}
                {activeTab === 'lixeira' && 'Lixeira'}
              </h1>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar emails..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todas Categorias</option>
                  <option value="vendas">Vendas</option>
                  <option value="projetos">Projetos</option>
                  <option value="sistema">Sistema</option>
                  <option value="promocoes">Promoções</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowContatosModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Contatos"
              >
                👥
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg transition-colors ${
                  showPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Pré-visualização"
              >
                👁️
              </button>
            </div>
          </div>
        </div>

        {/* Email List and Preview */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className={`${showPreview && selectedEmail ? 'w-2/5' : 'w-full'} border-r border-gray-200 overflow-y-auto`}>
            <div className="divide-y divide-gray-200">
              {getEmailsPorAba().map((email) => (
                <div
                  key={email.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                    selectedEmail?.id === email.id ? 'bg-blue-50 border-l-blue-600' : 
                    email.importante ? 'border-l-yellow-400' : 'border-l-transparent'
                  } ${!email.lido ? 'bg-gray-50 font-medium' : ''}`}
                  onClick={() => handleEmailSelect(email)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={emailsSelecionados.includes(email.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleEmailSelection(email.id);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm ${!email.lido ? 'font-semibold' : ''}`}>
                            {email.remetente}
                          </span>
                          {email.importante && <span className="text-yellow-500">⭐</span>}
                          {email.anexos.length > 0 && <span className="text-gray-400">📎</span>}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                          {email.assunto}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {email.conteudo.replace(/\n/g, ' ').substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {email.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(email.data_recebimento)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          {showPreview && selectedEmail && (
            <div className="w-3/5 flex flex-col">
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{selectedEmail.assunto}</h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><span className="font-medium">De:</span> {selectedEmail.remetente}</div>
                      <div><span className="font-medium">Para:</span> {selectedEmail.destinatarios.join(', ')}</div>
                      {selectedEmail.cc.length > 0 && <div><span className="font-medium">CC:</span> {selectedEmail.cc.join(', ')}</div>}
                      <div><span className="font-medium">Data:</span> {new Date(selectedEmail.data_recebimento).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Responder">
                      ↩️
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Encaminhar">
                      ➡️
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Imprimir">
                      🖨️
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Excluir">
                      🗑️
                    </button>
                  </div>
                </div>
                {selectedEmail.anexos.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Anexos ({selectedEmail.anexos.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.anexos.map((anexo) => (
                        <div key={anexo.id} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                          <span>📎</span>
                          <span className="text-sm text-gray-700">{anexo.nome}</span>
                          <span className="text-xs text-gray-500">({(anexo.tamanho / 1024 / 1024).toFixed(1)} MB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white p-6 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-900">{selectedEmail.conteudo}</div>
                </div>
              </div>
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <span>↩️</span>
                    <span>Responder</span>
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <span>➡️</span>
                    <span>Encaminhar</span>
                  </button>
                  <div className="flex-1"></div>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Marcar como não lido">
                    📧
                  </button>
                  <button className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors" title="Marcar como importante">
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nova Mensagem</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para</label>
                <input
                  type="text"
                  value={composeEmail.para}
                  onChange={(e) => setComposeEmail({...composeEmail, para: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite os destinatários..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
                  <input
                    type="text"
                    value={composeEmail.cc}
                    onChange={(e) => setComposeEmail({...composeEmail, cc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cópia..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CCO</label>
                  <input
                    type="text"
                    value={composeEmail.cco}
                    onChange={(e) => setComposeEmail({...composeEmail, cco: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cópia oculta..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input
                  type="text"
                  value={composeEmail.assunto}
                  onChange={(e) => setComposeEmail({...composeEmail, assunto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Assunto da mensagem..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  value={composeEmail.conteudo}
                  onChange={(e) => setComposeEmail({...composeEmail, conteudo: e.target.value})}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua mensagem..."
                />
              </div>
              {composeEmail.anexos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anexos</label>
                  <div className="space-y-2">
                    {composeEmail.anexos.map((anexo) => (
                      <div key={anexo.id} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span>📎</span>
                          <span className="text-sm">{anexo.nome}</span>
                        </div>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Anexar arquivo">
                  📎
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Emoticons">
                  😊
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Formatação">
                  📝
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Salvar Rascunho
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <span>📤</span>
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contacts Modal */}
      {showContatosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Contatos</h3>
              <button
                onClick={() => setShowContatosModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar contatos..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                {contatos.map((contato) => (
                  <div key={contato.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{contato.nome.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{contato.nome}</div>
                        <div className="text-sm text-gray-600">{contato.email}</div>
                        <div className="text-xs text-gray-500">{contato.empresa} • {contato.cargo}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {contato.favorito && <span className="text-yellow-500">⭐</span>}
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        📧
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}