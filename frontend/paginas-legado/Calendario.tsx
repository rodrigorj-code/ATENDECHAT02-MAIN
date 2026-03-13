import { useState } from 'react';

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  tipo: 'reuniao' | 'tarefa' | 'evento' | 'compromisso' | 'aniversario' | 'feriado' | 'lembrete';
  cor: string;
  local: string;
  participantes: string[];
  criador: string;
  projeto_id?: string;
  lead_id?: string;
  cliente_id?: string;
  recorrente: boolean;
  frequencia?: 'diaria' | 'semanal' | 'mensal' | 'anual';
  lembrete: number; // minutos antes
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes: string;
  anexos: string[];
  tags: string[];
}

interface Compromisso {
  id: string;
  titulo: string;
  tipo: 'reuniao' | 'ligacao' | 'visita' | 'demonstracao' | 'apresentacao' | 'entrevista' | 'consultoria';
  cliente: string;
  data_hora: string;
  duracao: number; // minutos
  local: string;
  participantes: string[];
  objetivo: string;
  resultado?: string;
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'remarcado';
  valor_prospectado?: number;
  valor_fechado?: number;
  observacoes: string;
  documentos: string[];
  proxima_etapa?: string;
}

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'dia' | 'lista'>('mes');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Compromisso | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: '1',
      titulo: 'Reunião de Kickoff - Tech Solutions',
      descricao: 'Apresentação inicial do projeto ERP para a Tech Solutions',
      data_inicio: '2024-01-15T14:00:00',
      data_fim: '2024-01-15T16:00:00',
      tipo: 'reuniao',
      cor: '#3B82F6',
      local: 'Escritório Tech Solutions - Av. Paulista, 1000',
      participantes: ['Carlos Silva', 'Ana Costa', 'Pedro Oliveira'],
      criador: 'Ana Costa',
      projeto_id: '1',
      cliente_id: '1',
      recorrente: false,
      lembrete: 30,
      status: 'confirmado',
      observacoes: 'Trazer apresentação em PDF',
      anexos: ['apresentacao_erp.pdf'],
      tags: ['kickoff', 'tech-solutions', 'erp']
    },
    {
      id: '2',
      titulo: 'Aniversário - João Santos',
      descricao: 'Aniversário do João do departamento de vendas',
      data_inicio: '2024-01-18T00:00:00',
      data_fim: '2024-01-18T23:59:59',
      tipo: 'aniversario',
      cor: '#F59E0B',
      local: '',
      participantes: [],
      criador: 'Sistema',
      recorrente: true,
      frequencia: 'anual',
      lembrete: 1440, // 1 dia antes
      status: 'confirmado',
      observacoes: '',
      anexos: [],
      tags: ['aniversario', 'equipe']
    },
    {
      id: '3',
      titulo: 'Demonstração Sistema - Cliente XYZ',
      descricao: 'Demonstração online do sistema para o cliente XYZ',
      data_inicio: '2024-01-16T10:00:00',
      data_fim: '2024-01-16T11:30:00',
      tipo: 'compromisso',
      cor: '#10B981',
      local: 'Google Meet',
      participantes: ['Maria Silva', 'João Santos'],
      criador: 'Maria Silva',
      lead_id: '2',
      recorrente: false,
      lembrete: 60,
      status: 'confirmado',
      observacoes: 'Preparar demo personalizada',
      anexos: [],
      tags: ['demonstracao', 'cliente-xyz', 'vendas']
    },
    {
      id: '4',
      titulo: 'Feriado - Aniversário de São Paulo',
      descricao: 'Feriado municipal',
      data_inicio: '2024-01-25T00:00:00',
      data_fim: '2024-01-25T23:59:59',
      tipo: 'feriado',
      cor: '#EF4444',
      local: 'São Paulo',
      participantes: [],
      criador: 'Sistema',
      recorrente: true,
      frequencia: 'anual',
      lembrete: 0,
      status: 'confirmado',
      observacoes: '',
      anexos: [],
      tags: ['feriado', 'sao-paulo']
    }
  ]);

  const [compromissos, setCompromissos] = useState<Compromisso[]>([
    {
      id: '1',
      titulo: 'Reunião de Vendas - Q1 2024',
      tipo: 'reuniao',
      cliente: 'Tech Solutions',
      data_hora: '2024-01-15T09:00:00',
      duracao: 120,
      local: 'Escritório Principal',
      participantes: ['Ana Costa', 'Pedro Silva', 'Carlos Santos'],
      objetivo: 'Definir estratégias de vendas para o primeiro trimestre',
      status: 'agendado',
      observacoes: 'Trazer relatórios de vendas do último trimestre',
      documentos: ['relatorio_q4_2023.pdf'],
      proxima_etapa: 'Preparação de apresentação'
    },
    {
      id: '2',
      titulo: 'Ligação de Follow-up - Cliente ABC',
      tipo: 'ligacao',
      cliente: 'Cliente ABC',
      data_hora: '2024-01-16T15:30:00',
      duracao: 30,
      local: 'Telefone',
      participantes: ['João Santos'],
      objetivo: 'Verificar interesse após proposta enviada',
      status: 'agendado',
      observacoes: 'Ligar para o número comercial',
      documentos: ['proposta_cliente_abc.pdf']
    }
  ]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getTime() + (direction === 'next' ? 7 : -7) * 24 * 60 * 60 * 1000));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getTime() + (direction === 'next' ? 1 : -1) * 24 * 60 * 60 * 1000));
  };

  const getEventosDoDia = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventos.filter(evento => {
      const eventoDate = new Date(evento.data_inicio).toISOString().split('T')[0];
      return eventoDate === dateStr;
    });
  };

  const getCompromissosDoDia = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return compromissos.filter(compromisso => {
      const compromissoDate = new Date(compromisso.data_hora).toISOString().split('T')[0];
      return compromissoDate === dateStr;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setSelectedAppointment(null);
  };

  const handleEventClick = (evento: Evento) => {
    setSelectedEvent(evento);
    setShowEventModal(true);
  };

  const handleAppointmentClick = (compromisso: Compromisso) => {
    setSelectedAppointment(compromisso);
    setShowAppointmentModal(true);
  };

  const getEventosFiltrados = () => {
    return eventos.filter(evento => {
      const matchesTipo = tipoFilter === 'todos' || evento.tipo === tipoFilter;
      const matchesStatus = statusFilter === 'todos' || evento.status === statusFilter;
      return matchesTipo && matchesStatus;
    });
  };

  const getCompromissosFiltrados = () => {
    return compromissos.filter(compromisso => {
      const matchesStatus = statusFilter === 'todos' || compromisso.status === statusFilter;
      return matchesStatus;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Novo Evento</span>
              </button>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📅</span>
                <span>Novo Compromisso</span>
              </button>
            </div>
          </div>

          {/* View Mode and Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'mes', label: 'Mês', icon: '📅' },
                  { key: 'semana', label: 'Semana', icon: '📆' },
                  { key: 'dia', label: 'Dia', icon: '📋' },
                  { key: 'lista', label: 'Lista', icon: '📋' }
                ].map((view) => (
                  <button
                    key={view.key}
                    onClick={() => setViewMode(view.key as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      viewMode === view.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{view.icon}</span>
                    <span>{view.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (viewMode === 'mes') navigateMonth('prev');
                    else if (viewMode === 'semana') navigateWeek('prev');
                    else if (viewMode === 'dia') navigateDay('prev');
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ◀️
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={() => {
                    if (viewMode === 'mes') navigateMonth('next');
                    else if (viewMode === 'semana') navigateWeek('next');
                    else if (viewMode === 'dia') navigateDay('next');
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ▶️
                </button>
              </div>
            </div>
            
            <div className="text-xl font-semibold text-gray-900">
              {viewMode === 'mes' && `${meses[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'semana' && `Semana de ${currentDate.toLocaleDateString('pt-BR')}`}
              {viewMode === 'dia' && currentDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {viewMode === 'lista' && 'Lista de Eventos'}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="reuniao">Reunião</option>
                <option value="tarefa">Tarefa</option>
                <option value="evento">Evento</option>
                <option value="compromisso">Compromisso</option>
                <option value="aniversario">Aniversário</option>
                <option value="feriado">Feriado</option>
                <option value="lembrete">Lembrete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos os Status</option>
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        {viewMode === 'mes' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {diasSemana.map((dia) => (
                <div key={dia} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
                  {dia}
                </div>
              ))}
              {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                <div key={`empty-${i}`} className="bg-white p-3 h-24"></div>
              ))}
              {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayEvents = getEventosDoDia(date);
                const dayAppointments = getCompromissosDoDia(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                
                return (
                  <div
                    key={day}
                    className={`bg-white p-2 h-24 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isToday ? 'bg-blue-50 border-blue-200' : ''
                    } ${
                      isSelected ? 'bg-blue-100 border-blue-300' : ''
                    }`}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((evento) => (
                        <div
                          key={evento.id}
                          className="text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: `${evento.cor}20`, color: evento.cor }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(evento);
                          }}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                      {dayAppointments.slice(0, 1).map((compromisso) => (
                        <div
                          key={compromisso.id}
                          className="text-xs px-1 py-0.5 rounded truncate cursor-pointer bg-green-100 text-green-800 hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(compromisso);
                          }}
                        >
                          {compromisso.titulo}
                        </div>
                      ))}
                      {(dayEvents.length > 2 || dayAppointments.length > 1) && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length + dayAppointments.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'semana' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-8 gap-px bg-gray-200">
              <div className="bg-gray-50 p-3"></div>
              {diasSemana.map((dia, index) => {
                const date = new Date(currentDate);
                date.setDate(currentDate.getDate() - currentDate.getDay() + index);
                return (
                  <div key={dia} className="bg-gray-50 p-3 text-center">
                    <div className="text-sm font-medium text-gray-700">{dia}</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{date.getDate()}</div>
                  </div>
                );
              })}
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="contents">
                  <div className="bg-gray-50 p-3 text-right text-sm text-gray-600">
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </div>
                  {diasSemana.map((_, dayIndex) => {
                    const date = new Date(currentDate);
                    date.setDate(currentDate.getDate() - currentDate.getDay() + dayIndex);
                    const dayEvents = getEventosDoDia(date);
                    const hourEvents = dayEvents.filter(evento => {
                      const eventHour = new Date(evento.data_inicio).getHours();
                      return eventHour === hour;
                    });
                    
                    return (
                      <div
                        key={`${hour}-${dayIndex}`}
                        className="bg-white p-2 min-h-16 border border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleDateClick(date)}
                      >
                        {hourEvents.map((evento) => (
                          <div
                            key={evento.id}
                            className="text-xs px-2 py-1 rounded mb-1 truncate cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: `${evento.cor}20`, color: evento.cor }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(evento);
                            }}
                          >
                            {evento.titulo}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'dia' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourEvents = getEventosDoDia(currentDate).filter(evento => {
                  const eventHour = new Date(evento.data_inicio).getHours();
                  return eventHour === hour;
                });
                const hourAppointments = getCompromissosDoDia(currentDate).filter(compromisso => {
                  const appointmentHour = new Date(compromisso.data_hora).getHours();
                  return appointmentHour === hour;
                });
                
                return (
                  <div key={hour} className="flex">
                    <div className="w-20 text-right pr-4 text-sm text-gray-600 py-2">
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                    <div className="flex-1 border-l-2 border-gray-200 pl-4 py-2 min-h-16">
                      {hourEvents.map((evento) => (
                        <div
                          key={evento.id}
                          className="mb-2 p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: `${evento.cor}20`, color: evento.cor }}
                          onClick={() => handleEventClick(evento)}
                        >
                          <div className="font-medium">{evento.titulo}</div>
                          <div className="text-sm opacity-75">{evento.local}</div>
                        </div>
                      ))}
                      {hourAppointments.map((compromisso) => (
                        <div
                          key={compromisso.id}
                          className="mb-2 p-2 rounded cursor-pointer bg-green-100 text-green-800 hover:opacity-80 transition-opacity"
                          onClick={() => handleAppointmentClick(compromisso)}
                        >
                          <div className="font-medium">{compromisso.titulo}</div>
                          <div className="text-sm opacity-75">{compromisso.cliente}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'lista' && (
          <div className="space-y-6">
            {/* Events Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos</h3>
              <div className="space-y-3">
                {getEventosFiltrados().map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleEventClick(evento)}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: evento.cor }}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900">{evento.titulo}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(evento.data_inicio).toLocaleString('pt-BR')} - {evento.local}
                        </div>
                        <div className="text-xs text-gray-500">{evento.descricao}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        evento.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                        evento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {evento.status}
                      </span>
                      <span className="text-gray-400">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compromissos</h3>
              <div className="space-y-3">
                {getCompromissosFiltrados().map((compromisso) => (
                  <div
                    key={compromisso.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAppointmentClick(compromisso)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <div className="font-medium text-gray-900">{compromisso.titulo}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(compromisso.data_hora).toLocaleString('pt-BR')} - {compromisso.cliente}
                        </div>
                        <div className="text-xs text-gray-500">{compromisso.objetivo}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        compromisso.status === 'realizado' ? 'bg-green-100 text-green-800' :
                        compromisso.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                        compromisso.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {compromisso.status}
                      </span>
                      <span className="text-gray-400">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent ? 'Detalhes do Evento' : 'Novo Evento'}
                </h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      defaultValue={selectedEvent?.titulo || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Título do evento"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      defaultValue={selectedEvent?.tipo || 'evento'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="reuniao">Reunião</option>
                      <option value="tarefa">Tarefa</option>
                      <option value="evento">Evento</option>
                      <option value="compromisso">Compromisso</option>
                      <option value="aniversario">Aniversário</option>
                      <option value="feriado">Feriado</option>
                      <option value="lembrete">Lembrete</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                      type="datetime-local"
                      defaultValue={selectedEvent?.data_inicio || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="datetime-local"
                      defaultValue={selectedEvent?.data_fim || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                  <input
                    type="text"
                    defaultValue={selectedEvent?.local || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Local do evento"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    defaultValue={selectedEvent?.descricao || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição do evento"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Participantes</label>
                  <input
                    type="text"
                    defaultValue={selectedEvent?.participantes.join(', ') || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Participantes (separados por vírgula)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lembrete</label>
                    <select
                      defaultValue={selectedEvent?.lembrete || 30}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Nenhum</option>
                      <option value={5}>5 minutos antes</option>
                      <option value={15}>15 minutos antes</option>
                      <option value={30}>30 minutos antes</option>
                      <option value={60}>1 hora antes</option>
                      <option value={1440}>1 dia antes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      defaultValue={selectedEvent?.status || 'confirmado'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="confirmado">Confirmado</option>
                      <option value="pendente">Pendente</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  {selectedEvent ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAppointment ? 'Detalhes do Compromisso' : 'Novo Compromisso'}
                </h3>
                <button
                  onClick={() => {
                    setShowAppointmentModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      defaultValue={selectedAppointment?.titulo || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Título do compromisso"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      defaultValue={selectedAppointment?.tipo || 'reuniao'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="reuniao">Reunião</option>
                      <option value="ligacao">Ligação</option>
                      <option value="visita">Visita</option>
                      <option value="demonstracao">Demonstração</option>
                      <option value="apresentacao">Apresentação</option>
                      <option value="entrevista">Entrevista</option>
                      <option value="consultoria">Consultoria</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <input
                      type="text"
                      defaultValue={selectedAppointment?.cliente || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                    <input
                      type="datetime-local"
                      defaultValue={selectedAppointment?.data_hora || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
                    <input
                      type="number"
                      defaultValue={selectedAppointment?.duracao || 60}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                    <input
                      type="text"
                      defaultValue={selectedAppointment?.local || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Local do compromisso"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                  <textarea
                    defaultValue={selectedAppointment?.objetivo || ''}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Objetivo do compromisso"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    defaultValue={selectedAppointment?.observacoes || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações adicionais"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Etapa</label>
                  <input
                    type="text"
                    defaultValue={selectedAppointment?.proxima_etapa || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Próxima etapa após este compromisso"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAppointmentModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  {selectedAppointment ? 'Salvar Alterações' : 'Criar Compromisso'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}