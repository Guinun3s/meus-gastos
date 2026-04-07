# meu $ dinheiro — Guia de configuração

App de controle de gastos responsivo (desktop + mobile) com login, sincronização em nuvem e suporte a PWA.

---

## Visão geral

| Feature | Descrição |
|---|---|
| Login | E-mail/senha ou Google |
| Sincronização | Automática — Firestore em tempo real |
| Offline | Funciona sem internet, sincroniza quando voltar |
| Responsivo | Desktop (sidebar + tabela) · Mobile (nav inferior + cards) |
| Instalável | PWA — "Adicionar à tela inicial" no Android e iOS |

---

## Passo 1 — Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. **"Criar um projeto"** → dê um nome → continue
3. Na tela do projeto, vá em **"Firestore Database"** → **"Criar banco de dados"**
   - Escolha **"Iniciar no modo de produção"**
   - Selecione uma região (ex: `us-east1`) → Concluir

---

## Passo 2 — Ativar autenticação

1. No menu lateral, vá em **"Authentication"** → **"Primeiros passos"**
2. Na aba **"Sign-in method"**, ative:
   - ✅ **E-mail/senha**
   - ✅ **Google** (escolha um e-mail de suporte)
3. Salve

---

## Passo 3 — Configurar as regras do Firestore

No Firestore → aba **"Regras"**, substitua por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gastos/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

Clique em **"Publicar"**.

> Cada usuário só consegue ler e escrever os próprios dados. Sem login, sem acesso.

---

## Passo 4 — Pegar as credenciais

1. Engrenagem (⚙) → **"Configurações do projeto"**
2. Role até **"Seus aplicativos"** → clique em **"</>"** (Web)
3. Dê um nome → **"Registrar app"**
4. Copie o objeto `firebaseConfig`

---

## Passo 5 — Colar no firebase-config.js

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",
  authDomain:        "meu-projeto.firebaseapp.com",
  projectId:         "meu-projeto",
  storageBucket:     "meu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc..."
};
```

---

## Passo 6 — Adicionar domínio autorizado (GitHub Pages)

Para o login com Google funcionar no GitHub Pages:

1. Firebase → **Authentication** → aba **"Settings"** → **"Authorized domains"**
2. Clique em **"Adicionar domínio"**
3. Cole: `SEU_USUARIO.github.io`

---

## Passo 7 — Publicar no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos:
   ```
   index.html
   firebase-config.js
   manifest.json
   sw.js
   icon-192.png
   icon-512.png
   ```
3. Settings → Pages → Source: **"Deploy from a branch"** → Branch: `main` / `root`
4. Seu app ficará em: `https://SEU_USUARIO.github.io/NOME_DO_REPO`

---

## Passo 8 — Instalar no celular (PWA)

**Android (Chrome):**
Menu (⋮) → "Adicionar à tela inicial"

**iOS (Safari):**
Compartilhar (□↑) → "Adicionar à tela de início"

---

## Como funciona o login

- **Criar conta:** e-mail + senha (mínimo 6 caracteres) ou Google
- **Entrar:** e-mail/senha ou Google (login automático nas próximas visitas)
- **Esqueci a senha:** link na tela de login — envia e-mail de recuperação
- **Sair:** botão na topbar (desktop) ou menu (mobile)
- Os dados ficam 100% associados ao e-mail do usuário — acessíveis de qualquer dispositivo

---

## Uso gratuito do Firebase

O plano **Spark (gratuito)** inclui:
- 50.000 leituras/dia
- 20.000 escritas/dia
- 1 GB de armazenamento
- Autenticação ilimitada

Para um app pessoal ou com poucos usuários, nunca precisará pagar.

---

## Estrutura de dados no Firestore

```
gastos/
  {uid do usuário}/
    expenses: {
      "2025_0": [ { id, desc, valor, cat, pay, data }, ... ],
      "2025_1": [ ... ],
      ...
    }
    balances: {
      "2025_0": 5000,
      "2025_1": 4800,
      ...
    }
    budgets: {
      mercado: 600,
      alimentacao: 400,
      ...
    }
    updatedAt: "2025-01-15T..."
```
