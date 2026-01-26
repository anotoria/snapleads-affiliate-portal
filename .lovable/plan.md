
# Plano: Internacionalização Completa da Tela de Cadastro

## Resumo
Adicionar todas as traduções faltantes para os campos do formulário de cadastro e tela de mudança de senha, garantindo que os textos sejam exibidos corretamente em inglês, português e espanhol.

## Textos a Traduzir

### Novos campos do formulário de cadastro
| Chave | EN | PT | ES |
|-------|-------|-------|-------|
| companyName | Company Name | Nome da Empresa | Nombre de la Empresa |
| phoneNumber | Phone Number | Número de Telefone | Número de Teléfono |
| confirmPassword | Confirm Password | Confirmar Senha | Confirmar Contraseña |
| agreeNotifications | I agree to receive email and phone notifications (like when I earn a commission) and other important notifications regarding the affiliate program. | Eu concordo em receber notificações por email e telefone (como quando eu ganho uma comissão) e outras notificações importantes sobre o programa de afiliados. | Acepto recibir notificaciones por correo electrónico y teléfono (como cuando gano una comisión) y otras notificaciones importantes sobre el programa de afiliados. |
| viewAffiliatePortal | View Affiliate Portal | Ver Portal de Afiliados | Ver Portal de Afiliados |

### Tela de mudança de senha
| Chave | EN | PT | ES |
|-------|-------|-------|-------|
| changePassword | Change Password | Alterar Senha | Cambiar Contraseña |
| setNewPasswordDescription | Please set a new password to continue | Por favor, defina uma nova senha para continuar | Por favor, establezca una nueva contraseña para continuar |
| passwordChangeRequired | Your account requires a password change before you can continue. | Sua conta requer uma alteração de senha antes de continuar. | Su cuenta requiere un cambio de contraseña antes de continuar. |
| newPassword | New Password | Nova Senha | Nueva Contraseña |
| confirmNewPassword | Confirm New Password | Confirmar Nova Senha | Confirmar Nueva Contraseña |
| updatePassword | Update Password | Atualizar Senha | Actualizar Contraseña |

### Mensagens de validação
| Chave | EN | PT | ES |
|-------|-------|-------|-------|
| companyNameRequired | Company name is required | Nome da empresa é obrigatório | El nombre de la empresa es obligatorio |
| phoneMinDigits | Phone must have at least 10 digits | Telefone deve ter pelo menos 10 dígitos | El teléfono debe tener al menos 10 dígitos |
| phoneMaxDigits | Phone must have at most 15 digits | Telefone deve ter no máximo 15 dígitos | El teléfono debe tener como máximo 15 dígitos |
| phoneOnlyNumbers | Phone must contain only numbers | Telefone deve conter apenas números | El teléfono debe contener solo números |
| passwordsDontMatch | Passwords don't match | As senhas não coincidem | Las contraseñas no coinciden |
| mustAgreeNotifications | You must agree to receive notifications | Você deve concordar em receber notificações | Debe aceptar recibir notificaciones |
| passwordMinChars | Password must be at least 8 characters | A senha deve ter pelo menos 8 caracteres | La contraseña debe tener al menos 8 caracteres |

---

## Alterações Necessárias

### 1. Arquivo: `src/i18n/translations.ts`

Adicionar novas chaves ao objeto `auth` em cada idioma:

**Inglês (EN):**
```typescript
auth: {
  // ... chaves existentes ...
  companyName: "Company Name",
  phoneNumber: "Phone Number",
  confirmPassword: "Confirm Password",
  agreeNotifications: "I agree to receive email and phone notifications (like when I earn a commission) and other important notifications regarding the affiliate program.",
  viewAffiliatePortal: "View Affiliate Portal",
  changePassword: "Change Password",
  setNewPasswordDescription: "Please set a new password to continue",
  passwordChangeRequired: "Your account requires a password change before you can continue.",
  newPassword: "New Password",
  confirmNewPassword: "Confirm New Password",
  updatePassword: "Update Password",
  companyNameRequired: "Company name is required",
  phoneMinDigits: "Phone must have at least 10 digits",
  phoneMaxDigits: "Phone must have at most 15 digits",
  phoneOnlyNumbers: "Phone must contain only numbers",
  passwordsDontMatch: "Passwords don't match",
  mustAgreeNotifications: "You must agree to receive notifications",
  passwordMinChars: "Password must be at least 8 characters",
}
```

