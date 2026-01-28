
# Plano: Ajustar Background do Logo no Tema Escuro

## Resumo

Alterar o background do header da sidebar (onde fica o logotipo) de `white/10` para `white/70` no tema escuro, aplicando a cor mais clara conforme validado.

---

## Alterações a Implementar

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/AppSidebar.tsx` | Mudar `dark:bg-white/10` para `dark:bg-white/70` |
| `src/components/admin/AdminSidebar.tsx` | Mudar `dark:bg-white/10` para `dark:bg-white/70` |

### Código Atual vs Novo

**Antes:**
```tsx
<SidebarHeader className="... dark:bg-white/10 ...">
```

**Depois:**
```tsx
<SidebarHeader className="... dark:bg-white/70 ...">
```

---

## Resultado Visual

| Tema | Background | Cor Aproximada |
|------|------------|----------------|
| Claro | Sem background especial | Branco padrão |
| Escuro (antes) | `white/10` | ~#2a2530 |
| Escuro (depois) | `white/70` | ~#c5bfcb |

A nova cor é um lilac-gray claro que mantém harmonia com a paleta purple da marca enquanto oferece contraste adequado para o logotipo.
