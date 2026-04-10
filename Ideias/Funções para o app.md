~~💰 Funcionalidades financeiras~~



~~Recorrências — marcar uma despesa como recorrente (aluguel, assinatura) e ela aparecer automaticamente todo mês~~

~~Parcelamentos — lançar uma compra em X parcelas e o app distribuir automaticamente nos meses seguintes~~

~~Receitas — hoje o app só rastreia gastos; adicionar entradas permitiria calcular saldo real do mês~~

~~Cartões de crédito — agrupar gastos por cartão com data de fechamento/vencimento~~





~~📊 Análises e visualizações~~



~~Previsão de gastos — com base na média dos últimos 3 meses, estimar quanto você vai gastar no mês atual~~

~~Gasto por dia da semana — identificar padrões (ex: fins de semana mais caros)~~

~~Alertas de orçamento — notificação quando uma categoria ultrapassar X% do limite definido~~





~~🔔 Notificações~~



~~Push notifications — lembrete diário/semanal para registrar gastos (já é possível via PWA)~~

~~Alerta de meta atingida — avisar quando bater o limite de alguma categoria~~





🛠️ Experiência e usabilidade



Modo offline completo — fila de sincronização para lançamentos feitos sem internet (o Firestore já suporta isso nativamente)

Importar extrato — ler um CSV do banco e lançar as despesas automaticamente

Foto do comprovante — anexar imagem a uma despesa (Firebase Storage)

Atalho rápido — widget ou botão flutuante para lançar gasto sem abrir o app completo





🔐 Conta e dados



Exportar para PDF — relatório mensal formatado para guardar ou compartilhar

Multi-usuário / casal — compartilhar o mesmo controle financeiro com outra pessoa

Backup manual — download dos dados em JSON além do CSV atual

Alta prioridade — resolve dores do dia a dia
1. Notificação de fatura próxima do vencimento — o app já tem cartões com data de vencimento, mas não avisa quando está chegando. Fácil de implementar com a infraestrutura de notificações que já existe.
2. Saldo projetado no fim do mês — pegar o saldo atual + receitas fixas esperadas - compromissos recorrentes futuros = projeção de fechamento do mês. Muito útil para decisão de gasto.
3. Busca global — digitar "uber" e ver todos os lançamentos de Uber de todos os meses. A busca atual é só dentro do mês aberto.

Média prioridade — melhora experiência existente
4. Lançamento rápido por voz — usar a Web Speech API para ditar "Mercado 45 reais pix" e preencher o formulário automaticamente. Zero digitação no mobile.
5. Templates de lançamentos frequentes — salvar atalhos para gastos repetidos ("Mercado do João", "Uber para faculdade"). Um toque e o form já vem preenchido.
6. Relatório mensal em PDF — gerar um resumo do mês com gráficos e tabela para baixar. Útil para quem quer guardar histórico fora do app.

Baixa prioridade — mas diferencia o app
7. Múltiplos perfis / contas compartilhadas — casal ou família controlando juntos.
8. Integração com Open Finance — importar extratos do banco automaticamente via API.
9. Widget Android/iOS — mostrar o saldo real na tela inicial do celular sem abrir o app.



