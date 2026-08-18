/* ============================================================
   script.js — Feira Tech ETEC MCM
   Versão COMPLETA (todas as páginas) + integração API + fallback
   ============================================================ */

// ============================================================
// CONFIGURAÇÃO — AJUSTE AQUI!
// ============================================================
const USE_API = true;
// Detecta automaticamente a URL da API com base em onde o index.html está
// hospedado (ex: http://localhost/projeto_feira/ -> .../projeto_feira/api).
// Isso evita ter que editar esse valor manualmente ao mover a pasta do projeto.
const API_BASE = window.location.href.replace(/#.*$/, '').replace(/index\.html$/, '').replace(/\/$/, '') + '/api';

// Lista oficial de cursos técnicos da ETEC Maria Cristina Medeiros usada no
// cadastro de projetos e nos filtros do catálogo.
const COURSES = [
  'Informática para Internet',
  'Desenvolvimento de Sistemas',
  'Química',
  'Logística',
  'Recursos Humanos',
  'Administração',
  'Qualidade',
];
const PERIODOS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
];
const TURMA_TO_CURSO = {
  '1°A': 'Administração', '2°A': 'Administração', '3°A': 'Administração',
  '1°B': 'Recursos Humanos', '2°B': 'Recursos Humanos', '3°B': 'Recursos Humanos',
  '1°C': 'Informática para Internet', '2°C': 'Informática para Internet', '3°C': 'Informática para Internet',
  '1°E': 'Desenvolvimento de Sistemas', '2°E': 'Desenvolvimento de Sistemas', '3°E': 'Desenvolvimento de Sistemas',
  '1°F': 'Informática para Internet', '2°F': 'Informática para Internet', '3°F': 'Informática para Internet',
  '1°I': 'Química', '2°I': 'Química', '3°I': 'Química',
  '1°J': 'Química', '2°J': 'Química', '3°J': 'Química',
  '1°D': 'Administração', '2°D': 'Administração', '3°D': 'Administração',
  '1°H': 'Química', '2°H': 'Química', '3°H': 'Química',
  '1°K': 'Logística', '2°K': 'Logística', '3°K': 'Logística',
  '1°R': 'Recursos Humanos', '2°R': 'Recursos Humanos', '3°R': 'Recursos Humanos',
  '1°Q': 'Qualidade', '2°Q': 'Qualidade', '3°Q': 'Qualidade',
};
function inferCursoFromTurma(turma) {
  if (!turma) return '';
  const normalized = String(turma).trim();
  const direct = Object.entries(TURMA_TO_CURSO).find(([key]) => key.toUpperCase() === normalized.toUpperCase());
  if (direct) return direct[1];

  const upper = normalized.toUpperCase();
  if (upper.includes('A')) return 'Administração';
  if (upper.includes('B')) return 'Recursos Humanos';
  if (upper.includes('E')) return 'Desenvolvimento de Sistemas';
  if (upper.includes('C') || upper.includes('F')) return 'Informática para Internet';
  if (upper.includes('I') || upper.includes('J') || upper.includes('H')) return 'Química';
  if (upper.includes('K')) return 'Logística';
  if (upper.includes('R')) return 'Recursos Humanos';
  if (upper.includes('Q')) return 'Qualidade';
  if (upper.includes('D')) return 'Administração';
  return '';
}
const TURMAS_POR_PERIODO = {
  manha: [
    { value: '1°A', label: '1°A' },
    { value: '2°A', label: '2°A' },
    { value: '3°A', label: '3°A' },
    { value: '1°B', label: '1°B' },
    { value: '2°B', label: '2°B' },
    { value: '3°B', label: '3°B' },
    { value: '1°C', label: '1°C' },
    { value: '2°C', label: '2°C' },
    { value: '3°C', label: '3°C' },
    { value: '1°E', label: '1°E' },
    { value: '2°E', label: '2°E' },
    { value: '3°E', label: '3°E' },
  ],
  tarde: [
    { value: '1°F', label: '1°F' },
    { value: '2°F', label: '2°F' },
    { value: '3°F', label: '3°F' },
    { value: '1°I', label: '1°I' },
    { value: '2°I', label: '2°I' },
    { value: '3°I', label: '3°I' },
  ],
  noite: [
    { value: '1°D', label: '1°D' },
    { value: '2°D', label: '2°D' },
    { value: '3°D', label: '3°D' },
    { value: '1°H', label: '1°H' },
    { value: '2°H', label: '2°H' },
    { value: '3°H', label: '3°H' },
    { value: '1°K', label: '1°K' },
    { value: '2°K', label: '2°K' },
    { value: '3°K', label: '3°K' },
    { value: '1°R', label: '1°R' },
    { value: '2°R', label: '2°R' },
    { value: '3°R', label: '3°R' },
    { value: '1°Q', label: '1°Q' },
    { value: '2°Q', label: '2°Q' },
    { value: '3°Q', label: '3°Q' },
  ],
};
// Objetivos de Desenvolvimento Sustentável (ONU) — usados no cadastro de
// projetos para indicar a qual ODS o projeto está relacionado.
const ODS_LIST = [
  '1 · Erradicação da Pobreza',
  '2 · Fome Zero e Agricultura Sustentável',
  '3 · Saúde e Bem-Estar',
  '4 · Educação de Qualidade',
  '5 · Igualdade de Gênero',
  '6 · Água Potável e Saneamento',
  '7 · Energia Limpa e Acessível',
  '8 · Trabalho Decente e Crescimento Econômico',
  '9 · Indústria, Inovação e Infraestrutura',
  '10 · Redução das Desigualdades',
  '11 · Cidades e Comunidades Sustentáveis',
  '12 · Consumo e Produção Responsáveis',
  '13 · Ação Contra a Mudança Global do Clima',
  '14 · Vida na Água',
  '15 · Vida Terrestre',
  '16 · Paz, Justiça e Instituições Eficazes',
  '17 · Parcerias e Meios de Implementação',
];

// ============================================================
// ICONES
// ============================================================
const ICON = {
  home: `<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>`,
  grid: `<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>`,
  map: `<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/>`,
  news: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h6M7 12h10M7 16h10"/>`,
  trophy: `<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3"/>`,
  vote: `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>`,
  users: `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17" cy="8" r="3"/><path d="M16 13.2c2.7.5 4.7 2.9 4.7 5.8"/>`,
  bell: `<path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/>`,
  search: `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>`,
  menu: `<path d="M3 6h18M3 12h18M3 18h18"/>`,
  close: `<path d="M18 6 6 18M6 6l12 12"/>`,
  chevronRight: `<path d="m9 6 6 6-6 6"/>`,
  arrowRight: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  check: `<path d="M20 6 9 17l-5-5"/>`,
  checkCircle: `<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.3 2.3 4.7-5.1"/>`,
  x: `<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>`,
  alert: `<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>`,
  leaf: `<path d="M4 20c8-1 14-6 15-15C10 6 5 12 4 20Z"/><path d="M4 20c1-5 4-8 8-10"/>`,
  cpu: `<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2"/>`,
  upload: `<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>`,
  file: `<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/>`,
  qr: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7zm6 0h4v4h-4zm-6 6h4v4H7zm8-2h2v2h-2zm2 4h2v2h-2zm-6 0h2v2h-2z"/>`,
  video: `<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 9 6-3v12l-6-3"/>`,
  edit: `<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>`,
  trash: `<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>`,
  star: `<path d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18l-6.4 3.7 1.4-7.2-5.3-5 7.2-.9L12 2Z"/>`,
  filter: `<path d="M4 4h16l-6 8v6l-4 2v-8L4 4Z"/>`,
  building: `<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/>`,
  chart: `<path d="M4 20V10M12 20V4M20 20v-7"/>`,
  eye: `<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>`,
  lock: `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
  phone: `<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>`,
  gitHub: `<path d="M9 19c-4.3 1.3-4.3-2.5-6-3m12 5v-3.4c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.2a11.5 11.5 0 0 0-6 0C6.7 2.9 5.7 3.2 5.7 3.2a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.3 9.6c0 4.6 2.7 5.7 5.5 6-.6.5-.6 1.1-.5 2V21"/>`,
  globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>`,
  download: `<path d="M12 4v13M7 12l5 5 5-5"/><path d="M5 21h14"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>`,
  pin: `<path d="M12 21s7-6.6 7-12a7 7 0 0 0-14 0c0 5.4 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>`,
  layers: `<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>`,
  shield: `<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3"/>`,
  send: `<path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7Z"/>`,
  refresh: `<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>`,
  external: `<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/>`,
  key: `<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 19 4M15 9l3 3M18 6l3 3"/>`,
  copy: `<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`,
};

function icon(name, size = 20, strokeW = 2) {
  return `<svg class="leaf-mark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">${ICON[name] || ''}</svg>`;
}

function signatureMark(size = 32) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none">
    <defs><linearGradient id="lcg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#DC2430"/><stop offset="0.55" stop-color="#3E6B8C"/><stop offset="1" stop-color="#E76F51"/>
    </linearGradient></defs>
    <path d="M20 3C11 3 4 9 4 20c0 9 6 15 16 17 10-2 16-8 16-17C36 9 29 3 20 3Z" fill="url(#lcg)" opacity="0.12"/>
    <path d="M20 6c-8 1-13 6-13 14 0 7 4.5 12 13 14 8.5-2 13-7 13-14 0-8-5-13-13-14Z" stroke="url(#lcg)" stroke-width="2.2"/>
    <circle cx="20" cy="14" r="2.2" fill="#DC2430"/>
    <circle cx="14" cy="22" r="2.2" fill="#E76F51"/>
    <circle cx="26" cy="22" r="2.2" fill="#3E6B8C"/>
    <circle cx="20" cy="28" r="2.2" fill="#DC2430"/>
    <path d="M20 16v4M20 20l-5 2M20 20l5 2" stroke="url(#lcg)" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

/* ============================================================
   DADOS MOCK (FALLBACK)
   ============================================================ */
const MOCK = {
  categories: [
    { id: 'c1', name: 'Inteligência Artificial', color: 'blue', icon: 'cpu' },
    { id: 'c2', name: 'Sustentabilidade', color: 'green', icon: 'leaf' },
    { id: 'c3', name: 'Robótica', color: 'blue', icon: 'cpu' },
    { id: 'c4', name: 'IoT & Automação', color: 'blue', icon: 'cpu' },
    { id: 'c5', name: 'Saúde Digital', color: 'blue', icon: 'cpu' },
    { id: 'c6', name: 'Energias Renováveis', color: 'green', icon: 'leaf' },
  ],
  get courses() { return COURSES; },
  teachers: [
    { id: 't1', name: 'Profa. Marina Souza', course: 'Desenvolvimento de Sistemas', avatar: 'MS' },
    { id: 't2', name: 'Prof. Ricardo Nunes', course: 'Eletrônica', avatar: 'RN' },
    { id: 't3', name: 'Profa. Bianca Alves', course: 'Meio Ambiente', avatar: 'BA' },
    { id: 't4', name: 'Prof. Diego Fontes', course: 'Administração', avatar: 'DF' },
  ],
  users: [
    { id: 'u1', name: 'Administrador Geral', email: 'admin@etecmcm.sp.gov.br', role: 'admin', avatar: 'AG' },
    { id: 'u2', name: 'Marina Souza', email: 'marina.souza@etecmcm.sp.gov.br', role: 'professor', avatar: 'MS' },
    { id: 'u3', name: 'Lucas Andrade', email: 'lucas.andrade@etec.aluno.sp.gov.br', role: 'aluno', course: 'Desenvolvimento de Sistemas', turma: '3ºDS-A', avatar: 'LA' },
    { id: 'u4', name: 'Visitante', email: 'visitante@email.com', role: 'visitante', avatar: 'VI' },
  ],
  stands: [
    { id: 'e1', code: 'A1', x: 12, y: 18 }, { id: 'e2', code: 'A2', x: 12, y: 38 }, { id: 'e3', code: 'A3', x: 12, y: 58 },
    { id: 'e4', code: 'B1', x: 34, y: 18 }, { id: 'e5', code: 'B2', x: 34, y: 38 }, { id: 'e6', code: 'B3', x: 34, y: 58 },
    { id: 'e7', code: 'C1', x: 56, y: 18 }, { id: 'e8', code: 'C2', x: 56, y: 38 }, { id: 'e9', code: 'C3', x: 56, y: 58 },
    { id: 'e10', code: 'D1', x: 78, y: 18 }, { id: 'e11', code: 'D2', x: 78, y: 38 }, { id: 'e12', code: 'D3', x: 78, y: 58 },
  ],
  projects: [
    { id: 'p1', name: 'EcoWatt — Monitor Inteligente de Energia', summary: 'Dispositivo IoT que monitora consumo elétrico residencial em tempo real.', description: 'O EcoWatt é um sistema embarcado com ESP32 que coleta dados de consumo.', objectives: ['Reduzir em até 18% o consumo', 'Democratizar dados'], tech: ['ESP32', 'Node.js', 'React'], category: 'c4', course: 'Eletrônica', teacher: 't2', team: ['Lucas Andrade', 'Beatriz Lima'], stand: 'e1', status: 'aprovado', image: '⚡', votes: 284, createdAt: '2026-03-02', github: '', site: '', files: [], comments: [] },
    { id: 'p2', name: 'AgroSense — Irrigação Inteligente', summary: 'Sistema com sensores de umidade para automação de irrigação.', description: 'AgroSense combina sensores de umidade e previsão do tempo.', objectives: ['Economizar até 40% de água', 'Aumentar produtividade'], tech: ['Arduino', 'Python'], category: 'c6', course: 'Meio Ambiente', teacher: 't3', team: ['Ana Beatriz Costa', 'Rafael Torres'], stand: 'e2', status: 'aprovado', image: '🌱', votes: 341, createdAt: '2026-02-20', github: '', site: '', files: [], comments: [] },
    { id: 'p3', name: 'MedAssist AI — Triagem Inteligente', summary: 'Assistente com IA para auxiliar na triagem inicial.', description: 'MedAssist AI usa classificação para priorizar atendimentos.', objectives: ['Reduzir tempo de espera', 'Apoio à decisão clínica'], tech: ['Python', 'Scikit-learn', 'Flask'], category: 'c5', course: 'Desenvolvimento de Sistemas', teacher: 't1', team: ['Gabriel Martins', 'Sofia Ribeiro'], stand: 'e3', status: 'aprovado', image: '🩺', votes: 412, createdAt: '2026-01-15', github: '', site: '', files: [], comments: [] },
    { id: 'p4', name: 'RoboLimp — Robô Coletor de Resíduos', summary: 'Robô autônomo que identifica e recolhe recicláveis.', description: 'RoboLimp usa câmera, OpenCV e braço robótico.', objectives: ['Automatizar coleta seletiva', 'Educar sobre reciclagem'], tech: ['Raspberry Pi', 'OpenCV', 'Python'], category: 'c3', course: 'Eletrônica', teacher: 't2', team: ['Pedro Henrique Alves', 'Camila Duarte'], stand: 'e4', status: 'aprovado', image: '🤖', votes: 198, createdAt: '2026-03-10', github: '', site: '', files: [], comments: [] },
    { id: 'p5', name: 'FinLearn — Educação Financeira Gamificada', summary: 'Plataforma web que ensina finanças através de simulações.', description: 'FinLearn transforma educação financeira em jogos.', objectives: ['Melhorar literacia financeira', 'Engajar via gamificação'], tech: ['React', 'Firebase'], category: 'c1', course: 'Administração', teacher: 't4', team: ['Isabela Fernandes', 'Thiago Souza'], stand: 'e5', status: 'aprovado', image: '💰', votes: 156, createdAt: '2026-02-05', github: '', site: '', files: [], comments: [] },
    { id: 'p6', name: 'BioFiltro — Tratamento de Água de Baixo Custo', summary: 'Sistema de filtragem biológica usando materiais reciclados.', description: 'BioFiltro usa areia, carvão e biofilme para purificar água.', objectives: ['Reduzir doenças hídricas', 'Saneamento acessível'], tech: ['Química aplicada', 'Materiais reciclados'], category: 'c2', course: 'Química', teacher: 't3', team: ['Larissa Melo', 'Vitor Hugo Prado'], stand: 'e6', status: 'aprovado', image: '💧', votes: 227, createdAt: '2026-01-28', github: '', site: '', files: [], comments: [] },
    { id: 'p7', name: 'SmartRoute — Otimização de Rotas Escolares', summary: 'Algoritmo que otimiza rotas de vans escolares.', description: 'SmartRoute aplica algoritmo do caixeiro viajante.', objectives: ['Reduzir tempo de trajeto', 'Diminuir emissão de CO₂'], tech: ['Python', 'OR-Tools'], category: 'c4', course: 'Logística', teacher: 't4', team: ['Matheus Rocha', 'Julia Prado'], stand: 'e7', status: 'pendente', image: '🚐', votes: 0, createdAt: '2026-03-18', github: '', site: '', files: [], comments: [] },
    { id: 'p8', name: 'VisãoLibras — Tradutor de Libras em Tempo Real', summary: 'Aplicativo que traduz gestos em Libras para texto.', description: 'VisãoLibras usa câmera do celular para capturar sinais.', objectives: ['Promover inclusão', 'Ferramenta open-source'], tech: ['TensorFlow Lite', 'React Native'], category: 'c1', course: 'Desenvolvimento de Sistemas', teacher: 't1', team: ['Fernanda Costa', 'Bruno Lima'], stand: 'e8', status: 'aprovado', image: '🤟', votes: 389, createdAt: '2026-01-10', github: '', site: '', files: [], comments: [] },
  ],
  news: [
    { id: 'n1', title: 'Feira Tech 2026 abre inscrições', category: 'Institucional', author: 'Comunicação ETEC', date: '2026-01-10', excerpt: 'Já estão abertas as inscrições.', comments: 12 },
    { id: 'n2', title: 'Votação bate recorde', category: 'Novidades', author: 'Equipe', date: '2026-03-15', excerpt: 'Mais de 3 mil votos.', comments: 34 },
    { id: 'n3', title: 'Parceria com empresas', category: 'Parcerias', author: 'Direção', date: '2026-02-22', excerpt: 'Três empresas confirmaram apoio.', comments: 8 },
    { id: 'n4', title: 'Avaliação técnica dos projetos', category: 'Institucional', author: 'Coordenação', date: '2026-02-01', excerpt: 'Entenda os critérios.', comments: 5 },
  ],
  schedule: [
    { id: 's1', date: '2026-04-06', time: '08:00', title: 'Credenciamento e abertura', location: 'Pátio Central', status: 'agendado' },
    { id: 's2', date: '2026-04-06', time: '09:30', title: 'Exposição de projetos — Manhã', location: 'Ginásio', status: 'agendado' },
    { id: 's3', date: '2026-04-06', time: '13:30', title: 'Avaliação técnica', location: 'Estandes', status: 'agendado' },
    { id: 's4', date: '2026-04-06', time: '16:00', title: 'Palestra: IA aplicada à sustentabilidade', location: 'Auditório', status: 'agendado' },
    { id: 's5', date: '2026-04-07', time: '09:00', title: 'Exposição — Dia 2', location: 'Ginásio', status: 'agendado' },
    { id: 's6', date: '2026-04-07', time: '15:00', title: 'Encerramento da votação', location: 'Online', status: 'agendado' },
    { id: 's7', date: '2026-04-07', time: '17:30', title: 'Premiação', location: 'Auditório', status: 'agendado' },
  ],
  evaluations: [],
  notifications: [
    { id: 'not1', userId: 'u1', title: 'Novo projeto pendente', message: 'SmartRoute aguarda aprovação.', read: false, date: '2026-03-18' },
    { id: 'not2', userId: 'u3', title: 'Projeto aprovado!', message: 'Seu projeto foi aprovado.', read: false, date: '2026-03-02' },
    { id: 'not3', userId: 'u3', title: 'Novo voto', message: 'Seu projeto recebeu um voto.', read: true, date: '2026-02-10' },
  ],
  logs: [
    { id: 'l1', user: 'Admin', action: 'Aprovou projeto EcoWatt', date: '2026-03-02 14:22' },
    { id: 'l2', user: 'Profa. Marina', action: 'Avaliou MedAssist AI', date: '2026-03-05 10:05' },
  ],
  offices: [
    { id: 'o1', titulo: 'Introdução à IA', descricao: 'Conceitos básicos de IA.', instrutor: 'Prof. Ricardo', data: '2026-04-06', hora: '10:00', local: 'Sala 101', vagas: 30 },
    { id: 'o2', titulo: 'Sustentabilidade na Prática', descricao: 'Projetos sustentáveis.', instrutor: 'Profa. Bianca', data: '2026-04-06', hora: '14:00', local: 'Sala 102', vagas: 25 },
  ],
};