**Português (PT):**
```typescript
auth: {
  // ... chaves existentes ...
  companyName: "Nome da Empresa",
  phoneNumber: "Número de Telefone",
  confirmPassword: "Confirmar Senha",
  agreeNotifications: "Eu concordo em receber notificações por email e telefone (como quando eu ganho uma comissão) e outras notificações importantes sobre o programa de afiliados.",
  viewAffiliatePortal: "Ver Portal de Afiliados",
  changePassword: "Alterar Senha",
  setNewPasswordDescription: "Por favor, defina uma nova senha para continuar",
  passwordChangeRequired: "Sua conta requer uma alteração de senha antes de continuar.",
  newPassword: "Nova Senha",
  confirmNewPassword: "Confirmar Nova Senha",
  updatePassword: "Atualizar Senha",
  companyNameRequired: "Nome da empresa é obrigatório",
  phoneMinDigits: "Telefone deve ter pelo menos 10 dígitos",
  phoneMaxDigits: "Telefone deve ter no máximo 15 dígitos",
  phoneOnlyNumbers: "Telefone deve conter apenas números",
  passwordsDontMatch: "As senhas não coincidem",
  mustAgreeNotifications: "Você deve concordar em receber notificações",
  passwordMinChars: "A senha deve ter pelo menos 8 caracteres",
}
```

**Espanhol (ES):**
```typescript
auth: {
  // ... chaves existentes ...
  companyName: "Nombre de la Empresa",
  phoneNumber: "Número de Teléfono",
  confirmPassword: "Confirmar Contraseña",
  agreeNotifications: "Acepto recibir notificaciones por correo electrónico y teléfono (como cuando gano una comisión) y otras notificaciones importantes sobre el programa de afiliados.",
  viewAffiliatePortal: "Ver Portal de Afiliados",
  changePassword: "Cambiar Contraseña",
  setNewPasswordDescription: "Por favor, establezca una nueva contraseña para continuar",
  passwordChangeRequired: "Su cuenta requiere un cambio de contraseña antes de continuar.",
  newPassword: "Nueva Contraseña",
  confirmNewPassword: "Confirmar Nueva Contraseña",
  updatePassword: "Actualizar Contraseña",
  companyNameRequired: "El nombre de la empresa es obligatorio",
  phoneMinDigits: "El teléfono debe tener al menos 10 dígitos",
  phoneMaxDigits: "El teléfono debe tener como máximo 15 dígitos",
  phoneOnlyNumbers: "El teléfono debe contener solo números",
  passwordsDontMatch: "Las contraseñas no coinciden",
  mustAgreeNotifications: "Debe aceptar recibir notificaciones",
  passwordMinChars: "La contraseña debe tener al menos 8 caracteres",
}
```

### 2. Arquivo: `src/pages/Auth.tsx`

Substituir todos os textos hardcoded pelas chaves de tradução:

**Labels do formulário:**
- `"Company Name"` → `{t.auth.companyName}`
- `"Phone Number"` → `{t.auth.phoneNumber}`
- `"Confirm Password"` → `{t.auth.confirmPassword}`
- `"I agree to receive..."` → `{t.auth.agreeNotifications}`
- `"Ver portal de Afiliados"` → `{t.auth.viewAffiliatePortal}`

**Tela de mudança de senha:**
- `"Change Password"` → `{t.auth.changePassword}`
- `"Please set a new password..."` → `{t.auth.setNewPasswordDescription}`
- `"Your account requires..."` → `{t.auth.passwordChangeRequired}`
- `"New Password"` → `{t.auth.newPassword}`
- `"Confirm New Password"` → `{t.auth.confirmNewPassword}`
- `"Update Password"` → `{t.auth.updatePassword}`

**Mensagens de validação no schema:**
- Usar `t.auth.companyNameRequired`, `t.auth.phoneMinDigits`, etc.

---

## Detalhes Técnicos

### Arquivos Modificados
1. `src/i18n/translations.ts` - Adicionar 17 novas chaves em cada idioma (51 traduções no total)
2. `src/pages/Auth.tsx` - Substituir textos hardcoded por referências ao sistema i18n

### Impacto
- Formulário de cadastro exibirá textos no idioma selecionado
- Tela de mudança de senha também será traduzida
- Mensagens de validação aparecerão no idioma correto
- Link "Ver Portal de Afiliados" será traduzido conforme idioma
