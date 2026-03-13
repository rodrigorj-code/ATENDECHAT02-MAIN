import { useState } from 'react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  empresa: string;
  cargo: string;
  avatar?: string;
  ativo: boolean;
  email_verificado: boolean;
  data_criacao: string;
  ultimo_acesso: string;
  tipo_plano: 'free' | 'basic' | 'pro' | 'enterprise';
  permissoes: string[];
  preferencias: {
    idioma: string;
    fuso_horario: string;
    notificacoes_email: boolean;
    notificacoes_push: boolean;
    tema: 'claro' | 'escuro' | 'auto';
  };
}

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: {
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  setor: string;
  tamanho: 'pequena' | 'media' | 'grande';
  website: string;
  descricao: string;
}

export default function LoginRegistro() {
  const [activeTab, setActiveTab] = useState<'login' | 'registro' | 'recuperar' | 'verificar'>('login');
  const [loginForm, setLoginForm] = useState({
    email: '',
    senha: '',
    lembrar_me: false
  });
  const [registroForm, setRegistroForm] = useState({
    tipo: 'pessoal' as 'pessoal' | 'empresarial',
    nome: '',
    email: '',
    senha: '',
    confirmar_senha: '',
    telefone: '',
    cpf: '',
    empresa: '',
    cnpj: '',
    cargo: '',
    setor: '',
    tamanho_empresa: '' as 'pequena' | 'media' | 'grande' | '',
    termos: false,
    newsletter: false
  });
  const [recuperarForm, setRecuperarForm] = useState({
    email: ''
  });
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem({ tipo: '', texto: '' });
    
    // Simular login
    setTimeout(() => {
      setIsLoading(false);
      setMensagem({ tipo: 'sucesso', texto: 'Login realizado com sucesso!' });
      // Redirecionar para dashboard
    }, 2000);
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registroForm.senha !== registroForm.confirmar_senha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem!' });
      return;
    }
    
    if (!registroForm.termos) {
      setMensagem({ tipo: 'erro', texto: 'Você deve aceitar os termos de uso!' });
      return;
    }
    
    setIsLoading(true);
    setMensagem({ tipo: '', texto: '' });
    
    // Simular registro
    setTimeout(() => {
      setIsLoading(false);
      setMensagem({ tipo: 'sucesso', texto: 'Conta criada com sucesso! Verifique seu email.' });
      setActiveTab('verificar');
    }, 2000);
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem({ tipo: '', texto: '' });
    
    // Simular recuperação
    setTimeout(() => {
      setIsLoading(false);
      setMensagem({ tipo: 'sucesso', texto: 'Email de recuperação enviado!' });
    }, 2000);
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem({ tipo: '', texto: '' });
    
    // Simular verificação
    setTimeout(() => {
      setIsLoading(false);
      setMensagem({ tipo: 'sucesso', texto: 'Email verificado com sucesso!' });
      setTimeout(() => {
        setActiveTab('login');
      }, 1500);
    }, 2000);
  };

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarTelefone = (telefone: string) => {
    return telefone.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">VB</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VB Solutions</h1>
          <p className="text-gray-600">Sistema de Gestão Empresarial</p>
        </div>

        {/* Message */}
        {mensagem.texto && (
          <div className={`mb-4 p-4 rounded-lg text-sm ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Login Tab */}
        {activeTab === 'login' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Entrar</h2>
              <p className="text-gray-600">Acesse sua conta</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.senha}
                    onChange={(e) => setLoginForm({...loginForm, senha: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={loginForm.lembrar_me}
                    onChange={(e) => setLoginForm({...loginForm, lembrar_me: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('recuperar')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Esqueceu a senha?
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  onClick={() => setActiveTab('registro')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Cadastre-se
                </button>
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center text-xs text-gray-500 mb-4">Ou entre com</div>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span>🔍</span>
                  <span className="text-sm">Google</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span>📘</span>
                  <span className="text-sm">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registration Tab */}
        {activeTab === 'registro' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Criar Conta</h2>
              <p className="text-gray-600">Comece seu teste gratuito</p>
            </div>
            
            <form onSubmit={handleRegistro} className="space-y-4">
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistroForm({...registroForm, tipo: 'pessoal'})}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      registroForm.tipo === 'pessoal'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">👤</div>
                    <div className="text-sm font-medium">Pessoal</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistroForm({...registroForm, tipo: 'empresarial'})}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      registroForm.tipo === 'empresarial'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">🏢</div>
                    <div className="text-sm font-medium">Empresarial</div>
                  </button>
                </div>
              </div>
              
              {/* Personal Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={registroForm.nome}
                    onChange={(e) => setRegistroForm({...registroForm, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={registroForm.email}
                    onChange={(e) => setRegistroForm({...registroForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registroForm.senha}
                      onChange={(e) => setRegistroForm({...registroForm, senha: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registroForm.confirmar_senha}
                      onChange={(e) => setRegistroForm({...registroForm, confirmar_senha: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Repita a senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={registroForm.telefone}
                    onChange={(e) => setRegistroForm({...registroForm, telefone: formatarTelefone(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 98765-4321"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={registroForm.cpf}
                    onChange={(e) => setRegistroForm({...registroForm, cpf: formatarCPF(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>
              
              {/* Company Fields */}
              {registroForm.tipo === 'empresarial' && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Empresa</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                        <input
                          type="text"
                          value={registroForm.empresa}
                          onChange={(e) => setRegistroForm({...registroForm, empresa: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nome da empresa"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                        <input
                          type="text"
                          value={registroForm.cnpj}
                          onChange={(e) => setRegistroForm({...registroForm, cnpj: formatarCNPJ(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="00.000.000/0000-00"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                        <input
                          type="text"
                          value={registroForm.cargo}
                          onChange={(e) => setRegistroForm({...registroForm, cargo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Seu cargo"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho da Empresa</label>
                        <select
                          value={registroForm.tamanho_empresa}
                          onChange={(e) => setRegistroForm({...registroForm, tamanho_empresa: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="pequena">Pequena (1-50 funcionários)</option>
                          <option value="media">Média (51-200 funcionários)</option>
                          <option value="grande">Grande (200+ funcionários)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Terms */}
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={registroForm.termos}
                    onChange={(e) => setRegistroForm({...registroForm, termos: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Concordo com os{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-800 underline">
                      Termos de Uso
                    </button>{' '}
                    e{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-800 underline">
                      Política de Privacidade
                    </button>
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={registroForm.newsletter}
                    onChange={(e) => setRegistroForm({...registroForm, newsletter: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Desejo receber novidades e dicas por email
                  </span>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Entrar
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Password Recovery Tab */}
        {activeTab === 'recuperar' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recuperar Senha</h2>
              <p className="text-gray-600">Enviaremos um link para redefinir sua senha</p>
            </div>
            
            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={recuperarForm.email}
                  onChange={(e) => setRecuperarForm({...recuperarForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setActiveTab('login')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Voltar para o login
              </button>
            </div>
          </div>
        )}

        {/* Email Verification Tab */}
        {activeTab === 'verificar' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✉️</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verificar Email</h2>
              <p className="text-gray-600">Digite o código de verificação enviado para seu email</p>
            </div>
            
            <form onSubmit={handleVerificarCodigo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Verificação</label>
                <input
                  type="text"
                  value={codigoVerificacao}
                  onChange={(e) => setCodigoVerificacao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Verificando...' : 'Verificar Email'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Não recebeu o código?</p>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Reenviar código
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p className="mb-2">
            Ao usar nossos serviços, você concorda com nossos{' '}
            <button className="text-blue-600 hover:text-blue-800 underline">
              Termos de Uso
            </button>{' '}
            e{' '}
            <button className="text-blue-600 hover:text-blue-800 underline">
              Política de Privacidade
            </button>
          </p>
          <p>© 2024 VB Solutions. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}