/* ============================================================
   NORMALIZAÇÃO DE DADOS DA API
   O banco de dados (PHP/MySQL) usa nomes de coluna em português/snake_case
   (nome, resumo, categoria_id, votos, criado_por...). Todo o front-end foi
   escrito esperando objetos em camelCase (name, summary, category, votes...).
   As funções abaixo fazem essa conversão para que os dados vindos do banco
   funcionem exatamente como os dados MOCK.
   ============================================================ */
function safeParseArray(v) {
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined || v === '') return [];
  if (typeof v === 'object') return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch (e) { return []; }
}
function normalizeProject(row) {
  if (!row) return row;
  const equipeRaw = safeParseArray(row.equipe);
  const membrosNomes = safeParseArray(row.membros_nomes || row.team_names || row.equipe);
  const teamNames = (equipeRaw.length ? equipeRaw : membrosNomes).filter(Boolean);
  return {
    id: row.id,
    name: row.nome,
    summary: row.resumo || '',
    description: row.descricao || '',
    objectives: safeParseArray(row.objetivos),
    tech: safeParseArray(row.tecnologias),
    category: row.categoria_id,
    categoryName: row.categoria_nome,
    categoryColor: row.categoria_cor,
    course: row.curso,
    turma: row.turma,
    periodo: row.periodo,
    teacher: row.professor_id,
    teacherName: row.professor_nome,
    team: teamNames,
    stand: row.stand_id,
    criadoPor: row.criado_por,
    creatorName: row.criador_nome || '',
    status: row.status,
    image: row.imagem || '💡',
    cover: row.capa || null,
    votes: Number(row.votos || 0),
    createdAt: row.created_at,
    github: row.github || '',
    site: row.site || '',
    ods: row.ods || '',
    links: row.links || '',
    qrLink: row.qr_link || '',
    qrCode: row.qr_code || '',
    membros: safeParseArray(row.membros),
    document: row.documento || null,
    files: [],
    comments: safeParseArray(row.comments),
  };
}
function normalizeTeacher(row) {
  if (!row) return row;
  return { id: row.id, name: row.nome, course: row.curso, avatar: row.avatar || (row.nome ? initials(row.nome) : '??') };
}
function normalizeCategory(row) {
  if (!row) return row;
  return { id: row.id, name: row.nome, color: row.cor, icon: row.icone };
}
function normalizeNotification(row) {
  if (!row) return row;
  return { id: row.id, userId: row.usuario_id, title: row.titulo, message: row.mensagem, read: !!Number(row.lida), date: row.data };
}
function normalizeNews(row) {
  if (!row) return row;
  return { id: row.id, title: row.titulo, category: row.categoria, author: row.autor, date: row.data, excerpt: row.resumo, comments: Number(row.comentarios || 0) };
}
function normalizeSchedule(row) {
  if (!row) return row;
  return { id: row.id, date: row.data, time: String(row.hora || '').slice(0, 5), title: row.titulo, location: row.local, status: row.status };
}
function normalizeUser(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.nome,
    email: row.email,
    role: row.role,
    course: row.curso || '',
    curso: row.curso || '',
    turma: row.turma || '',
    periodo: row.periodo || '',
    telefone: row.telefone || '',
    bio: row.bio || '',
    avatar: row.avatar || (row.nome ? initials(row.nome) : '??'),
    createdAt: row.created_at,
  };
}

/* ============================================================
   CLASSE DataManager
   ============================================================ */
class DataManager {
  constructor() {
    this.useApi = USE_API;
    this.apiBase = API_BASE;
    this.cache = {
      categories: null,
      projects: null,
      news: null,
      schedule: null,
      users: null,
      offices: null,
      logs: null,
      notifications: [],
    };
  }

