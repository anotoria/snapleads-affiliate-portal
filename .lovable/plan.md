
# Plano: Atualizar Formulário de Cadastro de Afiliados

## Resumo
Expandir o formulário de signup para incluir novos campos obrigatórios (Company Name e Phone Number), um checkbox obrigatório de consentimento para notificações, e um link para o portal de afiliados.

## Alterações Visuais do Formulário

### Layout Proposto
```text
┌─────────────────────────────────────────────────────────────────┐
│                    [Logo SnapLeads]                             │
│                    Portal de Afiliados                          │
│                                                                 │
│                     Create Account                              │
│             Start earning with SnapLeads today                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Full Name:          [________________________]                 │
│                                                                 │
│  Email:              [________________________]                 │
│                                                                 │
│  Company Name:       [________________________]   (NOVO)        │
│                                                                 │
│  Phone Number:       [________________________]   (NOVO)        │
│                                                                 │
│  Password:           [________________________]                 │
│                                                                 │
│  Confirm Password:   [________________________]                 │
│                                                                 │
│  [✓] I agree to receive email and phone notifications          │
│      (like when I earn a commission) and other important       │
│      notifications regarding the affiliate program.  (NOVO)    │
│                                                                 │
│  Ver portal de Afiliados  (link externo)          (NOVO)        │
│                                                                 │
│              [ Sign Up → ]                                      │
│                                                                 │
│         Already have an account? Sign In                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alterações Necessárias

### 1. Arquivo: `src/pages/Auth.tsx`

**Mudanças no tipo SignUpFormData:**
```typescript
type SignUpFormData = {
  fullName: string;
  email: string;
  companyName: string;    // NOVO
  phone: string;          // NOVO
  password: string;
  confirmPassword: string;
  agreeNotifications: boolean;  // NOVO - checkbox obrigatório
};
```

**Atualização do schema de validação:**
```typescript
const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().min(2, "Company name is required"),
  phone: z.string()
    .min(10, "Phone must have at least 10 digits")
    .max(15, "Phone must have at most 15 digits")
    .regex(/^[0-9]+$/, "Phone must contain only numbers"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  agreeNotifications: z.boolean()
    .refine(val => val === true, "You must agree to receive notifications"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

**Novos campos no formulário:**
- Campo Company Name com ícone Building
- Campo Phone Number com ícone Phone
- Checkbox com texto de consentimento
- Link externo "Ver portal de Afiliados"

**Imports adicionais:**
```typescript
import { Building, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
```

### 2. Arquivo: `src/hooks/useAuth.tsx`

**Atualização da função signUp:**
```typescript
const signUp = async (
  email: string, 
  password: string, 
  fullName: string,
  companyName: string,  // NOVO
  phone: string         // NOVO
) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
        company_name: companyName,  // NOVO
        phone: phone,               // NOVO
      },
    },
  });
  return { error };
};
```

### 3. Migração SQL: Atualizar trigger `handle_new_user`

O trigger precisa ser atualizado para capturar os novos campos do metadata:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, company_name, phone, affiliate_code)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'phone',
        'ref_' || substring(NEW.id::text, 1, 8)
    );
    RETURN NEW;
END;
$$;
```

---

## Detalhes Técnicos

### Validação de Dados
| Campo | Validação |
|-------|-----------|
| Full Name | Mínimo 2 caracteres |
| Email | Formato de email válido |
| Company Name | Mínimo 2 caracteres |
| Phone Number | 10-15 dígitos, apenas números |
| Password | Mínimo 6 caracteres |
| Confirm Password | Deve ser igual ao Password |
| Checkbox | Deve estar marcado (true) |

### Arquivos Modificados
1. `src/pages/Auth.tsx` - Formulário de cadastro
2. `src/hooks/useAuth.tsx` - Função signUp com novos parâmetros
3. Migração SQL - Atualizar trigger handle_new_user

### Dependências Utilizadas
- `Checkbox` de `@/components/ui/checkbox` (já existe)
- Ícones `Building` e `Phone` de `lucide-react`

### Link Externo
O link "Ver portal de Afiliados" abrirá em nova aba:
- URL: https://snapleads.com.br/joinaffiliate
- Atributos: `target="_blank" rel="noopener noreferrer"`
