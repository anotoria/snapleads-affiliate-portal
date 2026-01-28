

# Plano: Desabilitar Acesso a Documentos no Menu

## Resumo

Adicionar marcação "Em Breve" no item de menu Documentos em todas as línguas (EN, PT, ES) e bloquear o acesso direto, deixando o item em modo read-only com cor cinza claro.

---

## Alterações a Implementar

### 1. Adicionar Traduções

**Arquivo:** `src/i18n/translations.ts`

Adicionar nova chave `comingSoon` no tipo `CommonTranslations` e nas traduções de cada idioma:

| Idioma | Chave | Valor |
|--------|-------|-------|
| EN | `common.comingSoon` | "Coming Soon" |
| PT | `common.comingSoon` | "Em Breve" |
| ES | `common.comingSoon` | "Próximamente" |

### 2. Modificar Sidebar do Afiliado

**Arquivo:** `src/components/layout/AppSidebar.tsx`

Alterações:
- Adicionar propriedade `disabled` aos itens de navegação
- Marcar o item "documents" como `disabled: true`
- Renderização condicional:
  - Se `disabled`: mostrar um `<div>` não-clicável ao invés de `<NavLink>`
  - Aplicar classes de estilo cinza: `text-muted-foreground/50 cursor-not-allowed`
  - Adicionar Badge "Em Breve" ao lado do título

**Estrutura do navItem:**
```typescript
interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled?: boolean;
}
```

**Renderização condicional:**
```tsx
{item.disabled ? (
  <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground/50 cursor-not-allowed">
    <item.icon className="h-5 w-5 shrink-0" />
    {!collapsed && (
      <span className="flex items-center gap-2">
        {item.title}
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {t.common.comingSoon}
        </Badge>
      </span>
    )}
  </div>
) : (
  <NavLink ... />
)}
```

---

## Resultado Visual

| Estado | Aparência |
|--------|-----------|
| Normal | Item cinza claro, não-clicável |
| Hover | Sem efeito de hover (cursor not-allowed) |
| Badge | "Em Breve" / "Coming Soon" / "Próximamente" |
| Collapsed | Apenas ícone cinza (sem badge) |

---

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/i18n/translations.ts` | Adicionar `comingSoon` em EN, PT, ES |
| `src/components/layout/AppSidebar.tsx` | Lógica de item desabilitado + badge |

---

## Detalhes Técnicos

### Tipo TypeScript Atualizado

```typescript
// CommonTranslations
type CommonTranslations = {
  // ... existing
  comingSoon: string;
};
```

### NavItem com disabled

```typescript
const navItems = [
  { title: t.nav.dashboard, url: "/", icon: LayoutDashboard },
  // ... outros
  { title: t.nav.documents, url: "/documents", icon: FolderOpen, disabled: true },
  // ... resto
];
```

### Importação do Badge

```typescript
import { Badge } from "@/components/ui/badge";
```

---

## Considerações

- A rota `/documents` continua existindo no App.tsx
- Se o usuário tentar acessar diretamente via URL, a página ainda abrirá
- Para bloquear acesso completo via URL, podemos adicionar um redirect na página Documents.tsx (opcional)
- A abordagem atual bloqueia apenas via menu, mantendo flexibilidade para admins

