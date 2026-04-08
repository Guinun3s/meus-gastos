// ============================================================
// js/state.js — estado global da aplicação
// ============================================================

let curMonth = new Date().getMonth();
let curYear  = new Date().getFullYear();

let _db          = null;
let _auth        = null;
let _user        = null;

let _syncTimer   = null;
let _syncing     = false;
let _unsubscribe = null;

let _authMode = "login";

// Cache em memória (espelhado no Firestore)
let _cache = { expenses: {}, incomes: {}, budgets: {}, goals: [], cards: [] };

// IDs em edição
let _editingId       = null;
let _editingIncomeId = null;
let _editingGoalId   = null;
