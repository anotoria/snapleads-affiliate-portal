
# Plano: Adicionar Nome do Usuário na Tela de Suporte

## Resumo
Exibir o nome do usuário que criou o ticket em duas áreas da página de Suporte do afiliado:
1. **Lista de Meus Tickets** - Nome junto ao título do ticket
2. **Tela de Conversa** - Nome abaixo da data de criação

## Alterações Necessárias

### Arquivo: `src/pages/Support.tsx`

#### 1. Na Lista de Tickets (Meus Tickets)
Adicionar o nome do usuário (obtido via `useAuth().profile.full_name`) abaixo do título do ticket ou junto com a data.

**Layout Atual:**
```
Meu cliente ainda nao ativou e ...    [Aberto]
26/01/2026 17:55
```

**Layout Proposto:**
```
Meu cliente ainda nao ativou e ...    [Aberto]
Rodrigo Mendes • 26/01/2026 17:55
```

#### 2. Na Tela de Conversa (Detalhes do Ticket)
Adicionar o nome do usuário na descrição abaixo da data de criação.

**Layout Atual:**
```
Meu cliente ainda nao ativou e ja pagou
Criado em 26/01/2026 às 17:55
```

**Layout Proposto:**
```
Meu cliente ainda nao ativou e ja pagou
Criado em 26/01/2026 às 17:55
por Rodrigo Mendes
```

---

## Detalhes Técnicos

### Implementação

1. O componente já utiliza `useAuth()` para o usuário logado, mas não está extraindo o `profile`
2. Adicionar extração do profile: `const { profile } = useAuth();`
3. Usar `profile?.full_name` para exibir o nome do usuário

### Modificações no Código

**Linha ~22** - Adicionar extração do profile:
```typescript
const { profile } = useAuth();
```

**Linha ~242-245** - Atualizar a lista de tickets para incluir o nome:
```typescript
<div className="min-w-0">
  <h4 className="font-medium truncate">{ticket.subject}</h4>
  <p className="text-xs text-muted-foreground mt-1">
    {profile?.full_name && <span>{profile.full_name} • </span>}
    {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
  </p>
</div>
```

**Linha ~273-275** - Atualizar o CardDescription para incluir o nome:
```typescript
<CardDescription>
  Criado em {format(new Date(selectedTicket.created_at), "dd/MM/yyyy 'às' HH:mm")}
  {profile?.full_name && <span className="block">por {profile.full_name}</span>}
</CardDescription>
```

### Arquivo Modificado
- `src/pages/Support.tsx`

## Observação
Como os afiliados só visualizam seus próprios tickets nesta tela, o nome do usuário será sempre o mesmo (do usuário logado). Para uma experiência mais rica onde cada ticket pudesse ter um criador diferente (cenário futuro), seria necessário modificar o hook `useSupportTickets` para fazer join com a tabela `profiles`.
