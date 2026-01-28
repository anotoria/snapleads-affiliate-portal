
# Plano: Ajustar Background do Logo e Texto no Tema Escuro

## Resumo

Alterar o background do header da sidebar para usar a cor lilás (primary) no tema escuro, e o texto "Programa de Afiliados" para roxo escuro em negrito.

---

## Alterações a Implementar

### 1. Atualizar Background do SidebarHeader

**Arquivos:** `src/components/layout/AppSidebar.tsx` e `src/components/admin/AdminSidebar.tsx`

| Antes | Depois |
|-------|--------|
| `dark:bg-white/70` | `dark:bg-primary` |

### 2. Atualizar Estilo do Subtítulo no Logo

**Arquivo:** `src/components/Logo.tsx`

| Propriedade | Antes | Depois |
|-------------|-------|--------|
| Cor (dark mode) | `text-muted-foreground` | `dark:text-[hsl(281,50%,6%)]` |
| Peso | Normal | `font-semibold` |

---

## Código das Alterações

### AppSidebar.tsx e AdminSidebar.tsx
```tsx
<SidebarHeader className="... dark:bg-primary dark:rounded-lg dark:m-2 dark:mb-0 dark:border-none ...">
```

### Logo.tsx
```tsx
<span className={`text-xs text-muted-foreground dark:text-[hsl(281,50%,6%)] font-semibold mt-1 ...`}>
```

---

## Resultado Visual (Tema Escuro)

| Elemento | Cor | Resultado |
|----------|-----|-----------|
| Background do header | Lilás (primary ~#b280e6) | Destaque vibrante |
| Texto "Programa de Afiliados" | Roxo escuro (~#120a17) + bold | Alto contraste e legibilidade |

---

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/AppSidebar.tsx` | Background `dark:bg-primary` |
| `src/components/admin/AdminSidebar.tsx` | Background `dark:bg-primary` |
| `src/components/Logo.tsx` | Texto roxo escuro + bold |
