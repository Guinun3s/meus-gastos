// ============================================================
// js/state.js — estado global da aplicação
// Todas as variáveis mutáveis compartilhadas entre módulos.
// ============================================================

// Mês/ano atualmente exibido
let curMonth = new Date().getMonth();
let curYear  = new Date().getFullYear();

// Instâncias do Firebase
let _db          = null;
let _auth        = null;
let _user        = null;

// Controle de sincronização
let _syncTimer   = null;
let _syncing     = false;
let _unsubscribe = null;

// Modo de autenticação: 'login' | 'register'
let _authMode = 'login';

// Cache em memória dos dados do usuário (espelhado no Firestore)
let _cache = { expenses: {}, balances: {}, budgets: {}, goals: [] };

// ID do lançamento sendo editado (null = modo adição)
let _editingId = null;
let _editingGoalId = null;