  async _fetch(endpoint, options = {}) {
    if (!this.useApi) throw new Error('API desabilitada');
    const url = `${this.apiBase}/${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status}`);
    }
    return res.json();
  }

  // Categorias
  async getCategories() {
    try {
      const data = await this._fetch('categories.php');
      const normalized = data.map(normalizeCategory);
      this.cache.categories = normalized;
      return normalized;
    } catch (e) {
      console.warn('Fallback categorias', e);
      return MOCK.categories;
    }
  }

  // Professores (orientadores) — usado no select do cadastro de projetos
  async getTeachers() {
    try {
      const data = await this._fetch('teachers.php');
      return data.map(normalizeTeacher);
    } catch (e) {
      console.warn('Fallback professores', e);
      return MOCK.teachers;
    }
  }

  // Projetos
  async getProjects(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const data = await this._fetch(`projects/list.php?${params}`);
      const normalized = data.map(normalizeProject);
      this.cache.projects = normalized;
      return normalized;
    } catch (e) {
      console.warn('Fallback projetos', e);
      return MOCK.projects;
    }
  }

  async getProject(id) {
    try {
      const data = await this._fetch(`projects/detail.php?id=${id}`);
      return normalizeProject(data);
    } catch (e) {
      console.warn('Fallback projeto', e);
      return MOCK.projects.find(p => p.id === id) || null;
    }
  }

  async createProject(data) {
    if (!this.useApi) {
      const newProject = { ...data, id: 'p' + Date.now(), votes: 0 };
      MOCK.projects.push(newProject);
      return { success: true, id: newProject.id };
    }
    return await this._fetch('projects/create.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(data) {
    if (!this.useApi) {
      const idx = MOCK.projects.findIndex(p => p.id === data.id);
      if (idx > -1) Object.assign(MOCK.projects[idx], data);
      return { success: true };
    }
    return await this._fetch('projects/update.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id, usuario_id = null) {
    if (!this.useApi) {
      const idx = MOCK.projects.findIndex(p => p.id === id);
      if (idx > -1) MOCK.projects.splice(idx, 1);
      return { success: true };
    }
    return await this._fetch('projects/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id, usuario_id }),
    });
  }

  // Busca um projeto pela chave (id) + senha de acesso gerados no cadastro.
  // Usado em "Encontrar meu projeto".
  async findProjectByKey(chave, senha) {
    if (!this.useApi) throw new Error('Indisponível no modo offline');
    return await this._fetch('projects/find.php', {
      method: 'POST',
      body: JSON.stringify({ chave, senha }),
    });
  }

  // Usa a chave + senha do projeto para entrar nele como integrante.
  async joinProjectAsMember(chave, senha, usuario_id) {
    if (!this.useApi) throw new Error('Indisponível no modo offline');
    return await this._fetch('projects/join.php', {
      method: 'POST',
      body: JSON.stringify({ chave, senha, usuario_id }),
    });
  }

  async approveProject(id, status, usuario) {
    if (!this.useApi) {
      const p = MOCK.projects.find(x => x.id === id);
      if (p) p.status = status;
      return { success: true };
    }
    return await this._fetch('projects/approve.php', {
      method: 'POST',
      body: JSON.stringify({ id, status, usuario }),
    });
  }

  // Votação
  async vote(usuario_id, projeto_id) {
    if (!this.useApi) {
      const p = MOCK.projects.find(x => x.id === projeto_id);
      if (p) p.votes = (p.votes || 0) + 1;
      return { success: true };
    }
    return await this._fetch('vote.php', {
      method: 'POST',
      body: JSON.stringify({ usuario_id, projeto_id }),
    });
  }

  // Comentários
  async getComments(projeto_id) {
    try {
      return await this._fetch(`comments.php?projeto_id=${encodeURIComponent(projeto_id)}`);
    } catch (e) {
      console.warn('Erro ao buscar comentários', e);
      return [];
    }
  }

  async addComment(projeto_id, usuario_id, text) {
    if (!this.useApi) {
      const p = MOCK.projects.find(x => x.id === projeto_id);
      if (p) {
        if (!p.comments) p.comments = [];
        p.comments.push({ author: 'Usuário', text, date: new Date().toISOString() });
      }
      return { success: true };
    }
    return await this._fetch('comments.php', {
      method: 'POST',
      body: JSON.stringify({ projeto_id, usuario_id, text }),
    });
  }

  // Avaliação
  async saveEvaluation(data) {
    if (!this.useApi) {
      MOCK.evaluations.push({ ...data, id: 'ev' + Date.now() });
      return { success: true };
    }
    return await this._fetch('evaluation.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Oficinas
  async getOffices(usuario_id = null) {
    try {
      let url = 'offices.php';
      if (usuario_id) url += `?usuario_id=${encodeURIComponent(usuario_id)}`;
      const data = await this._fetch(url);
      this.cache.offices = data;
      return data;
    } catch (e) {
      console.warn('Fallback oficinas', e);
      return MOCK.offices || [];
    }
  }

  async enrollOffice(usuario_id, oficina_id) {
    if (!this.useApi) return { success: true };
    return await this._fetch('enroll.php', {
      method: 'POST',
      body: JSON.stringify({ usuario_id, oficina_id }),
    });
  }

  // Voto na melhor oficina (voto único, apenas entre as frequentadas)
  async voteOffice(usuario_id, oficina_id) {
    if (!this.useApi) return { success: true };
    return await this._fetch('oficina_vote.php', {
      method: 'POST',
      body: JSON.stringify({ usuario_id, oficina_id }),
    });
  }

  // Retorna os IDs dos projetos em que o usuário já votou (para restaurar
  // o estado do botão "Votar" após login/recarregar a página)
  async getUserVotes(usuario_id) {
    try {
      return await this._fetch(`user_votes.php?usuario_id=${encodeURIComponent(usuario_id)}`);
    } catch (e) {
      console.warn('Erro ao buscar votos do usuário', e);
      return [];
    }
  }

  // Notificações
  async getNotifications(usuario_id) {
    try {
      const data = await this._fetch(`notifications.php?usuario_id=${usuario_id}`);
      const normalized = data.map(normalizeNotification);
      this.cache.notifications = normalized;
      return normalized;
    } catch (e) {
      console.warn('Fallback notificações', e);
      return MOCK.notifications.filter(n => n.userId === usuario_id);
    }
  }

  async markNotificationRead(id) {
    if (!this.useApi) {
      const n = MOCK.notifications.find(x => x.id === id);
      if (n) n.read = true;
      return { success: true };
    }
    return await this._fetch('notifications_read.php', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  // Notícias
  async getNews() {
    try {
      const data = await this._fetch('news.php');
      const normalized = data.map(normalizeNews);
      this.cache.news = normalized;
      return normalized;
    } catch (e) {
      console.warn('Fallback notícias', e);
      return MOCK.news;
    }
  }

  // Cronograma
  async getSchedule() {
    try {
      const data = await this._fetch('schedule.php');
      const normalized = data.map(normalizeSchedule);
      this.cache.schedule = normalized;
      return normalized;
    } catch (e) {
      console.warn('Fallback cronograma', e);
      return MOCK.schedule;
    }
  }

  // Usuários (admin)
  async getUsers() {
    try {
      const data = await this._fetch('users.php');
      const normalized = data.map(normalizeUser);
      this.cache.users = normalized;
      return normalized;
    } catch (e) {
      console.warn('Fallback usuários', e);
      return MOCK.users;
    }
  }

  async createUser(data) {
    if (!this.useApi) {
      const newUser = { ...data, id: 'u' + Date.now() };
      MOCK.users.push(newUser);
      return { success: true, id: newUser.id };
    }
    return await this._fetch('users.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(data) {
    if (!this.useApi) {
      const idx = MOCK.users.findIndex(u => u.id === data.id);
      if (idx > -1) Object.assign(MOCK.users[idx], data);
      return { success: true };
    }
    return await this._fetch('users.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id) {
    if (!this.useApi) {
      const idx = MOCK.users.findIndex(u => u.id === id);
      if (idx > -1) MOCK.users.splice(idx, 1);
      return { success: true };
    }
    return await this._fetch('users.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Logs
  async getLogs() {
    try {
      const data = await this._fetch('logs.php');
      this.cache.logs = data;
      return data;
    } catch (e) {
      console.warn('Fallback logs', e);
      return MOCK.logs;
    }
  }

  // Auth
  async login(email, password) {
    if (!this.useApi) {
      const user = MOCK.users.find(u => u.email === email);
      if (user) return { success: true, user };
      throw new Error('Usuário não encontrado');
    }
    const result = await this._fetch('auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.user) result.user = normalizeUser(result.user);
    return result;
  }

  async register(name, email, password, role, extra = {}) {
    const turma = extra.turma || '';
    const curso = (extra.curso || inferCursoFromTurma(turma) || '').trim();
    const payload = { name, email, password, role, periodo: extra.periodo || '', curso, turma };
    if (!this.useApi) {
      const newUser = {
        id: 'u' + Date.now(),
        name,
        email,
        role,
        avatar: name.substring(0,2).toUpperCase(),
        course: payload.curso,
        curso: payload.curso,
        turma: payload.turma,
        periodo: payload.periodo,
      };
      MOCK.users.push(newUser);
      return { success: true, user: newUser };
    }
    const result = await this._fetch('auth/register.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (result.user) {
      result.user = normalizeUser(result.user);
      if (payload.periodo) result.user.periodo = payload.periodo;
      if (payload.turma) result.user.turma = payload.turma;
      if (payload.curso) result.user.curso = payload.curso;
      if (payload.curso) result.user.course = payload.curso;
    }
    return result;
  }

  async forgotPassword(email) {
    if (!this.useApi) return { success: true };
    return await this._fetch('auth/forgot.php', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout() {
    if (!this.useApi) return { success: true };
    return await this._fetch('auth/logout.php');
  }
}

const dataManager = new DataManager();

/* ============================================================
   SESSÃO (persistência local do login entre recarregamentos)
   ============================================================ */
const SESSION_KEY = 'feiraTechMcmSession';
function saveSession(user) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch (e) { /* ignore */ }
}
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
}

/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
const state = {
  route: '#/home',
  currentUser: null,
  votedProjects: new Set(),
  filters: { search: '', category: 'all', course: 'all', status: 'all', sort: 'votes' },
  toastId: 0,
  projects: [],
  news: [],
  schedule: [],
  categories: [],
  teachers: [],
  offices: [],
  notifications: [],
  users: [],
  logs: [],
};

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function escapeHtml(str) { return (str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function fmtDate(d) { const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtDateLong(d) { const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }); }
function categoryOf(id) { return state.categories.find(c => c.id === id) || MOCK.categories.find(c => c.id === id); }
function teacherOf(id, fallbackName) {
  const found = (state.teachers && state.teachers.length ? state.teachers : MOCK.teachers).find(t => t.id === id);
  if (found) return found;
  if (fallbackName) return { name: fallbackName, avatar: initials(fallbackName), course: '' };
  return null;
}
function standOf(id) { return MOCK.stands.find(s => s.id === id); }
function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function initials(name) { return name ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() : '??'; }
// Retorna o HTML do avatar de um usuário: se ele tiver enviado uma foto
// (avatar salvo como Data URL base64), mostra a imagem; caso contrário,
// mostra as iniciais do nome, como antes.
function avatarContent(user) {
  if (user && user.avatar && String(user.avatar).startsWith('data:')) {
    return `<img src="${user.avatar}" alt="${escapeHtml(user.name || '')}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
  }
  return (user && user.avatar && !String(user.avatar).startsWith('data:')) ? escapeHtml(user.avatar) : initials(user?.name);
}
function toast(msg, type = 'info', timeout = 3800) {
  const stack = $('#toast-stack');
  const id = 't' + (++state.toastId);
  const icons = { success: 'checkCircle', error: 'x', info: 'info' };
  const node = el(`<div class="toast ${type}" id="${id}">${icon(icons[type] || 'info', 18)}<span>${escapeHtml(msg)}</span></div>`);
  stack.appendChild(node);
  setTimeout(() => {
    node.style.transition = 'all 0.25s ease';
    node.style.opacity = '0';
    node.style.transform = 'translateX(40px)';
    setTimeout(() => node.remove(), 260);
  }, timeout);
}
function routeLoaderStart() {
  const l = $('#route-loader'); l.style.opacity = '1'; l.style.width = '70%';
}
function routeLoaderDone() {
  const l = $('#route-loader'); l.style.width = '100%';
  setTimeout(() => { l.style.opacity = '0'; setTimeout(() => l.style.width = '0%', 300); }, 180);
}

/* ============================================================
   NAVBAR e FOOTER (já prontos)
   ============================================================ */
const NAV_ITEMS = [
  { href: '#/home', label: 'Início' },
  { href: '#/projetos', label: 'Projetos' },
  { href: '#/cronograma', label: 'Cronograma' },
  { href: '#/mapa', label: 'Mapa' },
  { href: '#/noticias', label: 'Notícias' },
  { href: '#/ranking', label: 'Ranking' },
];
function roleLabel(role) {
  return { admin: 'Administrador', professor: 'Professor', aluno: 'Aluno', visitante: 'Visitante' }[role] || role;
}
function renderNavbar() {
  const u = state.currentUser;
  return `
  <header class="navbar">
    <div class="container navbar-inner">
      <a href="#/home" class="brand">${signatureMark(32)} <span>Feira Tech <span style="color:var(--green-600)">MCM</span></span><span class="tag">2026</span></a>
      <nav class="nav-links">
        ${NAV_ITEMS.map(n => `<a href="${n.href}" class="nav-link ${state.route === n.href ? 'active' : ''}">${n.label}</a>`).join('')}
      </nav>
      <div class="nav-actions">
        <button class="icon-btn" onclick="openSearchModal()" aria-label="Buscar">${icon('search', 19)}</button>
        ${u ? `<div style="position:relative" id="notif-menu-wrap">
          <button class="icon-btn" onclick="toggleNotifMenu()" aria-label="Notificações">${icon('bell', 19)}${getUnreadNotifications().length ? `<span class="badge-dot"></span>` : ''}</button>
          <div id="notif-menu-dropdown" style="display:none;position:absolute;right:0;top:48px;background:var(--white);border:1px solid var(--ink-100);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);width:320px;max-height:400px;overflow-y:auto;z-index:600;">
            <div style="padding:14px 16px;border-bottom:1px solid var(--ink-100);font-weight:700;font-size:14px;">Notificações</div>
            ${renderNotificationList()}
          </div>
        </div>` : ''}
        ${u ? `
          <div style="position:relative" id="user-menu-wrap">
            <div class="avatar" onclick="toggleUserMenu()" title="${escapeHtml(u.name)}" style="overflow:hidden;">${avatarContent(u)}</div>
            <div id="user-menu-dropdown" style="display:none;position:absolute;right:0;top:48px;background:var(--white);border:1px solid var(--ink-100);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);width:230px;overflow:hidden;z-index:600;">
              <div style="padding:14px 16px;border-bottom:1px solid var(--ink-100);">
                <div style="font-weight:700;fontsize:14px;">${escapeHtml(u.name)}</div>
                <div class="badge badge-green" style="margin-top:6px;">${roleLabel(u.role)}</div>
              </div>
              <a href="#/perfil" class="sidebar-link" style="margin:6px 8px;" onclick="closeUserMenu()">${icon('user', 17)} Meu perfil</a>
              ${u.role === 'professor' ? `<a href="#/area-professor" class="sidebar-link" style="margin:0 8px;" onclick="closeUserMenu()">${icon('layers', 17)} Área do professor</a>` : ''}
              ${u.role === 'admin' ? `<a href="#/admin" class="sidebar-link" style="margin:0 8px;" onclick="closeUserMenu()">${icon('shield', 17)} Painel admin</a>` : ''}
              <button class="sidebar-link" style="margin:0 8px 8px;width:calc(100% - 16px);color:var(--orange-600);" onclick="doLogout()">${icon('logout', 17)} Sair</button>
            </div>
          </div>
        ` : `
          <button class="btn btn-ghost btn-sm" onclick="openAuthModal('login')">Entrar</button>
          <button class="btn btn-primary btn-sm" onclick="openAuthModal('register')">Cadastrar</button>
        `}
        <button class="icon-btn mobile-toggle" onclick="toggleMobileNav()" aria-label="Menu">${icon('menu', 20)}</button>
      </div>
    </div>
    <div id="mobile-nav" style="display:none;border-top:1px solid var(--ink-100);background:var(--white);">
      <div class="container" style="padding:12px 20px;display:flex;flex-direction:column;gap:2px;">
        ${NAV_ITEMS.map(n => `<a href="${n.href}" class="nav-link" style="text-align:left;" onclick="toggleMobileNav()">${n.label}</a>`).join('')}
      </div>
    </div>
  </header>`;
}
function toggleMobileNav() { const m = $('#mobile-nav'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; }
function toggleUserMenu() { const m = $('#user-menu-dropdown'); if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none'; }
function closeUserMenu() { const m = $('#user-menu-dropdown'); if (m) m.style.display = 'none'; }
document.addEventListener('click', (e) => {
  const wrap = $('#user-menu-wrap');
  if (wrap && !wrap.contains(e.target)) closeUserMenu();
});
function getUnreadNotifications() {
  if (!state.currentUser) return [];
  return state.notifications.filter(n => n.userId === state.currentUser.id && !n.read);
}
function renderNotificationList() {
  const list = state.notifications.filter(n => n.userId === state.currentUser.id).sort((a, b) => b.date.localeCompare(a.date));
  if (!list.length) return `<div style="padding:24px;text-align:center;color:var(--ink-300);font-size:13.5px;">Nenhuma notificação por aqui.</div>`;
  return list.map(n => `
    <div onclick="markNotifRead('${n.id}')" style="padding:12px 16px;border-bottom:1px solid var(--ink-100);cursor:pointer;background:${n.read ? 'transparent' : 'var(--green-50)'};">
      <div class="flex justify-between items-start gap-8">
        <strong style="font-size:13.5px;">${escapeHtml(n.title)}</strong>
        ${!n.read ? `<span style="width:8px;height:8px;border-radius:50%;background:var(--green-600);flex-shrink:0;margin-top:4px;"></span>` : ''}
      </div>
      <p style="font-size:12.5px;color:var(--ink-500);margin-top:4px;">${escapeHtml(n.message)}</p>
      <span style="font-size:11px;color:var(--ink-300);">${fmtDate(n.date)}</span>
    </div>`).join('');
}
function toggleNotifMenu() {
  const m = $('#notif-menu-dropdown');
  if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
async function markNotifRead(id) {
  await dataManager.markNotificationRead(id);
  const n = state.notifications.find(x => x.id === id);
  if (n) n.read = true;
  $('#notif-menu-dropdown').innerHTML = `<div style="padding:14px 16px;border-bottom:1px solid var(--ink-100);font-weight:700;font-size:14px;">Notificações</div>` + renderNotificationList();
  $all('.icon-btn .badge-dot').forEach(b => { if (!getUnreadNotifications().length) b.remove(); });
}
document.addEventListener('click', (e) => {
  const wrap = $('#notif-menu-wrap');
  if (wrap && !wrap.contains(e.target)) { const m = $('#notif-menu-dropdown'); if (m) m.style.display = 'none'; }
});
function renderFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="grid" style="grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;">
        <div>
          <div class="flex items-center gap-8" style="margin-bottom:14px;">${signatureMark(30)}<strong style="font-family:var(--font-display);font-size:16px;">Feira Tech MCM</strong></div>
          <p style="color:var(--ink-300);font-size:14px;line-height:1.7;max-width:320px;">Plataforma oficial da Feira Tecnológica e Sustentável da ETEC Maria Cristina Medeiros. Inovação, educação e sustentabilidade.</p>
        </div>
        <div>
          <div style="font-weight:700;margin-bottom:14px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-100);">Navegação</div>
          <div class="flex-col gap-12" style="display:flex;font-size:14px;">
            <a href="#/projetos">Projetos</a><a href="#/cronograma">Cronograma</a><a href="#/mapa">Mapa da feira</a><a href="#/noticias">Notícias</a>
          </div>
        </div>
        <div>
          <div style="font-weight:700;margin-bottom:14px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-100);">Acesso</div>
          <div class="flex-col gap-12" style="display:flex;font-size:14px;">
            <a href="#/area-professor">Área do professor</a><a href="#/admin">Painel admin</a><a href="#/ranking">Votação</a>
          </div>
        </div>
        <div>
          <div style="font-weight:700;margin-bottom:14px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-100);">Contato</div>
          <div class="flex-col gap-12" style="display:flex;font-size:14px;color:var(--ink-300);">
            <span>contato@etecmcm.sp.gov.br</span><span>(11) 4000-0000</span><span>São Paulo, SP</span>
          </div>
        </div>
      </div>
      <hr style="border:none;border-top:1px solid #1E2740;margin:40px 0 22px;">
      <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:10px;color:var(--ink-300);font-size:13px;">
        <span>© 2026 ETEC Maria Cristina Medeiros — Feira Tecnológica e Sustentável</span>
        <span class="text-mono">v1.0.0 · plataforma-feira-tech</span>
      </div>
    </div>
  </footer>`;
}

/* ============================================================
   MODAL SYSTEM
   ============================================================ */
function openModal(html, opts = {}) {
  closeModal();
  const overlay = el(`<div class="modal-overlay" id="modal-overlay"></div>`);
  const modal = el(`<div class="modal ${opts.wide ? 'modal-wide' : ''}">${html}</div>`);
  overlay.appendChild(modal);
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', escCloseModal);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}
function escCloseModal(e) { if (e.key === 'Escape') closeModal(); }
function closeModal() {
  const o = $('#modal-overlay');
  if (o) o.remove();
  document.body.style.overflow = '';
  document.removeEventListener('keydown', escCloseModal);
}

/* ============================================================
   AUTH
   ============================================================ */
function openAuthModal(mode = 'login') {
  if (mode === 'login') openModal(loginModalHtml(), {});
  else if (mode === 'register') openModal(registerModalHtml(), {});
  else if (mode === 'forgot') openModal(forgotModalHtml(), {});
}
function toggleRegisterAlunoFields(role) {
  const wrapper = document.getElementById('register-aluno-fields');
  const turmaSelect = document.getElementById('register-turma-select');
  const periodoInput = document.querySelector('input[name="periodo"]');
  const cursoInput = document.querySelector('input[name="curso"]');
  if (!wrapper) return;
  const shouldShow = role === 'aluno';
  wrapper.style.display = shouldShow ? 'block' : 'none';
  if (!shouldShow) {
    if (turmaSelect) turmaSelect.innerHTML = '<option value="">Selecionar turma</option>';
    if (periodoInput) periodoInput.value = '';
    if (cursoInput) cursoInput.value = '';
    if (turmaSelect) turmaSelect.disabled = true;
  }
}
function selectRegisterPeriodo(periodo) {
  const select = document.getElementById('register-turma-select');
  const periodoInput = document.querySelector('input[name="periodo"]');
  const cursoInput = document.querySelector('input[name="curso"]');
  const buttons = document.querySelectorAll('[data-periodo-button]');
  buttons.forEach(button => {
    const active = button.dataset.periodoButton === periodo;
    button.classList.toggle('btn-primary', active);
    button.classList.toggle('btn-outline', !active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (!select || !periodoInput) return;
  const options = TURMAS_POR_PERIODO[periodo] || [];
  periodoInput.value = periodo;
  select.disabled = !options.length;
  select.innerHTML = options.length
    ? `<option value="">Selecionar turma</option>${options.map(item => `<option value="${item.value}">${item.label}</option>`).join('')}`
    : '<option value="">Selecionar turma</option>';
  if (cursoInput) cursoInput.value = '';
}
function updateRegisterCursoFromTurma() {
  const select = document.getElementById('register-turma-select');
  const cursoInput = document.querySelector('input[name="curso"]');
  if (!select || !cursoInput) return;
  const selectedTurma = select.value || '';
  cursoInput.value = inferCursoFromTurma(selectedTurma);
}
function loginModalHtml() {
  return `
  <div class="modal-header">
    <div class="flex items-center gap-12">${signatureMark(26)}<h3 class="font-display" style="font-size:19px;">Entrar na plataforma</h3></div>
    <button class="modal-close" onclick="closeModal()">${icon('close', 18)}</button>
  </div>
  <div class="modal-body">
    <div class="field-hint" style="margin-bottom:18px;">Entre com sua conta de aluno para acessar a plataforma.</div>
    <div class="grid" style="grid-template-columns:1fr;gap:8px;margin-bottom:22px;">
      <button class="btn btn-primary btn-sm" onclick="quickLogin('aluno')">${icon('user', 15)} Entrar como aluno</button>
    </div>
    <hr class="divider" style="margin-bottom:22px;">
    <form onsubmit="return handleLoginSubmit(event)">
      <div class="field">
        <label>E-mail institucional</label>
        <div class="input-icon-wrap">${icon('mail', 17)}<input class="input" name="email" type="email" placeholder="seunome@etecmcm.sp.gov.br" required></div>
      </div>
      <div class="field">
        <label>Senha</label>
        <div class="input-icon-wrap">${icon('lock', 17)}<input class="input" name="password" type="password" placeholder="••••••••" required></div>
      </div>
      <div class="flex justify-between items-center" style="margin-bottom:20px;">
        <label class="flex items-center gap-8" style="font-size:13.5px;color:var(--ink-500);cursor:pointer;">
          <input type="checkbox" checked> Lembrar de mim
        </label>
        <a href="#" onclick="event.preventDefault();openAuthModal('forgot')" style="font-size:13.5px;font-weight:600;color:var(--green-600);">Esqueci a senha</a>
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg">Entrar</button>
    </form>
    <div style="text-align:center;margin-top:18px;font-size:13.5px;color:var(--ink-500);">
      Não tem conta? <a href="#" onclick="event.preventDefault();openAuthModal('register')" style="color:var(--green-600);font-weight:700;">Cadastre-se</a>
    </div>
  </div>`;
}
async function quickLogin(role) {
  try {
    let users = [];
    try { users = await dataManager.getUsers(); } catch (e) { users = MOCK.users; }
    const map = { admin: 'admin', professor: 'professor', aluno: 'aluno', visitante: 'visitante' };
    let user = users.find(u => u.role === map[role]);
    if (!user) user = MOCK.users.find(u => u.role === map[role]);
    if (!user) { toast('Usuário não encontrado para este perfil', 'error'); return; }
    state.currentUser = user;
    saveSession(user);
    closeModal();
    toast(`Bem-vindo(a), ${user.name ? user.name.split(' ')[0] : 'Usuário'}!`, 'success');
    await loadAllData();
    render();
  } catch (err) { toast('Erro no login rápido: ' + err.message, 'error'); }
}
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = e.target.elements.email.value.trim().toLowerCase();
  const password = e.target.elements.password.value;
  try {
    const result = await dataManager.login(email, password);
    if (result.success && result.user) {
      state.currentUser = result.user;
      saveSession(result.user);
      closeModal();
      toast(`Bem-vindo(a), ${result.user.name ? result.user.name.split(' ')[0] : 'Usuário'}!`, 'success');
      await loadAllData();
      render();
    } else {
      toast(result.error || 'Erro ao fazer login', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao fazer login', 'error'); }
  return false;
}
function registerModalHtml() {
  return `
  <div class="modal-header">
    <h3 class="font-display" style="font-size:19px;">Criar conta</h3>
    <button class="modal-close" onclick="closeModal()">${icon('close', 18)}</button>
  </div>
  <div class="modal-body">
    <form onsubmit="return handleRegisterSubmit(event)">
      <div class="field"><label>Nome completo</label><input class="input" name="name" required placeholder="Seu nome completo"></div>
      <div id="register-aluno-fields" style="display:block;">
        <div class="field">
          <label>Período</label>
          <div class="grid" style="grid-template-columns:repeat(3, minmax(0, 1fr));gap:8px;">
            ${PERIODOS.map(p => `<button type="button" class="btn btn-outline btn-sm" data-periodo-button="${p.value}" onclick="selectRegisterPeriodo('${p.value}')">${p.label}</button>`).join('')}
          </div>
          <input type="hidden" name="periodo" value="">
        </div>
        <div class="field">
          <label>Turma</label>
          <select class="select" id="register-turma-select" name="turma" disabled required onchange="updateRegisterCursoFromTurma()">
            <option value="">Selecionar turma</option>
          </select>
          <input type="hidden" name="curso" value="">
        </div>
      </div>
      <div class="field"><label>E-mail</label><input class="input" name="email" type="email" required placeholder="seunome@email.com"></div>
      <div class="field"><label>Senha</label><input class="input" name="password" type="password" required minlength="8" placeholder="Mínimo 8 caracteres"></div>
      <button type="submit" class="btn btn-secondary btn-block btn-lg">Criar minha conta de aluno</button>
    </form>
    <div style="text-align:center;margin-top:16px;font-size:13.5px;color:var(--ink-500);">
      Já tem conta? <a href="#" onclick="event.preventDefault();openAuthModal('login')" style="color:var(--green-600);font-weight:700;">Entrar</a>
    </div>
  </div>`;
}
async function handleRegisterSubmit(e) {
  e.preventDefault();
  const f = e.target.elements;
  const name = f.name.value.trim();
  const email = f.email.value.trim().toLowerCase();
  const password = f.password.value;
  const role = 'aluno';
  const periodo = f.periodo?.value || '';
  const turma = f.turma?.value || '';
  const curso = inferCursoFromTurma(turma) || (f.curso?.value || '');
  if (!periodo) { toast('Selecione o período do aluno.', 'error'); return false; }
  if (!turma) { toast('Selecione a turma do aluno.', 'error'); return false; }
  if (!curso) { toast('Não foi possível identificar o curso da turma selecionada.', 'error'); return false; }
  try {
    const result = await dataManager.register(name, email, password, role, { periodo, turma, curso });
    if (result.success && result.user) {
      state.currentUser = result.user;
      saveSession(result.user);
      closeModal();
      toast(`Conta criada! Bem-vindo(a), ${name.split(' ')[0]}!`, 'success');
      await loadAllData();
      render();
    } else {
      toast(result.error || 'Erro ao criar conta', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao criar conta', 'error'); }
  return false;
}
function forgotModalHtml() {
  return `
  <div class="modal-header">
    <h3 class="font-display" style="font-size:19px;">Recuperar senha</h3>
    <button class="modal-close" onclick="closeModal()">${icon('close', 18)}</button>
  </div>
  <div class="modal-body">
    <p style="color:var(--ink-500);font-size:14px;margin-bottom:20px;">Informe seu e-mail cadastrado. Enviaremos um link para redefinição de senha.</p>
    <form onsubmit="return handleForgotSubmit(event)">
      <div class="field"><label>E-mail</label><input class="input" type="email" name="email" required placeholder="seunome@email.com"></div>
      <button type="submit" class="btn btn-primary btn-block btn-lg">Enviar link de recuperação</button>
    </form>
    <div style="text-align:center;margin-top:16px;font-size:13.5px;">
      <a href="#" onclick="event.preventDefault();openAuthModal('login')" style="color:var(--green-600);font-weight:700;">← Voltar ao login</a>
    </div>
  </div>`;
}
async function handleForgotSubmit(e) {
  e.preventDefault();
  const email = e.target.elements.email.value.trim();
  try {
    await dataManager.forgotPassword(email);
    closeModal();
    toast('Link de recuperação enviado para seu e-mail (simulado)', 'success');
  } catch (err) { toast(err.message || 'Erro ao recuperar senha', 'error'); }
  return false;
}
async function doLogout() {
  await dataManager.logout();
  state.currentUser = null;
  state.votedProjects = new Set();
  clearSession();
  closeUserMenu();
  toast('Sessão encerrada com sucesso.', 'info');
  navigate('#/home');
}

/* ============================================================
   SEARCH MODAL
   ============================================================ */
function openSearchModal() {
  openModal(`
  <div class="modal-body" style="padding-top:22px;">
    <div class="input-icon-wrap">${icon('search', 18)}<input class="input" id="global-search-input" placeholder="Buscar projetos, notícias, professores…" style="font-size:16px;padding-top:14px;padding-bottom:14px;" oninput="handleGlobalSearch(this.value)" autofocus></div>
    <div id="global-search-results" style="margin-top:18px;max-height:400px;overflow-y:auto;"></div>
  </div>`, {});
  setTimeout(() => $('#global-search-input')?.focus(), 50);
}
function handleGlobalSearch(q) {
  const res = $('#global-search-results');
  if (!q || q.length < 2) { res.innerHTML = `<div style="text-align:center;color:var(--ink-300);padding:24px;font-size:13.5px;">Digite ao menos 2 caracteres…</div>`; return; }
  const ql = q.toLowerCase();
  const projects = state.projects.filter(p => p.name.toLowerCase().includes(ql) || p.summary.toLowerCase().includes(ql));
  const news = state.news.filter(n => n.title.toLowerCase().includes(ql));
  const teachers = MOCK.teachers.filter(t => t.name.toLowerCase().includes(ql));
  if (!projects.length && !news.length && !teachers.length) {
    res.innerHTML = `<div class="empty-state">${icon('search', 36)}<h3>Nenhum resultado</h3><p style="font-size:13.5px;">Tente outro termo de busca.</p></div>`;
    return;
  }
  res.innerHTML = `
    ${projects.length ? `<div class="sidebar-section-label">Projetos</div>${projects.map(p => `<a href="#/projeto/${p.id}" onclick="closeModal()" class="sidebar-link" style="height:auto;padding:10px 12px;">${icon('cpu', 16)} ${escapeHtml(p.name)}</a>`).join('')}` : ''}
    ${news.length ? `<div class="sidebar-section-label">Notícias</div>${news.map(n => `<a href="#/noticias" onclick="closeModal()" class="sidebar-link" style="height:auto;padding:10px 12px;">${icon('news', 16)} ${escapeHtml(n.title)}</a>`).join('')}` : ''}
    ${teachers.length ? `<div class="sidebar-section-label">Professores</div>${teachers.map(t => `<div class="sidebar-link" style="height:auto;padding:10px 12px;">${icon('user', 16)} ${escapeHtml(t.name)}</div>`).join('')}` : ''}
  `;
}

/* ============================================================
   CARREGAR DADOS
   ============================================================ */
async function loadAllData() {
  try {
    state.categories = await dataManager.getCategories();
    state.projects = await dataManager.getProjects();
    state.teachers = await dataManager.getTeachers();
    state.news = await dataManager.getNews();
    state.schedule = await dataManager.getSchedule();
    state.offices = await dataManager.getOffices(state.currentUser?.id);
    if (state.currentUser) {
      state.notifications = await dataManager.getNotifications(state.currentUser.id);
      const votedIds = await dataManager.getUserVotes(state.currentUser.id);
      state.votedProjects = new Set(votedIds);
      if (state.currentUser.role === 'admin') {
        state.users = await dataManager.getUsers();
        state.logs = await dataManager.getLogs();
      }
    }
  } catch (e) { console.warn('Erro ao carregar dados:', e); }
}

/* ============================================================
   PÁGINAS
   ============================================================ */

// HOME
function pageHome() {
  const featured = state.projects.filter(p => p.status === 'aprovado').sort((a, b) => b.votes - a.votes).slice(0, 3);
  const approvedCount = state.projects.filter(p => p.status === 'aprovado').length;
  const totalVotes = state.projects.reduce((s, p) => s + (p.votes || 0), 0);
  return `
  <div class="page">
    <section class="gradient-mesh" style="padding:76px 0 90px;position:relative;overflow:hidden;">
      <div class="blob blob-anim" style="width:300px;height:300px;top:-80px;right:6%;background:linear-gradient(135deg,var(--green-500),var(--blue-500));opacity:0.15;"></div>
      <div class="blob blob-anim" style="width:200px;height:200px;bottom:-50px;left:2%;background:linear-gradient(135deg,var(--orange-600),var(--green-500));opacity:0.12;animation-delay:-5s;"></div>
      <div class="shape-ring" style="width:80px;height:80px;top:20%;right:20%;"></div>
      <div class="shape-leaf" style="font-size:40px;top:10%;left:5%;">🍃</div>
      <div class="shape-dot" style="width:12px;height:12px;top:60%;left:12%;"></div>
      <div class="container" style="position:relative;z-index:1;">
        <div class="grid" style="grid-template-columns:1.1fr .9fr;gap:56px;align-items:center;">
          <div>
            <div class="eyebrow">${icon('leaf', 14)} 6 a 7 de abril de 2026 · ETEC Maria Cristina Medeiros</div>
            <h1 style="font-size:clamp(34px,5vw,58px);font-weight:900;line-height:1.05;margin-bottom:20px;">
              Feira Tecnológica <br><span class="gradient-text-anim" style="background:linear-gradient(135deg,var(--green-600),var(--blue-600),var(--orange-600),var(--green-600));-webkit-background-clip:text;background-clip:text;color:transparent;">e Sustentável</span>
            </h1>
            <p style="font-size:17.5px;color:var(--ink-500);max-width:520px;line-height:1.65;margin-bottom:32px;">
              A plataforma oficial que reúne todos os projetos, cronograma, mapa e votação popular da maior feira de inovação da nossa escola.
            </p>
            <div class="flex gap-16" style="flex-wrap:wrap;">
              <a href="#/projetos" class="btn btn-primary btn-lg">${icon('grid', 18)} Conheça os projetos</a>
              ${canUserVote() ? `<a href="#/ranking" class="btn btn-outline btn-lg">${icon('vote', 18)} Ver ranking</a>` : `<a href="#/ranking" class="btn btn-outline btn-lg">${icon('vote', 18)} Ver votação</a>`}
            </div>
            <div class="flex gap-24" style="margin-top:44px;flex-wrap:wrap;">
              <div><div class="font-display" style="font-size:26px;font-weight:900;">${state.projects.length}</div><div style="font-size:13px;color:var(--ink-500);font-weight:600;">Projetos inscritos</div></div>
              <div><div class="font-display" style="font-size:26px;font-weight:900;">${state.categories.length}</div><div style="font-size:13px;color:var(--ink-500);font-weight:600;">Categorias</div></div>
              <div><div class="font-display" style="font-size:26px;font-weight:900;">${totalVotes.toLocaleString('pt-BR')}</div><div style="font-size:13px;color:var(--ink-500);font-weight:600;">Votos registrados</div></div>
            </div>
          </div>
          <div style="position:relative;">
            <div class="card" style="padding:0;overflow:hidden;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);">
              <div style="height:340px;background:linear-gradient(135deg,var(--green-700),var(--blue-700) 55%,var(--orange-600));display:flex;align-items:center;justify-content:center;position:relative;">
                <div style="position:absolute;inset:0;opacity:0.08;background-image:radial-gradient(circle,white 1.5px,transparent 1.5px);background-size:22px 22px;"></div>
                <div class="blob" style="width:130px;height:130px;top:14px;left:14px;background:rgba(255,255,255,0.10);"></div>
                <div style="font-size:110px;position:relative;">🌿</div>
              </div>
            </div>
            <div class="card card-pad hover-lift" style="position:absolute;bottom:-24px;left:-24px;width:220px;box-shadow:var(--shadow-lg);background:rgba(255,255,255,0.9);backdrop-filter:blur(4px);">
              <div class="flex items-center gap-12">
                <div style="width:44px;height:44px;border-radius:12px;background:var(--green-100);display:flex;align-items:center;justify-content:center;color:var(--green-700);">${icon('trophy', 22)}</div>
                <div><div style="font-weight:800;font-size:15px;">${featured[0]?.name?.split(' — ')[0] || 'Nenhum'}</div><div style="font-size:12px;color:var(--ink-500);">Projeto líder no ranking</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-tight container">
      <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:20px;">
        ${statCard('cpu', approvedCount, 'Projetos aprovados', 'green')}
        ${statCard('users', '1.240', 'Visitantes esperados', 'blue')}
        ${statCard('layers', state.categories.length, 'Categorias temáticas', 'green')}
        ${statCard('vote', totalVotes.toLocaleString('pt-BR'), 'Votos populares', 'orange')}
      </div>
    </section>

    <section class="section container">
      <div class="flex justify-between items-center" style="margin-bottom:32px;flex-wrap:wrap;gap:16px;">
        <div>
          <div class="eyebrow">${icon('star', 14)} Destaques</div>
          <h2 class="section-title" style="margin-bottom:0;">Projetos em destaque</h2>
        </div>
        <a href="#/projetos" class="btn btn-outline">Ver todos ${icon('arrowRight', 16)}</a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:22px;">
        ${featured.map(projectCard).join('')}
      </div>
    </section>

    <section class="section-tight" style="background:rgba(255,255,255,0.5);backdrop-filter:blur(4px);border-top:1px solid var(--ink-100);border-bottom:1px solid var(--ink-100);">
      <div class="container">
        <div class="eyebrow">${icon('calendar', 14)} Programação</div>
        <h2 class="section-title">Cronograma da feira</h2>
        <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:20px;margin-top:32px;">
          ${state.schedule.slice(0, 3).map(s => `
            <div class="card card-pad hover-lift">
              <div class="badge badge-green" style="margin-bottom:14px;">${fmtDate(s.date)}</div>
              <h4 style="font-size:16px;margin-bottom:8px;">${escapeHtml(s.title)}</h4>
              <div class="flex items-center gap-8" style="color:var(--ink-500);font-size:13px;">${icon('clock', 15)} ${s.time} · ${icon('pin', 15)} ${escapeHtml(s.location)}</div>
            </div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:32px;"><a href="#/cronograma" class="btn btn-ghost">Ver cronograma completo ${icon('arrowRight', 16)}</a></div>
      </div>
    </section>

    <section class="section container">
      <div class="eyebrow">${icon('news', 14)} Fique por dentro</div>
      <h2 class="section-title">Últimas notícias</h2>
      <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:22px;margin-top:32px;">
        ${state.news.slice(0, 3).map(newsCard).join('')}
      </div>
    </section>

    <section class="section-tight container">
      <div class="card" style="padding:48px;background:linear-gradient(120deg,var(--green-900),#2C4C6B 55%,#B3541A);color:white;text-align:center;border:none;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;opacity:0.06;background-image:radial-gradient(circle,white 1.5px,transparent 1.5px);background-size:24px 24px;"></div>
        <h2 style="color:white;font-size:28px;margin-bottom:12px;position:relative;">Apoiadores e parceiros</h2>
        <p style="color:var(--blue-100);max-width:500px;margin:0 auto 28px;position:relative;">Empresas e instituições que acreditam na inovação estudantil.</p>
        <div class="flex justify-between" style="max-width:600px;margin:0 auto;position:relative;flex-wrap:wrap;gap:20px;">
          ${['TechCorp', 'GreenEnergy', 'DevSchool', 'CloudBR'].map(n => `<div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:white;opacity:.85;">${n}</div>`).join('')}
        </div>
      </div>
    </section>
  </div>`;
}

function statCard(iconName, num, lbl, color) {
  const colorMap = { green: 'green', blue: 'blue', orange: 'orange' };
  const c = colorMap[color] || 'green';
  return `<div class="stat-card">
    <div class="icon-wrap" style="background:var(--${c}-100);color:var(--${c}-700,var(--${c}-600));">${icon(iconName, 22)}</div>
    <div class="num">${num}</div><div class="lbl">${lbl}</div>
  </div>`;
}

function projectCard(p) {
  const cat = categoryOf(p.category);
  const coverStyle = p.cover
    ? `background:center/cover no-repeat url('${p.cover}');`
    : `background:linear-gradient(135deg,var(--green-50),var(--blue-50));`;
  return `
  <a href="#/projeto/${p.id}" class="card card-hover" style="overflow:hidden;display:block;">
    <div style="height:150px;${coverStyle}display:flex;align-items:center;justify-content:center;font-size:100px;position:relative;">
      ${p.cover ? '' : p.image}
      <div class="badge badge-${cat?.color || 'blue'}" style="position:absolute;top:12px;left:12px;">${cat?.name || 'Categoria'}</div>
      ${p.status === 'pendente' ? `<div class="badge badge-amber" style="position:absolute;top:12px;right:12px;">Pendente</div>` : ''}
    </div>
    <div class="card-pad">
      <h4 style="font-size:16px;margin-bottom:8px;line-height:1.3;">${escapeHtml(p.name)}</h4>
      <p style="font-size:13.5px;color:var(--ink-500);line-height:1.55;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.summary)}</p>
      <div class="flex justify-between items-center">
        <span class="tag" style="font-size:11.5px;">${escapeHtml(p.course)}</span>
        <div class="flex items-center gap-8" style="color:var(--green-700);font-weight:700;font-size:13px;">${icon('vote', 15)} ${p.votes || 0}</div>
      </div>
    </div>
  </a>`;
}

function newsCard(n) {
  return `<a href="#/noticias" class="card card-hover" style="overflow:hidden;display:block;">
    <div style="height:130px;background:linear-gradient(135deg,var(--ink-900),var(--green-700));display:flex;align-items:center;justify-content:center;">${icon('news', 34)}</div>
    <div class="card-pad">
      <div class="flex items-center gap-8" style="margin-bottom:12px;">
        <span class="badge badge-green">${escapeHtml(n.category)}</span>
        <span style="font-size:12.5px;color:var(--ink-300);">${fmtDate(n.date)}</span>
      </div>
      <h3 style="font-size:18px;margin-bottom:10px;line-height:1.35;">${escapeHtml(n.title)}</h3>
      <div style="font-size:14px;color:var(--ink-500);line-height:1.6;margin-bottom:16px;">${escapeHtml(n.excerpt)}</div>
      <div class="flex justify-between items-center">
        <span style="font-size:13px;color:var(--ink-500);">Por ${escapeHtml(n.author)}</span>
        <button class="btn btn-ghost btn-sm" onclick="toast('${n.comments || 0} comentários nesta notícia','info')">💬 ${n.comments || 0}</button>
      </div>
    </div>
  </a>`;
}

// PÁGINA PROJETOS
function pageProjects() {
  return `
  <div class="page section container">
    <div class="breadcrumb"><a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span><span>Projetos</span></div>
    <div class="flex justify-between items-center" style="margin-bottom:8px;flex-wrap:wrap;gap:12px;">
      <div>
        <h1 class="section-title" style="margin-bottom:6px;">Catálogo de Projetos</h1>
        <p class="section-sub">Explore todos os projetos inscritos na Feira Tech 2026.</p>
      </div>
      <div class="flex gap-10" style="flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="openFindProjectModal()">${icon('search', 17)} Encontrar meu projeto</button>
        ${state.currentUser?.role === 'aluno' ? `<a href="#/cadastro-projeto" class="btn btn-secondary">${icon('plus', 17)} Cadastrar projeto</a>` : ''}
      </div>
    </div>
    <div class="card card-pad" style="margin:28px 0;position:sticky;top:88px;z-index:50;background:rgba(255,255,255,0.85);backdrop-filter:blur(12px);">
      <div class="input-icon-wrap" style="margin-bottom:16px;">
        ${icon('search', 18)}<input class="input" placeholder="Buscar por nome, tecnologia ou palavra-chave…" value="${escapeHtml(state.filters.search)}" oninput="updateFilter('search',this.value)">
      </div>
      <div class="flex gap-8" style="flex-wrap:wrap;margin-bottom:14px;">
        <button class="chip-filter ${state.filters.category === 'all' ? 'active' : ''}" onclick="updateFilter('category','all')">Todas categorias</button>
        ${state.categories.map(c => `<button class="chip-filter ${state.filters.category === c.id ? 'active' : ''}" onclick="updateFilter('category','${c.id}')">${escapeHtml(c.name)}</button>`).join('')}
      </div>
      <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:12px;">
        <div class="flex gap-12" style="flex-wrap:wrap;">
          <select class="select" style="width:auto;" onchange="updateFilter('course',this.value)">
            <option value="all">Todos os cursos</option>
            ${MOCK.courses.map(c => `<option value="${c}" ${state.filters.course === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <select class="select" style="width:auto;" onchange="updateFilter('status',this.value)">
            <option value="all" ${state.filters.status === 'all' ? 'selected' : ''}>Todos os status</option>
            <option value="aprovado" ${state.filters.status === 'aprovado' ? 'selected' : ''}>Aprovados</option>
            <option value="pendente" ${state.filters.status === 'pendente' ? 'selected' : ''}>Pendentes</option>
          </select>
        </div>
        <select class="select" style="width:auto;" onchange="updateFilter('sort',this.value)">
          <option value="votes" ${state.filters.sort === 'votes' ? 'selected' : ''}>Mais votados</option>
          <option value="recent" ${state.filters.sort === 'recent' ? 'selected' : ''}>Mais recentes</option>
          <option value="az" ${state.filters.sort === 'az' ? 'selected' : ''}>A – Z</option>
        </select>
      </div>
    </div>
    <div id="projects-grid-wrap">${renderProjectsGrid()}</div>
  </div>`;
}
function filteredProjects() {
  let list = [...state.projects];
  const f = state.filters;
  if (f.search) list = list.filter(p => (p.name + p.summary + (p.tech || []).join(' ')).toLowerCase().includes(f.search.toLowerCase()));
  if (f.category !== 'all') list = list.filter(p => p.category === f.category);
  if (f.course !== 'all') list = list.filter(p => p.course === f.course);
  if (f.status !== 'all') list = list.filter(p => p.status === f.status);
  if (f.sort === 'votes') list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  if (f.sort === 'recent') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (f.sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}
function renderProjectsGrid() {
  const list = filteredProjects();
  if (!list.length) return `<div class="empty-state">${icon('search', 44)}<h3>Nenhum projeto encontrado</h3><p>Tente ajustar os filtros ou o termo de busca.</p><button class="btn btn-outline" style="margin-top:16px;" onclick="resetFilters()">Limpar filtros</button></div>`;
  return `<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:22px;">${list.map(projectCard).join('')}</div>
  <div style="text-align:center;margin-top:8px;color:var(--ink-500);font-size:13.5px;">Mostrando ${list.length} de ${state.projects.length} projetos</div>`;
}
function updateFilter(key, val) {
  state.filters[key] = val;
  $('#projects-grid-wrap').innerHTML = renderProjectsGrid();
  if (key === 'category') {
    $all('.chip-filter').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
  }
}
function resetFilters() {
  state.filters = { search: '', category: 'all', course: 'all', status: 'all', sort: 'votes' };
  render();
}

// DETALHE DO PROJETO
function pageProjectDetail(id) {
  const p = state.projects.find(x => x.id === id);
  if (!p) return page404();
  const cat = categoryOf(p.category);
  const teacher = teacherOf(p.teacher, p.teacherName);
  const stand = standOf(p.stand);
  const hasVoted = state.votedProjects.has(p.id);
  return `
  <div class="page section container">
    <div class="breadcrumb">
      <a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span>
      <a href="#/projetos">Projetos</a><span class="sep">${icon('chevronRight', 13)}</span>
      <span>${escapeHtml(p.name)}</span>
    </div>
    <div class="grid project-detail-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:40px;align-items:start;">
      <div style="min-width:0;">
        <div
          class="card project-cover"
          style="${p.cover
            ? `background-image:url('${p.cover}');`
            : `background:linear-gradient(135deg,var(--green-50),var(--blue-50));`
          }"
        >
          ${p.cover ? '' : p.image}

          <div
            class="badge badge-${cat?.color || 'blue'}"
            style="position:absolute;top:16px;left:16px;"
          >
          ${cat?.name || 'Categoria'}
        </div>
      </div>
        <div class="flex gap-8" style="margin-bottom:8px;">
          <span class="badge badge-${p.status === 'aprovado' ? 'green' : 'amber'}">${p.status === 'aprovado' ? 'Aprovado' : 'Pendente'}</span>
          <span class="badge badge-gray">${icon('building', 13)} Estande ${stand?.code || '?'}</span>
        </div>
        <h1 style="font-size:32px;margin:12px 0 18px;">${escapeHtml(p.name)}</h1>
        <div style="display:flex;gap:0;border-bottom:1px solid var(--ink-100);margin-bottom:24px;" id="project-tabs">
          ${['Descrição', 'Documentos', 'QR Code'].map((t, i) => `
            <button class="tab-btn" data-tab="${i}" onclick="switchProjectTab(${i})" style="padding:12px 18px;font-weight:600;font-size:14px;color:${i === 0 ? 'var(--green-700)' : 'var(--ink-500)'};border-bottom:2.5px solid ${i === 0 ? 'var(--green-600)' : 'transparent'};transition:all 0.2s;">${t}</button>`).join('')}
        </div>
        <div id="tab-0" class="tab-panel">
          <p class="project-description" style="line-height:1.75;color:var(--ink-700);font-size:15px;">
            ${escapeHtml(p.description)}
          </p>
        </div>
        <div id="tab-1" class="tab-panel" style="display:none;">
          <div class="flex-col gap-12" style="display:flex;">
            ${p.document ? `
              <div class="card card-pad flex items-center gap-12" style="flex-direction:row;">
                ${icon('file', 20)}
                <div style="min-width:0;flex:1;"><div style="font-weight:600;font-size:14px;">Documentação do projeto</div><div style="font-size:12px;color:var(--ink-500);">Relatório ou especificações enviados no cadastro</div></div>
                <a href="${p.document}" download="documentacao-${p.id}" class="btn btn-ghost btn-sm">${icon('download', 15)}</a>
              </div>` : ''}
            ${(p.files && p.files.length) ? p.files.map(f => `
              <div class="card card-pad flex items-center gap-12" style="flex-direction:row;">
                ${icon(f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'file', 20)}
                <div style="min-width:0;flex:1;"><div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(f.name)}</div><div style="font-size:12px;color:var(--ink-500);">${(f.size / 1024).toFixed(0)} KB</div></div>
                <a href="${f.dataUrl}" download="${escapeHtml(f.name)}" class="btn btn-ghost btn-sm">${icon('download', 15)}</a>
              </div>`).join('') : ''}
            ${(!p.document && !(p.files && p.files.length)) ? `<div class="empty-state" style="padding:32px;">${icon('file', 32)}<h3 style="font-size:14.5px;">Nenhum arquivo anexado</h3><p style="font-size:13px;">A equipe ainda não enviou documentos.</p></div>` : ''}
          </div>
        </div>
        <div id="tab-2" class="tab-panel" style="display:none;">
          ${(p.qrCode || p.qrLink) ? `
            <div class="card card-pad" style="display:flex;flex-direction:column;align-items:center;gap:12px;">
              ${p.qrCode ? `<img src="${p.qrCode}" alt="QR Code do projeto" style="max-width:220px;width:100%;border-radius:12px;border:1px solid var(--ink-100);background:white;padding:12px;">` : ''}
              ${p.qrLink ? `<a href="${escapeHtml(p.qrLink)}" target="_blank" class="btn btn-outline btn-sm">${icon('external', 15)} Abrir link do QR Code</a>` : ''}
            </div>
          ` : `<div class="empty-state" style="padding:32px;">${icon('qr', 32)}<h3 style="font-size:14.5px;">QR Code não informado</h3><p style="font-size:13px;">Este projeto ainda não possui imagem ou link de QR Code.</p></div>`}
        </div>
        <hr class="divider" style="margin:32px 0;">
        <h3 style="font-size:18px;margin-bottom:16px;">Comentários (<span id="comment-count">${(p.comments || []).length}</span>)</h3>
        <div class="flex-col gap-16" style="display:flex;margin-bottom:20px;" id="comments-list">${renderComments(p)}</div>
        <div class="input-icon-wrap"><textarea class="textarea" id="new-comment-input" placeholder="${state.currentUser ? 'Escreva um comentário…' : 'Faça login para comentar'}" ${!state.currentUser ? 'disabled' : ''}></textarea></div>
        <button class="btn btn-primary btn-sm" style="margin-top:10px;" ${!state.currentUser ? 'disabled' : ''} onclick="postComment('${p.id}')">Publicar comentário</button>
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:20px;">
          <div class="flex justify-between items-center" style="margin-bottom:14px;">
            <span style="font-weight:700;font-size:14px;">Votação popular</span>
            <span class="badge badge-green">${p.votes || 0} votos</span>
          </div>
          ${canUserVote() ? `
            <button class="btn ${hasVoted ? 'btn-outline' : 'btn-secondary'} btn-block" onclick="voteProject('${p.id}')" ${hasVoted ? 'disabled' : ''}>
              ${hasVoted ? icon('checkCircle', 17) + ' Você já votou' : icon('vote', 17) + ' Votar neste projeto'}
            </button>
            <div class="field-hint" style="text-align:center;margin-top:8px;">Cada visitante pode votar apenas uma vez por projeto.</div>
          ` : `
            <div class="field-hint" style="text-align:center;color:var(--ink-500);padding:12px 4px 0;">A votação permanece visível para alunos, mas o envio de votos está restrito a visitantes.</div>
          `}
        </div>
        <div class="card card-pad" style="margin-bottom:20px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:16px;">Equipe</div>
          <div class="flex-col gap-12" style="display:flex;">
            ${((p.team && p.team.length) ? p.team : [p.creatorName, ...(p.membros || [])]).filter(Boolean).map(m => `<div class="flex items-center gap-12"><div class="avatar" style="width:32px;height:32px;font-size:11px;">${initials(m)}</div><span style="font-size:14px;">${escapeHtml(m)}</span></div>`).join('') || `<div class="field-hint">Nenhum integrante cadastrado ainda.</div>`}
          </div>
          <hr class="divider" style="margin:16px 0;">
          <div style="font-weight:700;fontsize:14px;margin-bottom:12px;">Orientador(a)</div>
          <div class="flex items-center gap-12"><div class="avatar" style="width:32px;height:32px;font-size:11px;">${teacher?.avatar}</div><div><div style="font-size:14px;font-weight:600;">${teacher?.name || '?'}</div><div style="font-size:12px;color:var(--ink-500);">${teacher?.course || ''}</div></div></div>
        </div>
        <div class="card card-pad" style="margin-bottom:20px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:14px;">Informações</div>
          <div class="flex justify-between" style="font-size:13.5px;padding:8px 0;border-bottom:1px solid var(--ink-100);"><span style="color:var(--ink-500);">Curso</span><strong>${escapeHtml(p.course)}</strong></div>
          <div class="flex justify-between" style="font-size:13.5px;padding:8px 0;border-bottom:1px solid var(--ink-100);"><span style="color:var(--ink-500);">Categoria</span><strong>${cat?.name || '?'}</strong></div>
          ${p.ods ? `<div class="flex justify-between" style="font-size:13.5px;padding:8px 0;border-bottom:1px solid var(--ink-100);"><span style="color:var(--ink-500);">ODS</span><strong style="text-align:right;max-width:60%;">${escapeHtml(p.ods)}</strong></div>` : ''}
          <div class="flex justify-between" style="font-size:13.5px;padding:8px 0;border-bottom:1px solid var(--ink-100);"><span style="color:var(--ink-500);">Estande</span><strong>${stand?.code || '?'}</strong></div>
          <div class="flex justify-between" style="font-size:13.5px;padding:8px 0;"><span style="color:var(--ink-500);">Inscrito em</span><strong>${fmtDate(p.createdAt)}</strong></div>
        </div>
        <div class="flex gap-8">
          ${p.github ? `<a href="${p.github}" target="_blank" class="btn btn-outline btn-sm" style="flex:1;">${icon('gitHub', 15)} GitHub</a>` : ''}
          ${p.site ? `<a href="${p.site}" target="_blank" class="btn btn-outline btn-sm" style="flex:1;">${icon('globe', 15)} Site</a>` : ''}
          ${(p.links && /^https?:\/\//i.test(p.links)) ? `<a href="${escapeHtml(p.links)}" target="_blank" class="btn btn-outline btn-sm" style="flex:1;">${icon('external', 15)} Link do projeto</a>` : ''}
        </div>
        ${(p.links && !/^https?:\/\//i.test(p.links)) ? `<div class="field-hint" style="margin-top:8px;">${icon('external', 12)} ${escapeHtml(p.links)}</div>` : ''}
        <a href="#/mapa" class="btn btn-ghost btn-block" style="margin-top:8px;">${icon('map', 16)} Ver no mapa da feira</a>
      </div>
    </div>
  </div>`;
}
async function loadProjectComments(id) {
  try {
    const comments = await dataManager.getComments(id);
    const p = state.projects.find(x => x.id === id);
    if (p) p.comments = comments;
    const list = $('#comments-list');
    const count = $('#comment-count');
    if (list && state.route === '#/projeto') { list.innerHTML = renderComments(p || { comments }); }
    if (count) count.textContent = comments.length;
  } catch (e) {
    console.warn('Erro ao carregar comentários', e);
  }
}
function renderComments(p) {
  const comments = p.comments || [];
  if (!comments.length) return `<p style="font-size:13.5px;color:var(--ink-300);">Seja o primeiro a comentar neste projeto.</p>`;
  return comments.map(c => commentItem(c.author, c.text, timeAgo(c.date), c.authorAvatar)).join('');
}
function commentItem(name, text, time, avatar) {
  const avatarHtml = (avatar && String(avatar).startsWith('data:'))
    ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
    : (avatar || initials(name));
  return `<div class="flex gap-12"><div class="avatar" style="width:36px;height:36px;font-size:12px;flex-shrink:0;overflow:hidden;">${avatarHtml}</div>
  <div class="card card-pad" style="flex:1;padding:14px 16px;">
    <div class="flex justify-between"><strong style="font-size:13.5px;">${escapeHtml(name)}</strong><span style="font-size:12px;color:var(--ink-300);">${time}</span></div>
    <p style="font-size:13.5px;color:var(--ink-700);margin-top:6px;">${escapeHtml(text)}</p>
  </div></div>`;
}
function timeAgo(iso) {
  if (!iso) return 'agora';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'agora mesmo';
  if (mins < 60) return `${mins} min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)} dias atrás`;
}
async function postComment(projectId) {
  if (!state.currentUser) { toast('Faça login para comentar.', 'error'); openAuthModal('login'); return; }
  const input = $('#new-comment-input');
  const text = input.value.trim();
  if (!text) { toast('Escreva algo antes de publicar.', 'error'); return; }
  const p = state.projects.find(x => x.id === projectId);
  if (!p) return;
  const result = await dataManager.addComment(projectId, state.currentUser.id, text);
  if (result.success) {
    if (!p.comments) p.comments = [];
    p.comments.unshift(result.comment || { author: state.currentUser.name, text, date: new Date().toISOString() });
    input.value = '';
    $('#comments-list').innerHTML = renderComments(p);
    $('#comment-count').textContent = p.comments.length;
    toast('Comentário publicado!', 'success');
  } else {
    toast(result.error || 'Erro ao publicar comentário', 'error');
  }
}
function switchProjectTab(i) {
  for (let j = 0; j < 3; j++) { $(`#tab-${j}`).style.display = j === i ? 'block' : 'none'; }
  $all('.tab-btn').forEach((b, j) => {
    b.style.color = j === i ? 'var(--green-700)' : 'var(--ink-500)';
    b.style.borderBottomColor = j === i ? 'var(--green-600)' : 'transparent';
  });
}
function canUserVote() {
  return !(state.currentUser && state.currentUser.role === 'aluno');
}

async function voteProject(id) {
  if (state.currentUser && state.currentUser.role === 'aluno') {
    toast('Alunos não podem votar. A votação é exclusiva para visitantes.', 'info');
    return;
  }
  if (!state.currentUser) { toast('Faça login para votar.', 'error'); openAuthModal('login'); return; }
  if (state.votedProjects.has(id)) { toast('Você já votou neste projeto.', 'info'); return; }
  const p = state.projects.find(x => x.id === id);
  if (!p) return;
  const result = await dataManager.vote(state.currentUser.id, id);
  if (result.success) {
    p.votes = (p.votes || 0) + 1;
    state.votedProjects.add(id);
    toast('Voto registrado com sucesso! 🎉', 'success');
    render();
  } else {
    toast(result.error || 'Erro ao votar', 'error');
  }
}

// RANKING
function pageRanking() {
  const ranked = state.projects.filter(p => p.status === 'aprovado').sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const max = ranked[0]?.votes || 1;
  const isAluno = !!(state.currentUser && state.currentUser.role === 'aluno');
  return `
  <div class="page section container">
    <div class="breadcrumb"><a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span><span>Ranking &amp; Votação</span></div>
    <div class="eyebrow">${icon('trophy', 14)} Votação popular ao vivo</div>
    <h1 class="section-title">Ranking dos projetos</h1>
    <p class="section-sub" style="margin-bottom:36px;">${isAluno ? 'A votação continua visível, mas os alunos não podem registrar votos nesta etapa.' : 'Vote no seu projeto favorito. O ranking é atualizado automaticamente.'}</p>
    <div class="grid" style="grid-template-columns:2fr 1fr;gap:32px;align-items:start;">
      <div>
        <div class="flex-col gap-12" style="display:flex;">
          ${ranked.map((p, i) => {
            const hasVoted = state.votedProjects.has(p.id);
            const pct = Math.round(((p.votes || 0) / max) * 100);
            return `
            <div class="card card-pad hover-lift">
              <div class="flex items-center gap-16">
                <div style="font-family:var(--font-display);font-weight:900;font-size:22px;width:40px;text-align:center;color:${i < 3 ? 'var(--orange-600)' : 'var(--ink-300)'};">${i + 1}${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}</div>
                <div style="font-size:34px;">${p.image}</div>
                <div style="flex:1;min-width:0;">
                  <a href="#/projeto/${p.id}" style="font-weight:700;font-size:15px;">${escapeHtml(p.name)}</a>
                  <div class="progress-track" style="margin-top:8px;"><div class="progress-fill" style="width:${pct}%;"></div></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                  <div style="font-weight:800;font-size:17px;color:var(--green-700);">${p.votes || 0}</div>
                  ${!isAluno ? `<button class="btn ${hasVoted ? 'btn-ghost' : 'btn-secondary'} btn-sm" style="margin-top:6px;" onclick="voteProject('${p.id}')" ${hasVoted ? 'disabled' : ''}>${hasVoted ? icon('check', 13) : icon('vote', 13)} ${hasVoted ? 'Votado' : 'Votar'}</button>` : ''}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:20px;">
          <div style="font-weight:700;margin-bottom:16px;">Votos por categoria</div>
          <canvas id="chart-cat-votes" height="220"></canvas>
        </div>
        <div class="card card-pad" style="background:var(--green-50);border-color:var(--green-100);">
          <div class="flex items-center gap-12" style="margin-bottom:10px;">${icon('info', 18)}<strong style="font-size:14px;">Como funciona</strong></div>
          <p style="font-size:13.5px;color:var(--ink-700);line-height:1.6;">${isAluno ? 'A visualização da votação permanece disponível para alunos, mas o envio de votos está restrito a visitantes.' : 'Cada visitante autenticado pode votar apenas uma vez em cada projeto. O ranking é público e atualizado instantaneamente.'}</p>
        </div>
      </div>
    </div>
  </div>`;
}
function renderCategoryVotesChart() {
  const canvas = $('#chart-cat-votes');
  if (!canvas || typeof Chart === 'undefined') return;
  const data = state.categories.map(c => state.projects.filter(p => p.category === c.id).reduce((s, p) => s + (p.votes || 0), 0));
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: state.categories.map(c => c.name),
      datasets: [{ data, backgroundColor: ['#DC2430', '#3E6B8C', '#E76F51', '#F2465A', '#5B8FAF', '#F48C6E'], borderWidth: 0 }]
    },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, padding: 12 } } }, cutout: '62%' }
  });
}

// CRONOGRAMA
function pageSchedule() {
  const days = [...new Set(state.schedule.map(s => s.date))];
  return `
  <div class="page section container">
    <div class="breadcrumb"><a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span><span>Cronograma</span></div>
    <div class="eyebrow">${icon('calendar', 14)} Programação oficial</div>
    <h1 class="section-title">Cronograma da Feira</h1>
    <p class="section-sub" style="margin-bottom:40px;">Confira todos os horários e atividades dos dois dias de evento.</p>
    <div class="grid" style="grid-template-columns:repeat(${days.length},1fr);gap:40px;">
      ${days.map(d => `
        <div>
          <h3 style="font-size:19px;margin-bottom:20px;text-transform:capitalize;">${fmtDateLong(d)}</h3>
          <div class="timeline">
            ${state.schedule.filter(s => s.date === d).map((s, i) => `
              <div class="timeline-item ${i === 0 ? 'active' : ''}">
                <div class="text-mono" style="font-size:12px;color:var(--green-600);font-weight:700;margin-bottom:4px;">${s.time}</div>
                <div class="card card-pad" style="padding:14px 16px;">
                  <div style="font-weight:700;font-size:14.5px;margin-bottom:4px;">${escapeHtml(s.title)}</div>
                  <div class="flex items-center gap-8" style="font-size:12.5px;color:var(--ink-500);">${icon('pin', 14)} ${escapeHtml(s.location)}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

// MAPA
function pageMap() {
  return `
  <div class="page section container">
    <div class="breadcrumb"><a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span><span>Mapa da Feira</span></div>
    <div class="eyebrow">${icon('map', 14)} Localização dos estandes</div>
    <h1 class="section-title">Mapa interativo</h1>
    <p class="section-sub" style="margin-bottom:32px;">Clique em um estande para ver os detalhes do projeto exposto.</p>
    <div class="grid" style="grid-template-columns:2fr 1fr;gap:28px;align-items:start;">
      <div class="card card-pad" style="position:relative;height:520px;background:linear-gradient(135deg,var(--green-50),var(--blue-50));overflow:hidden;">
        <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:700;color:var(--ink-500);background:white;padding:6px 16px;border-radius:var(--radius-full);border:1px solid var(--ink-100);">${icon('home', 13)} ENTRADA PRINCIPAL</div>
        ${MOCK.stands.map(s => {
          const p = state.projects.find(pr => pr.stand === s.id);
          return `<button onclick="showStandInfo('${s.id}')" class="hover-lift" style="position:absolute;left:${s.x}%;top:${s.y}%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:14px;background:white;border:2px solid ${p ? 'var(--green-600)' : 'var(--ink-100)'};display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);">
            <span style="font-size:20px;">${p ? p.image : '—'}</span>
            <span class="text-mono" style="font-size:9px;font-weight:700;color:var(--ink-500);">${s.code}</span>
          </button>`;
        }).join('')}
      </div>
      <div id="stand-info-panel" class="card card-pad">
        <div class="empty-state" style="padding:40px 10px;">
          ${icon('map', 36)}<h3 style="font-size:15px;">Selecione um estande</h3><p style="font-size:13px;">Clique em um dos marcadores no mapa para ver os detalhes.</p>
        </div>
      </div>
    </div>
  </div>`;
}
function showStandInfo(standId) {
  const stand = standOf(standId);
  const p = state.projects.find(pr => pr.stand === standId);
  const panel = $('#stand-info-panel');
  if (!p) {
    panel.innerHTML = `<div class="empty-state" style="padding:40px 10px;">${icon('building', 36)}<h3 style="font-size:15px;">Estande ${stand?.code || '?'}</h3><p style="font-size:13px;">Nenhum projeto alocado neste estande no momento.</p></div>`;
    return;
  }
  const cat = categoryOf(p.category);
  panel.innerHTML = `
    <div class="badge badge-${cat?.color || 'blue'}" style="margin-bottom:12px;">Estande ${stand?.code || '?'}</div>
    <div style="font-size:44px;margin-bottom:10px;">${p.image}</div>
    <h3 style="font-size:17px;margin-bottom:8px;">${escapeHtml(p.name)}</h3>
    <p style="font-size:13.5px;color:var(--ink-500);line-height:1.6;margin-bottom:16px;">${escapeHtml(p.summary)}</p>
    <div class="flex items-center gap-8" style="margin-bottom:16px;font-size:13px;color:var(--ink-700);">${icon('vote', 15)} <strong>${p.votes || 0}</strong> votos</div>
    <a href="#/projeto/${p.id}" class="btn btn-primary btn-block">Ver projeto completo</a>`;
}

// NOTÍCIAS
function pageNews() {
  return `
  <div class="page section container">
    <div class="breadcrumb"><a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span><span>Notícias</span></div>
    <div class="eyebrow">${icon('news', 14)} Comunicação oficial</div>
    <h1 class="section-title">Notícias da Feira Tech</h1>
    <p class="section-sub" style="margin-bottom:36px;">Fique por dentro de tudo o que acontece na organização do evento.</p>
    <div class="grid" style="grid-template-columns:repeat(2,1fr);gap:24px;">
      ${state.news.map(n => `
      <div class="card card-hover" style="overflow:hidden;">
        <div style="height:160px;background:linear-gradient(135deg,var(--ink-900),var(--green-700));display:flex;align-items:center;justify-content:center;">${icon('news', 40)}</div>
        <div class="card-pad">
          <div class="flex items-center gap-8" style="margin-bottom:12px;">
            <span class="badge badge-green">${escapeHtml(n.category)}</span>
            <span style="font-size:12.5px;color:var(--ink-300);">${fmtDate(n.date)}</span>
          </div>
          <h3 style="font-size:18px;margin-bottom:10px;line-height:1.35;">${escapeHtml(n.title)}</h3>
          <div style="font-size:14px;color:var(--ink-500);line-height:1.6;margin-bottom:16px;">${escapeHtml(n.excerpt)}</div>
          <div class="flex justify-between items-center">
            <span style="font-size:13px;color:var(--ink-500);">Por ${escapeHtml(n.author)}</span>
            <button class="btn btn-ghost btn-sm" onclick="toast('${n.comments || 0} comentários nesta notícia','info')">💬 ${n.comments || 0}</button>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

// PERFIL (placeholder)
function pageProfile() {
  if (!state.currentUser) return requireLoginPage('Faça login para ver seu perfil.');
  const u = state.currentUser;
  const myProjects = state.projects.filter(p => (p.criadoPor === u.id) || ((p.membros || []).includes(u.id)));
  const attendedOffices = (state.offices || []).filter(o => o.inscrito);
  const votesGiven = state.votedProjects ? state.votedProjects.size : 0;
  return `
  <div class="page section container">
    <div class="breadcrumb"><a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span><span>Meu perfil</span></div>
    <div class="grid" style="grid-template-columns:320px 1fr;gap:32px;align-items:start;">
      <div>
        <div class="card card-pad" style="text-align:center;">
          <div class="avatar" id="profile-avatar-preview" style="width:96px;height:96px;font-size:28px;margin:0 auto 16px;overflow:hidden;">${avatarContent(u)}</div>
          <label class="btn btn-outline btn-sm" style="cursor:pointer;">
            ${icon('upload', 15)} Alterar foto
            <input type="file" accept="image/*" style="display:none;" onchange="handleAvatarFileChange(event)">
          </label>
          <h3 style="margin-top:16px;font-size:17px;">${escapeHtml(u.name)}</h3>
          <div class="badge badge-green" style="margin-top:6px;">${roleLabel(u.role)}</div>
          <p style="font-size:13px;color:var(--ink-500);margin-top:10px;word-break:break-word;">${escapeHtml(u.email)}</p>
        </div>
        <div class="card card-pad" style="margin-top:20px;">
          <div style="font-weight:700;margin-bottom:14px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-100);">Histórico</div>
          <div class="flex-col gap-12" style="display:flex;font-size:14px;">
            <div class="flex justify-between" style="font-size:13.5px;padding:8px 0;border-bottom:1px solid var(--ink-100);"><span style="color:var(--ink-500);">Projetos cadastrados</span><strong>${myProjects.length}</strong></div>
            <div class="flex justify-between" style="font-size:13.5px;padding:8px 0;border-bottom:1px solid var(--ink-100);"><span style="color:var(--ink-500);">Votos dados em projetos</span><strong>${votesGiven}</strong></div>
            <div class="flex justify-between" style="font-size:13.5px;padding:8px 0;"><span style="color:var(--ink-500);">Oficinas frequentadas</span><strong>${attendedOffices.length}</strong></div>
          </div>
        </div>
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:20px;">
          <h3 style="font-size:16px;margin-bottom:18px;">${icon('user', 17)} Dados pessoais</h3>
          <form onsubmit="return handleProfileUpdateSubmit(event)">
            <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;">
              <div class="field"><label>Nome completo</label><input class="input" name="nome" value="${escapeHtml(u.name || '')}" required placeholder="Seu nome completo"></div>
              <div class="field"><label>E-mail</label><input class="input" name="email" type="email" value="${escapeHtml(u.email || '')}" required placeholder="seunome@email.com"></div>
            </div>
            <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;">
              <div class="field"><label>Telefone</label><input class="input" name="telefone" value="${escapeHtml(u.telefone || '')}" placeholder="(11) 90000-0000"></div>
              <div class="field">
                <label>Período</label>
                <select class="select" name="periodo" required>
                  ${PERIODOS.map(x => `<option value="${x.value}" ${u.periodo === x.value ? 'selected' : ''}>${x.label}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="field">
              <label>Turma</label>
              <input class="input" name="turma" value="${escapeHtml(u.turma || '')}" placeholder="Ex: 1°A">
            </div>
            <div class="field"><label>Bio</label><textarea class="textarea" name="bio" placeholder="Fale um pouco sobre você…">${escapeHtml(u.bio || '')}</textarea></div>
            <hr class="divider" style="margin:20px 0;">
            <div class="field-hint" style="margin-bottom:12px;">Deseja alterar sua senha? Preencha o campo abaixo (deixe em branco para manter a atual).</div>
            <div class="field"><label>Nova senha</label><input class="input" name="password" type="password" minlength="8" placeholder="Mínimo 8 caracteres"></div>
            <button type="submit" class="btn btn-primary btn-lg" style="margin-top:8px;">${icon('check', 17)} Salvar alterações</button>
          </form>
        </div>
        <div class="card card-pad" style="margin-bottom:20px;border:1px solid var(--orange-200,#fcd9b8);">
          <h3 style="font-size:16px;margin-bottom:8px;color:var(--orange-600);">${icon('alert', 17)} Zona de perigo</h3>
          <p style="font-size:13.5px;color:var(--ink-500);margin-bottom:14px;">Excluir sua conta é uma ação permanente. Seus dados de login, comentários, votos e notificações serão apagados. Seus projetos cadastrados continuarão disponíveis no catálogo, mas deixarão de ter um responsável vinculado.</p>
          <button type="button" class="btn btn-outline btn-sm" style="color:var(--orange-600);border-color:var(--orange-300,#f5b26b);" onclick="deleteMyAccount()">${icon('trash', 15)} Excluir minha conta</button>
        </div>
        ${u.role === 'aluno' ? `
        <div class="card card-pad">
          <div class="flex justify-between items-center" style="margin-bottom:14px;">
            <h3 style="font-size:16px;margin:0;">${icon('cpu', 17)} Meus projetos (${myProjects.length})</h3>
            <a href="#/cadastro-projeto" class="btn btn-secondary btn-sm">${icon('plus', 15)} Novo projeto</a>
          </div>
          ${myProjects.length ? myProjects.map(p => {
            const isOwner = p.criadoPor === u.id;
            return `
            <div class="flex justify-between items-center" style="padding:10px 0;border-bottom:1px solid var(--ink-100);">
              <a href="#/projeto/${p.id}" style="font-weight:600;font-size:14px;">${escapeHtml(p.name)}</a>
              <div class="flex items-center gap-8">
                <span class="badge badge-green">${p.votes || 0} votos</span>
                ${isOwner ? `<button class="btn btn-ghost btn-sm" onclick="openEditProjectModal('${p.id}')">${icon('edit', 15)}</button>
                <button class="btn btn-ghost btn-sm" style="color:var(--orange-600);" onclick="deleteMyProject('${p.id}')">${icon('trash', 15)}</button>` : ''}
              </div>
            </div>`;
          }).join('') : `<p style="font-size:13.5px;color:var(--ink-300);">Você ainda não cadastrou nenhum projeto.</p>`}
        </div>` : ''}
      </div>
    </div>
  </div>`;
}
let pendingAvatarDataUrl = null;
function handleAvatarFileChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('Selecione um arquivo de imagem.', 'error'); return; }
  if (file.size > 2 * 1024 * 1024) { toast('A imagem deve ter no máximo 2MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    pendingAvatarDataUrl = reader.result;
    const preview = $('#profile-avatar-preview');
    if (preview) preview.innerHTML = `<img src="${pendingAvatarDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    toast('Foto selecionada! Clique em "Salvar alterações" para confirmar.', 'info');
  };
  reader.readAsDataURL(file);
}
async function handleProfileUpdateSubmit(e) {
  e.preventDefault();
  const f = e.target.elements;
  const payload = {
    id: state.currentUser.id,
    nome: f.nome.value.trim(),
    email: f.email.value.trim().toLowerCase(),
    telefone: f.telefone.value.trim(),
    periodo: f.periodo ? f.periodo.value : (state.currentUser.periodo || ''),
    turma: f.turma.value.trim(),
    bio: f.bio.value.trim(),
  };
  if (payload.turma) {
    payload.curso = inferCursoFromTurma(payload.turma);
  }
  if (pendingAvatarDataUrl) payload.avatar = pendingAvatarDataUrl;
  if (f.password.value) payload.password = f.password.value;
  try {
    const result = await dataManager.updateUser(payload);
    if (result.success) {
      state.currentUser = {
        ...state.currentUser,
        name: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        periodo: payload.periodo,
        turma: payload.turma,
        curso: payload.curso || state.currentUser.curso || state.currentUser.course || '',
        course: payload.curso || state.currentUser.curso || state.currentUser.course || '',
        bio: payload.bio,
        avatar: pendingAvatarDataUrl || state.currentUser.avatar,
      };
      saveSession(state.currentUser);
      pendingAvatarDataUrl = null;
      toast('Perfil atualizado com sucesso!', 'success');
      render();
    } else {
      toast(result.error || 'Erro ao atualizar perfil', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao atualizar perfil', 'error'); }
  return false;
}
function requireLoginPage(msg) {
  return `<div class="page section container" style="text-align:center;padding:100px 20px;">
    <div style="width:80px;height:80px;border-radius:50%;background:var(--blue-100);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;color:var(--blue-700);">${icon('lock', 34)}</div>
    <h2 style="margin-bottom:10px;">Acesso restrito</h2>
    <p class="section-sub" style="margin:0 auto 28px;">${msg}</p>
    <button class="btn btn-primary btn-lg" onclick="openAuthModal('login')">${icon('user', 18)} Entrar na plataforma</button>
  </div>`;
}

// CADASTRO DE PROJETO — página dedicada
let pendingCadastro = { cover: null, coverName: '', coverSize: 0, doc: null, docName: '', docSize: 0, qr: null, qrName: '', qrSize: 0 };
function cadastroDraftKey() { return `feiratech_draft_projeto_${state.currentUser ? state.currentUser.id : 'anon'}`; }
function saveCadastroDraft(showToast = true) {
  const form = $('#cadastro-projeto-form');
  if (!form) return;
  const f = form.elements;
  const draft = {
    nome: f.nome.value,
    ods: (f.ods && f.ods.value) || (f.odsDisplay && f.odsDisplay.value) || '',
    descricao: f.descricao.value,
    professor: f.professor.value,
    links: f.links.value,
    qrLink: (f.qrLink && f.qrLink.value) || '',
  };
  try {
    localStorage.setItem(cadastroDraftKey(), JSON.stringify(draft));
    if (showToast) toast('Rascunho salvo neste dispositivo.', 'info');
  } catch (e) { if (showToast) toast('Não foi possível salvar o rascunho.', 'error'); }
}
function loadCadastroDraft() {
  try { const raw = localStorage.getItem(cadastroDraftKey()); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
function clearCadastroDraft() {
  try { localStorage.removeItem(cadastroDraftKey()); } catch (e) { /* noop */ }
}

function pageCadastroProjeto() {
  if (!state.currentUser || state.currentUser.role !== 'aluno') return requireLoginPage('Área exclusiva para alunos.');
  const u = state.currentUser;

  // O curso e a turma do aluno já vêm do cadastro/perfil, então não há
  // campos manuais de período/turma no formulário de projeto.
  if (!u.curso || !u.turma) {
    return `<div class="page section container" style="text-align:center;padding:100px 20px;">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--green-100);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;color:var(--green-700);">${icon('cpu', 34)}</div>
      <h2 style="margin-bottom:10px;">Complete seu perfil antes de cadastrar um projeto</h2>
      <p class="section-sub" style="margin:0 auto 28px;">Precisamos saber o seu curso e a sua turma para vincular o projeto automaticamente. Isso leva só um minuto.</p>
      <a href="#/perfil" class="btn btn-primary btn-lg">${icon('user', 18)} Completar perfil</a>
    </div>`;
  }

  pendingCadastro = { cover: null, coverName: '', coverSize: 0, doc: null, docName: '', docSize: 0 };
  const draft = loadCadastroDraft();
  const teachers = (state.teachers && state.teachers.length ? state.teachers : MOCK.teachers);
  const initialDescLen = (draft?.descricao || '').length;
  const initialCounterCls = initialDescLen >= 100 && initialDescLen <= 1000 ? 'ok' : (initialDescLen > 0 ? 'warn' : '');

  return `
  <div class="page section container" style="max-width:820px;">
    <div class="breadcrumb"><a href="#/home">Início</a><span class="sep">${icon('chevronRight', 13)}</span><a href="#/perfil">Meu perfil</a><span class="sep">${icon('chevronRight', 13)}</span><span>Cadastro de Projeto</span></div>
    <div class="eyebrow">${icon('plus', 14)} Novo projeto</div>
    <h1 class="section-title">Cadastro de Projeto</h1>
    <p class="section-sub" style="margin-bottom:32px;">Preencha as informações abaixo. Ao enviar, você recebe uma chave e uma senha para outros integrantes entrarem no projeto.</p>

    <form id="cadastro-projeto-form" onsubmit="return handleCadastroProjetoSubmit(event)">
      <div class="card card-pad" style="margin-bottom:20px;">
        <h3 style="font-size:15.5px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--ink-100);">${icon('cpu', 17)} Informações do Projeto</h3>

        <div class="field">
          <label>Nome do projeto *</label>
          <input class="input" name="nome" required minlength="3" maxlength="120" placeholder="Ex: Sistema de Gestão Ambiental" value="${escapeHtml(draft?.nome || '')}">
        </div>

        <div class="field">
          <label>ODS <span style="font-weight:400;color:var(--ink-300);">(Objetivo de Desenvolvimento Sustentável)</span></label>
          <div class="input-icon-wrap" style="display:flex;align-items:center;gap:8px;">
            <input class="input" name="odsDisplay" id="ods-display-input" value="${escapeHtml(draft?.ods || '')}" placeholder="Selecione uma ODS" readonly onclick="openOdsModal()" style="cursor:pointer;flex:1;">
            <button type="button" class="btn btn-ghost btn-sm" onclick="openOdsModal()">Selecionar</button>
            <input type="hidden" name="ods" value="${escapeHtml(draft?.ods || '')}">
          </div>
        </div>

        <div class="field">
          <label>Descrição do projeto *</label>
          <textarea class="textarea" name="descricao" required minlength="100" maxlength="1000" rows="5" oninput="updateCadastroCharCounter(this)" placeholder="Descreva os objetivos, metodologia e resultados esperados do seu projeto...">${escapeHtml(draft?.descricao || '')}</textarea>
          <div class="char-counter ${initialCounterCls}" id="cad-char-counter">Mínimo 100 caracteres, máximo 1000 caracteres · ${initialDescLen}/1000</div>
        </div>

        <div class="field">
          <label>Professor orientador *</label>
          <select class="select" name="professor" required>
            <option value="">Selecione o professor…</option>
            ${teachers.map(t => `<option value="${t.id}" ${draft?.professor === t.id ? 'selected' : ''}>${escapeHtml(t.name)}${t.course ? ' · ' + escapeHtml(t.course) : ''}</option>`).join('')}
          </select>
        </div>

        <div class="field" style="margin-bottom:0;">
          <label>Links (GitHub, docs, endereço de QR code etc..)</label>
          <input class="input" name="links" placeholder="Ex: https://github.com/seu-usuario/projeto" value="${escapeHtml(draft?.links || '')}">
        </div>
      </div>

      <div class="card card-pad" style="margin-bottom:20px;">
        <h3 style="font-size:15.5px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--ink-100);">${icon('qr', 17)} QR Code do projeto</h3>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;">
          <div class="field" style="margin-bottom:0;">
            <label>Upload da imagem do QR Code</label>
            <div class="dropzone" id="cad-qr-dropzone" onclick="document.getElementById('cad-qr-input').click()">
              <div id="cad-qr-content">
                <div class="dropzone-icon">${icon('upload', 22)}</div>
                <div class="dropzone-title">Clique para enviar QR Code</div>
                <div class="dropzone-hint">PNG, JPG · Máximo 2MB</div>
              </div>
            </div>
            <input type="file" id="cad-qr-input" accept="image/png,image/jpeg" style="display:none;" onchange="handleCadastroFileChange(event,'qr')">
          </div>
          <div class="field" style="margin-bottom:0;">
            <label>Link do QR Code</label>
            <input class="input" name="qrLink" placeholder="Ex: https://meu-projeto.com/qr" value="${escapeHtml(draft?.qrLink || '')}">
            <div class="field-hint" style="margin-top:8px;">Se quiser, pode enviar o link e converter depois em QR Code.</div>
          </div>
        </div>
      </div>

      <div class="card card-pad" style="margin-bottom:24px;">
        <h3 style="font-size:15.5px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--ink-100);">${icon('file', 17)} Documentos & Imagens</h3>

        <div class="field">
          <label>Imagem principal do projeto (opcional)</label>
          <div class="dropzone" id="cad-cover-dropzone" onclick="document.getElementById('cad-cover-input').click()">
            <div id="cad-cover-content">
              <div class="dropzone-icon">${icon('upload', 22)}</div>
              <div class="dropzone-title">Clique para carregar imagem</div>
              <div class="dropzone-hint">Formatos suportados: JPG, PNG · Máximo 5MB</div>
            </div>
          </div>
          <input type="file" id="cad-cover-input" accept="image/png,image/jpeg" style="display:none;" onchange="handleCadastroFileChange(event,'cover')">
        </div>

        <div class="field" style="margin-bottom:0;">
          <label>Documentação (opcional)</label>
          <div class="dropzone" id="cad-doc-dropzone" onclick="document.getElementById('cad-doc-input').click()">
            <div id="cad-doc-content">
              <div class="dropzone-icon">${icon('file', 22)}</div>
              <div class="dropzone-title">Clique para carregar relatório ou especificações</div>
              <div class="dropzone-hint">Formatos: PDF, DOC, DOCX · Máximo 10MB</div>
            </div>
          </div>
          <input type="file" id="cad-doc-input" accept=".pdf,.doc,.docx" style="display:none;" onchange="handleCadastroFileChange(event,'doc')">
        </div>
      </div>

      <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:12px;">
        <a href="#/perfil" class="btn btn-outline">← Voltar</a>
        <div class="flex gap-10">
          <button type="button" class="btn btn-ghost" onclick="saveCadastroDraft()">${icon('file', 16)} Salvar Rascunho</button>
          <button type="submit" class="btn btn-primary btn-lg">Enviar para Aprovação ${icon('arrowRight', 17)}</button>
        </div>
      </div>
    </form>
  </div>`;
}

function openOdsModal() {
  const form = $('#cadastro-projeto-form');
  if (!form) return;
  const current = (form.querySelector('[name="ods"]').value || '').trim();
  openModal(`
    <div class="modal-header">
      <h3 class="font-display" style="font-size:19px;">Selecionar ODS</h3>
      <button class="modal-close" onclick="closeModal()">${icon('close', 18)}</button>
    </div>
    <div class="modal-body">
      <div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-height:420px;overflow-y:auto;">
        ${ODS_LIST.map((ods) => {
          const [code, ...rest] = ods.split(' · ');
          const label = rest.join(' · ');
          const isSelected = current === ods;
          return `
            <button type="button" class="card card-pad ${isSelected ? 'selected-card' : ''}" style="text-align:left;display:flex;align-items:center;gap:10px;cursor:pointer;${isSelected ? 'border-color:var(--green-500);background:var(--green-50);' : ''}" onclick="selectOds('${code.replace(/'/g, "\\'")}', '${label.replace(/'/g, "\\'")}');closeModal();">
              <div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,var(--green-100),var(--blue-100));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:var(--green-700);">${escapeHtml(code)}</div>
              <div style="min-width:0;flex:1;">
                <div style="font-weight:700;font-size:13px;color:var(--ink-900);">${escapeHtml(code)}</div>
                <div style="font-size:12px;color:var(--ink-500);line-height:1.35;">${escapeHtml(label)}</div>
              </div>
            </button>`;
        }).join('')}
      </div>
    </div>
  `);
}
function selectOds(code, label) {
  const form = $('#cadastro-projeto-form');
  if (!form) return;
  const value = `${code} · ${label}`;
  const display = form.querySelector('[name="odsDisplay"]');
  const hidden = form.querySelector('[name="ods"]');
  if (display) display.value = value;
  if (hidden) hidden.value = value;
}
function updateCadastroCharCounter(textarea) {
  const len = textarea.value.length;
  const counter = $('#cad-char-counter');
  if (!counter) return;
  const cls = (len >= 100 && len <= 1000) ? 'ok' : (len > 0 ? 'warn' : '');
  counter.className = `char-counter ${cls}`;
  counter.textContent = `Mínimo 100 caracteres, máximo 1000 caracteres · ${len}/1000`;
}

function handleCadastroFileChange(e, kind) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (kind === 'cover') {
    if (!file.type.startsWith('image/')) { toast('Selecione um arquivo de imagem (JPG ou PNG).', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { toast('A imagem deve ter no máximo 5MB.', 'error'); return; }
  } else if (kind === 'qr') {
    if (!file.type.startsWith('image/')) { toast('Selecione uma imagem do QR Code (JPG ou PNG).', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { toast('A imagem do QR Code deve ter no máximo 2MB.', 'error'); return; }
  } else {
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) { toast('Envie um arquivo PDF, DOC ou DOCX.', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { toast('O documento deve ter no máximo 10MB.', 'error'); return; }
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (kind === 'cover') { pendingCadastro.cover = reader.result; pendingCadastro.coverName = file.name; pendingCadastro.coverSize = file.size; }
    else if (kind === 'qr') { pendingCadastro.qr = reader.result; pendingCadastro.qrName = file.name; pendingCadastro.qrSize = file.size; }
    else { pendingCadastro.doc = reader.result; pendingCadastro.docName = file.name; pendingCadastro.docSize = file.size; }
    renderCadastroDropzonePreview(kind, file);
  };
  reader.readAsDataURL(file);
}
function renderCadastroDropzonePreview(kind, file) {
  const dropzone = $(`#cad-${kind}-dropzone`);
  const content = $(`#cad-${kind}-content`);
  if (!dropzone || !content) return;
  dropzone.classList.add('has-file');
  const thumb = kind === 'cover'
    ? `<img src="${pendingCadastro.cover}">`
    : kind === 'qr'
      ? `<img src="${pendingCadastro.qr}">`
      : `<div class="dropzone-icon" style="margin:0;">${icon('file', 20)}</div>`;
  content.innerHTML = `
    <div class="dropzone-preview">
      ${thumb}
      <div style="min-width:0;flex:1;">
        <div style="font-weight:700;font-size:13.5px;color:var(--ink-900);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(file.name)}</div>
        <div style="font-size:12px;color:var(--ink-500);">${formatFileSize(file.size)} · ${icon('check', 12)} pronto</div>
      </div>
      <button type="button" class="dropzone-remove" onclick="event.stopPropagation();removeCadastroFile('${kind}')">${icon('x', 15)}</button>
    </div>`;
}
function removeCadastroFile(kind) {
  if (kind === 'cover') { pendingCadastro.cover = null; pendingCadastro.coverName = ''; pendingCadastro.coverSize = 0; }
  else if (kind === 'qr') { pendingCadastro.qr = null; pendingCadastro.qrName = ''; pendingCadastro.qrSize = 0; }
  else { pendingCadastro.doc = null; pendingCadastro.docName = ''; pendingCadastro.docSize = 0; }
  const input = $(`#cad-${kind}-input`);
  if (input) input.value = '';
  const dropzone = $(`#cad-${kind}-dropzone`);
  const content = $(`#cad-${kind}-content`);
  if (dropzone) dropzone.classList.remove('has-file');
  if (content) {
    content.innerHTML = kind === 'cover'
      ? `<div class="dropzone-icon">${icon('upload', 22)}</div><div class="dropzone-title">Clique para carregar imagem</div><div class="dropzone-hint">Formatos suportados: JPG, PNG · Máximo 5MB</div>`
      : kind === 'qr'
        ? `<div class="dropzone-icon">${icon('upload', 22)}</div><div class="dropzone-title">Clique para enviar QR Code</div><div class="dropzone-hint">PNG, JPG · Máximo 2MB</div>`
        : `<div class="dropzone-icon">${icon('file', 22)}</div><div class="dropzone-title">Clique para carregar relatório ou especificações</div><div class="dropzone-hint">Formatos: PDF, DOC, DOCX · Máximo 10MB</div>`;
  }
}

async function handleCadastroProjetoSubmit(e) {
  e.preventDefault();
  const f = e.target.elements;
  const descricao = f.descricao.value.trim();
  if (descricao.length < 100) {
    toast('A descrição precisa ter pelo menos 100 caracteres.', 'error');
    f.descricao.focus();
    return false;
  }
  if (!f.professor.value) {
    toast('Selecione o professor orientador.', 'error');
    return false;
  }
  const currentUser = state.currentUser || {};
  const turmaAuto = (currentUser.turma || '').trim();
  const periodoAuto = (currentUser.periodo || '').trim() || 'manha';
  const cursoAuto = (currentUser.curso || currentUser.course || '').trim();

  if (!turmaAuto) {
    toast('Não foi possível identificar sua turma no cadastro. Atualize seu perfil e tente novamente.', 'error');
    return false;
  }

  const payload = {
    name: f.nome.value.trim(),
    ods: f.ods.value,
    description: descricao,
    summary: descricao.slice(0, 140),
    periodo: periodoAuto,
    turma: turmaAuto,
    course: cursoAuto,
    teacher: f.professor.value,
    links: f.links.value.trim(),
    qrLink: (f.qrLink && f.qrLink.value || '').trim(),
    qrCode: pendingCadastro.qr || null,
    criado_por: currentUser.id,
  };
  if (pendingCadastro.cover) payload.cover = pendingCadastro.cover;
  if (pendingCadastro.doc) payload.documento = pendingCadastro.doc;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = `${icon('refresh', 16)} Enviando…`; }
  try {
    const result = await dataManager.createProject(payload);
    if (result.success) {
      clearCadastroDraft();
      await loadAllData();
      openProjectCreatedModal(result.id, result.senha);
    } else {
      toast(result.error || 'Erro ao cadastrar projeto', 'error');
    }
  } catch (err) {
    toast(err.message || 'Erro ao cadastrar projeto', 'error');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = `Enviar para Aprovação ${icon('arrowRight', 17)}`; }
  }
  return false;
}

// Modal exibido após o cadastro: mostra a chave (id do projeto) e a senha
// gerada, que devem ser repassadas aos outros integrantes da equipe.
function openProjectCreatedModal(id, senha) {
  openModal(`
    <div class="modal-body">
    <div style="text-align:center;padding:6px 4px 2px;">
      <div class="success-badge">${icon('check', 32)}</div>
      <h3 class="font-display" style="font-size:20px;margin-bottom:8px;">Cadastro concluído!</h3>
      <p style="font-size:13.5px;color:var(--ink-500);max-width:380px;margin:0 auto 22px;">Seu projeto foi enviado com sucesso. Guarde a chave e a senha abaixo — são elas que outros integrantes vão usar para entrar neste projeto.</p>
    </div>
    <div style="text-align:left;">
      <div class="credential-box">
        <div class="credential-meta">
          <div class="credential-label">Chave do projeto</div>
          <div class="credential-value">${escapeHtml(id)}</div>
        </div>
        <button type="button" class="credential-copy" onclick="copyCredential('${id}', this)">${icon('copy', 16)}</button>
      </div>
      <div class="credential-box" style="margin-bottom:6px;">
        <div class="credential-meta">
          <div class="credential-label">Senha de acesso</div>
          <div class="credential-value">${escapeHtml(senha)}</div>
        </div>
        <button type="button" class="credential-copy" onclick="copyCredential('${senha}', this)">${icon('copy', 16)}</button>
      </div>
      <p class="field-hint" style="margin-bottom:22px;">${icon('alert', 12)} Por segurança, essa senha não poderá ser recuperada depois — anote-a agora.</p>
    </div>
    <div class="flex gap-10">
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal();navigate('#/perfil')">Ir para meus projetos</button>
      <button class="btn btn-primary" style="flex:1;" onclick="closeModal();navigate('#/projeto/${id}')">${icon('eye', 16)} Ver meu projeto</button>
    </div>
    </div>
  `);
}
function copyCredential(value, btn) {
  const done = () => { if (btn) { const prev = btn.innerHTML; btn.innerHTML = icon('check', 16); setTimeout(() => { btn.innerHTML = prev; }, 1200); } };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(done).catch(() => toast('Não foi possível copiar automaticamente.', 'error'));
  } else {
    toast('Copie manualmente: ' + value, 'info');
  }
}

// "Encontrar meu projeto" — outro integrante usa a chave + senha geradas no
// cadastro para localizar o projeto e, se quiser, entrar nele como membro.
function openFindProjectModal() {
  openModal(`
    <div class="modal-header">
      <h3 class="font-display" style="font-size:19px;">Encontrar meu projeto</h3>
      <button class="modal-close" onclick="closeModal()">${icon('close', 18)}</button>
    </div>
    <div class="modal-body">
    <p class="field-hint" style="margin-bottom:18px;">Digite a chave e a senha que o criador do projeto recebeu no cadastro.</p>
    <form id="find-project-form" onsubmit="return handleFindProjectSubmit(event)">
      <div class="field"><label>Chave do projeto</label><input class="input" name="chave" required placeholder="Ex: p68f2a1c3e4567123"></div>
      <div class="field" style="margin-bottom:8px;"><label>Senha de acesso</label><input class="input" name="senha" required placeholder="Ex: 7K9XPQ2M"></div>
      <div id="find-project-result"></div>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:8px;">${icon('search', 16)} Buscar projeto</button>
    </form>
    </div>
  `);
}
async function handleFindProjectSubmit(e) {
  e.preventDefault();
  const f = e.target.elements;
  const chave = f.chave.value.trim();
  const senha = f.senha.value.trim();
  const resultBox = $('#find-project-result');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  try {
    const result = await dataManager.findProjectByKey(chave, senha);
    if (result.success && result.project) {
      const p = result.project;
      const alreadyMember = state.currentUser && (p.criado_por === state.currentUser.id || (safeParseArray(p.membros) || []).includes(state.currentUser.id));
      resultBox.innerHTML = `
        <div class="card card-pad" style="margin-bottom:4px;background:var(--green-50);border-color:var(--green-100);">
          <div style="font-weight:700;fontsize:14.5px;margin-bottom:4px;">${icon('checkCircle', 15)} ${escapeHtml(p.nome)}</div>
          <div style="font-size:12.5px;color:var(--ink-500);margin-bottom:14px;">${escapeHtml(p.curso || '')} ${p.turma ? '· Turma ' + escapeHtml(p.turma) : ''}</div>
          <div class="flex gap-8">
            <a href="#/projeto/${p.id}" class="btn btn-outline btn-sm" style="flex:1;" onclick="closeModal()">${icon('eye', 14)} Ver projeto</a>
            ${(!alreadyMember && state.currentUser && state.currentUser.role === 'aluno') ? `<button type="button" class="btn btn-secondary btn-sm" style="flex:1;" onclick="joinFoundProject('${chave.replace(/'/g, "\\'")}','${senha.replace(/'/g, "\\'")}')">${icon('users', 14)} Entrar como integrante</button>` : ''}
          </div>
          ${(!state.currentUser) ? `<p class="field-hint" style="margin-top:10px;">${icon('lock', 12)} Faça login como aluno para entrar como integrante deste projeto.</p>` : ''}
        </div>`;
    } else {
      resultBox.innerHTML = `<p class="field-hint" style="color:var(--orange-600);margin-bottom:8px;">${icon('alert', 12)} ${escapeHtml(result.error || 'Chave ou senha incorretos.')}</p>`;
    }
  } catch (err) {
    resultBox.innerHTML = `<p class="field-hint" style="color:var(--orange-600);margin-bottom:8px;">${icon('alert', 12)} ${escapeHtml(err.message || 'Chave ou senha incorretos.')}</p>`;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
  return false;
}
async function joinFoundProject(chave, senha) {
  if (!state.currentUser) { toast('Faça login para entrar como integrante.', 'error'); return; }
  try {
    const result = await dataManager.joinProjectAsMember(chave, senha, state.currentUser.id);
    if (result.success) {
      toast('Você agora é integrante deste projeto! 🎉', 'success');
      await loadAllData();
      closeModal();
      navigate(`#/projeto/${chave}`);
    } else {
      toast(result.error || 'Não foi possível entrar no projeto.', 'error');
    }
  } catch (err) { toast(err.message || 'Não foi possível entrar no projeto.', 'error'); }
}

function openEditProjectModal(id) {
  const p = state.projects.find(x => x.id === id);
  if (!p) return;
  if (!state.currentUser || p.criadoPor !== state.currentUser.id) {
    toast('Você só pode editar projetos que você mesmo cadastrou.', 'error');
    return;
  }
  const equipeStr = (p.team || []).join(', ');
  openModal(`
    <div class="modal-header">
      <h3 class="font-display" style="font-size:19px;">Editar projeto</h3>
      <button class="modal-close" onclick="closeModal()">${icon('close', 18)}</button>
    </div>
    <div class="modal-body">
      <form onsubmit="return handleEditProjectSubmit(event, '${p.id}')">
        <div class="field"><label>Nome do projeto *</label><input class="input" name="nome" required value="${escapeHtml(p.name || '')}"></div>
        <div class="field">
          <label>Foto de capa</label>
          <div class="flex items-center gap-12">
            <div id="edit-project-cover-preview" style="width:110px;height:70px;border-radius:var(--radius-md);background:var(--ink-50);border:1px dashed var(--ink-200);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">${p.cover ? `<img src="${p.cover}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:26px;">${p.image}</span>`}</div>
            <label class="btn btn-outline btn-sm" style="cursor:pointer;">
              ${icon('upload', 15)} Alterar capa
              <input type="file" accept="image/*" style="display:none;" onchange="handleEditProjectCoverChange(event)">
            </label>
          </div>
          <div class="field-hint" style="margin-top:6px;">JPG ou PNG, até 2MB.</div>
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr 1fr;gap:16px;">
          <div class="field"><label>Turma *</label><input class="input" name="turma" required value="${escapeHtml(p.turma || '')}"></div>
          <div class="field"><label>Período *</label>
            <select class="select" name="periodo" required>
              ${PERIODOS.map(x => `<option value="${x.value}" ${p.periodo === x.value ? 'selected' : ''}>${x.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field"><label>Resumo curto</label><input class="input" name="resumo" value="${escapeHtml(p.summary || '')}"></div>
        <div class="field"><label>Descrição</label><textarea class="textarea" name="descricao">${escapeHtml(p.description || '')}</textarea></div>
        <div class="field"><label>Categoria</label>
          <select class="select" name="categoria_id">
            <option value="">Sem categoria</option>
            ${state.categories.map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>ODS</label>
          <select class="select" name="ods">
            <option value="">Selecione…</option>
            ${ODS_LIST.map(o => `<option value="${escapeHtml(o)}" ${p.ods === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Professor orientador</label>
          <select class="select" name="professor_id">
            <option value="">Selecione o professor…</option>
            ${(state.teachers && state.teachers.length ? state.teachers : MOCK.teachers).map(t => `<option value="${t.id}" ${p.teacher === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Integrantes da equipe (separados por vírgula)</label><input class="input" name="equipe" value="${escapeHtml(equipeStr)}"></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;">
          <div class="field"><label>GitHub</label><input class="input" name="github" value="${escapeHtml(p.github || '')}"></div>
          <div class="field"><label>Site</label><input class="input" name="site" value="${escapeHtml(p.site || '')}"></div>
        </div>
        <div class="field"><label>Links (GitHub, docs, QR code etc.)</label><input class="input" name="links" value="${escapeHtml(p.links || '')}"></div>
        <button type="submit" class="btn btn-primary btn-block btn-lg">${icon('check', 17)} Salvar alterações</button>
      </form>
    </div>`, {});
}
let pendingEditProjectCoverDataUrl = null;
function handleEditProjectCoverChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('Selecione um arquivo de imagem.', 'error'); return; }
  if (file.size > 2 * 1024 * 1024) { toast('A imagem deve ter no máximo 2MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    pendingEditProjectCoverDataUrl = reader.result;
    const preview = $('#edit-project-cover-preview');
    if (preview) preview.innerHTML = `<img src="${pendingEditProjectCoverDataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
    toast('Capa selecionada! Clique em "Salvar alterações" para confirmar.', 'info');
  };
  reader.readAsDataURL(file);
}
async function handleEditProjectSubmit(e, id) {
  e.preventDefault();
  const f = e.target.elements;
  const equipeRaw = f.equipe.value.trim();
  const payload = {
    id,
    usuario_id: state.currentUser.id,
    nome: f.nome.value.trim(),
    turma: f.turma.value.trim(),
    curso: f.curso.value,
    periodo: f.periodo.value,
    resumo: f.resumo.value.trim(),
    descricao: f.descricao.value.trim(),
    categoria_id: f.categoria_id.value || null,
    ods: f.ods.value,
    professor_id: f.professor_id.value || null,
    team: equipeRaw ? equipeRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
    github: f.github.value.trim(),
    site: f.site.value.trim(),
    links: f.links.value.trim(),
  };
  if (pendingEditProjectCoverDataUrl) payload.capa = pendingEditProjectCoverDataUrl;
  if (!payload.nome || !payload.turma || !payload.curso || !payload.periodo) {
    toast('Preencha nome, turma, curso e período.', 'error');
    return false;
  }
  try {
    const result = await dataManager.updateProject(payload);
    if (result.success) {
      pendingEditProjectCoverDataUrl = null;
      toast('Projeto atualizado com sucesso!', 'success');
      closeModal();
      await loadAllData();
      render();
    } else {
      toast(result.error || 'Erro ao atualizar projeto', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao atualizar projeto', 'error'); }
  return false;
}

async function deleteMyAccount() {
  if (!state.currentUser) return;
  if (!confirm('Tem certeza que deseja excluir sua conta? Essa ação é permanente e não pode ser desfeita.')) return;
  try {
    const result = await dataManager.deleteUser(state.currentUser.id);
    if (result.success) {
      await dataManager.logout().catch(() => {});
      state.currentUser = null;
      state.votedProjects = new Set();
      clearSession();
      toast('Sua conta foi excluída.', 'info');
      navigate('#/home');
    } else {
      toast(result.error || 'Erro ao excluir conta', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao excluir conta', 'error'); }
}
async function deleteMyProject(id) {
  if (!confirm('Tem certeza que deseja excluir este projeto? Essa ação não pode ser desfeita.')) return;
  try {
    const result = await dataManager.deleteProject(id, state.currentUser?.id);
    if (result.success) {
      toast('Projeto excluído.', 'info');
      await loadAllData();
      render();
    } else {
      toast(result.error || 'Erro ao excluir projeto', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao excluir projeto', 'error'); }
}

async function markOfficeAttended(oficinaId) {
  if (!state.currentUser) return;
  try {
    const result = await dataManager.enrollOffice(state.currentUser.id, oficinaId);
    if (result.success) {
      toast('Presença registrada! Agora você pode votar nesta oficina.', 'success');
      state.offices = await dataManager.getOffices(state.currentUser.id);
      render();
    } else {
      toast(result.error || 'Erro ao registrar presença', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao registrar presença', 'error'); }
}

async function voteOffice(oficinaId) {
  if (!state.currentUser) return;
  try {
    const result = await dataManager.voteOffice(state.currentUser.id, oficinaId);
    if (result.success) {
      toast('Voto na oficina registrado com sucesso! 🎉', 'success');
      state.offices = await dataManager.getOffices(state.currentUser.id);
      render();
    } else {
      toast(result.error || 'Erro ao votar na oficina', 'error');
    }
  } catch (err) { toast(err.message || 'Erro ao votar na oficina', 'error'); }
}

// ÁREA DO PROFESSOR (placeholder)
function pageTeacherArea() {
  if (!state.currentUser || state.currentUser.role !== 'professor') return requireLoginPage('Área exclusiva para professores.');
  return `<div class="page section container"><h1>Área do Professor</h1><p>Funcionalidade em desenvolvimento.</p></div>`;
}

// ADMIN (placeholder)
function pageAdmin() {
  if (!state.currentUser || state.currentUser.role !== 'admin') return requireLoginPage('Área restrita a administradores.');
  return `<div class="page section container"><h1>Painel Administrativo</h1><p>Funcionalidade em desenvolvimento.</p></div>`;
}

function renderAdminCharts() {}

// 404
function page404() {
  return `<div class="section container" style="text-align:center;padding:120px 20px;">
    <div style="font-family:var(--font-display);font-weight:800;font-size:88px;background:linear-gradient(135deg,var(--blue-600),var(--green-500));-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1;">404</div>
    <h2 style="margin:18px 0 10px;">Página não encontrada</h2>
    <p class="section-sub" style="margin:0 auto 28px;">O endereço que você tentou acessar não existe ou foi movido.</p>
    <a href="#/home" class="btn btn-primary btn-lg">${icon('home', 18)} Voltar ao início</a>
  </div>`;
}

/* ============================================================
   ROTEADOR PRINCIPAL
   ============================================================ */
async function render() {
  routeLoaderStart();
  const app = $('#app');
  const hash = location.hash || '#/home';
  state.route = hash.split('/').slice(0, 2).join('/');

  if (!state.bootDone) {
    state.bootDone = true;
    if (!state.currentUser) {
      const saved = loadSession();
      if (saved) state.currentUser = saved;
    }
  }

  if (!state.categories || state.categories.length === 0) {
    await loadAllData();
  }

  let content = '';
  const [_, path, param] = hash.split('/');

  if (path === 'area-aluno') {
    navigate('#/home');
    return;
  }

  switch (path) {
    case undefined:
    case '':
    case 'home': content = pageHome(); break;
    case 'projetos': content = param ? pageProjectDetail(param) : pageProjects(); break;
    case 'projeto': content = pageProjectDetail(param); break;
    case 'ranking': content = pageRanking(); break;
    case 'cronograma': content = pageSchedule(); break;
    case 'mapa': content = pageMap(); break;
    case 'noticias': content = pageNews(); break;
    case 'perfil': content = pageProfile(); break;
    case 'cadastro-projeto': content = pageCadastroProjeto(); break;
    case 'area-professor': content = pageTeacherArea(); break;
    case 'admin': content = pageAdmin(); break;
    default: content = page404();
  }

  app.innerHTML = renderNavbar() + `<main>${content}</main>` + renderFooter();
  window.scrollTo({ top: 0, behavior: 'instant' });
  routeLoaderDone();

  if (path === 'ranking') setTimeout(renderCategoryVotesChart, 30);
  if (path === 'admin') setTimeout(renderAdminCharts, 30);
  if ((path === 'projeto' || path === 'projetos') && param) setTimeout(() => loadProjectComments(param), 30);
}
function navigate(hash) { location.hash = hash; }

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);