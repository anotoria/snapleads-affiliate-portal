export type Language = "en" | "pt" | "es";

// Define the structure type based on nested objects
type AuthTranslations = {
  welcomeBack: string;
  signInToContinue: string;
  createAccount: string;
  startEarning: string;
  email: string;
  password: string;
  fullName: string;
  signIn: string;
  signUp: string;
  forgotPassword: string;
  noAccount: string;
  hasAccount: string;
  resetPassword: string;
  resetPasswordDescription: string;
  sendResetLink: string;
  cancel: string;
};

type DashboardTranslations = {
  hello: string;
  welcomeMessage: string;
  totalEarnings: string;
  activeLeads: string;
  clickCount: string;
  fromLastMonth: string;
  yourAffiliateLink: string;
  shareToEarn: string;
  earnCommission: string;
  linkCopied: string;
  linkCopiedDescription: string;
  copyFailed: string;
  copyFailedDescription: string;
  performanceOverview: string;
  last30Days: string;
  earnings: string;
  leads: string;
  clicks: string;
};

type NavTranslations = {
  dashboard: string;
  myLeads: string;
  payouts: string;
  settings: string;
};

type LeadsTranslations = {
  title: string;
  subtitle: string;
  management: string;
  searchPlaceholder: string;
  filterByStatus: string;
  allStatuses: string;
  pending: string;
  converted: string;
  expired: string;
  name: string;
  email: string;
  status: string;
  date: string;
  commission: string;
  noLeads: string;
  noLeadsDescription: string;
  total: string;
  page: string;
  of: string;
};

type PayoutsTranslations = {
  title: string;
  subtitle: string;
  availableBalance: string;
  pendingPayouts: string;
  totalPaid: string;
  requestPayout: string;
  payoutHistory: string;
  date: string;
  amount: string;
  status: string;
  method: string;
  pending: string;
  completed: string;
  processing: string;
  noPayouts: string;
  noPayoutsDescription: string;
  minimumPayout: string;
};

type SettingsTranslations = {
  title: string;
  subtitle: string;
  profileSettings: string;
  profileDescription: string;
  fullName: string;
  email: string;
  affiliateCode: string;
  saveChanges: string;
  saving: string;
  changeAvatar: string;
  uploadPhoto: string;
  notificationSettings: string;
  notificationDescription: string;
  emailNotifications: string;
  emailNotificationsDescription: string;
  leadAlerts: string;
  leadAlertsDescription: string;
  payoutNotifications: string;
  payoutNotificationsDescription: string;
  profileUpdated: string;
  profileUpdatedDescription: string;
  updateFailed: string;
  updateFailedDescription: string;
};

export type TranslationKeys = {
  loading: string;
  copy: string;
  copied: string;
  signOut: string;
  auth: AuthTranslations;
  dashboard: DashboardTranslations;
  nav: NavTranslations;
  leads: LeadsTranslations;
  payouts: PayoutsTranslations;
  settings: SettingsTranslations;
};

export const translations = {
  en: {
    // Common
    loading: "Loading...",
    copy: "Copy",
    copied: "Copied",
    signOut: "Sign out",
    
    // Auth Page
    auth: {
      welcomeBack: "Welcome back",
      signInToContinue: "Sign in to continue to your affiliate dashboard",
      createAccount: "Create your account",
      startEarning: "Start earning with SnapLeads today",
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      signIn: "Sign In",
      signUp: "Sign Up",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      resetPassword: "Reset Password",
      resetPasswordDescription: "Enter your email and we'll send you a reset link",
      sendResetLink: "Send Reset Link",
      cancel: "Cancel",
    },

    // Dashboard
    dashboard: {
      hello: "Hello",
      welcomeMessage: "Here's what's happening with your affiliate account today.",
      totalEarnings: "Total Earnings",
      activeLeads: "Active Leads",
      clickCount: "Click Count",
      fromLastMonth: "from last month",
      yourAffiliateLink: "Your Affiliate Link",
      shareToEarn: "Share this link to earn commissions",
      earnCommission: "Earn up to 30% commission for every customer who signs up through your link.",
      linkCopied: "Link copied!",
      linkCopiedDescription: "Your affiliate link has been copied to clipboard.",
      copyFailed: "Failed to copy",
      copyFailedDescription: "Please try copying the link manually.",
      performanceOverview: "Performance Overview",
      last30Days: "Last 30 days",
      earnings: "Earnings",
      leads: "Leads",
      clicks: "Clicks",
    },

    // Navigation
    nav: {
      dashboard: "Dashboard",
      myLeads: "My Leads",
      payouts: "Payouts",
      settings: "Settings",
    },

    // Leads Page
    leads: {
      title: "My Leads",
      subtitle: "Track and manage all your referred leads.",
      management: "Lead Management",
      searchPlaceholder: "Search by name or email...",
      filterByStatus: "Filter by status",
      allStatuses: "All Statuses",
      pending: "Overdue",
      converted: "Active",
      expired: "Inactive",
      name: "Name",
      email: "Email",
      status: "Status",
      date: "Date",
      commission: "Commission",
      noLeads: "No leads yet",
      noLeadsDescription: "Start sharing your affiliate link to get leads",
      total: "Total",
      page: "Page",
      of: "of",
    },

    // Payouts Page
    payouts: {
      title: "Payouts",
      subtitle: "View your earnings and payout history.",
      availableBalance: "Available Balance",
      pendingPayouts: "Pending Payouts",
      totalPaid: "Total Paid",
      requestPayout: "Request Payout",
      payoutHistory: "Payout History",
      date: "Date",
      amount: "Amount",
      status: "Status",
      method: "Method",
      pending: "Pending",
      completed: "Completed",
      processing: "Processing",
      noPayouts: "No payouts yet",
      noPayoutsDescription: "Your payout history will appear here",
      minimumPayout: "Minimum payout: $50",
    },

    // Settings Page
    settings: {
      title: "Settings",
      subtitle: "Manage your account preferences and settings.",
      profileSettings: "Profile Settings",
      profileDescription: "Update your personal information",
      fullName: "Full Name",
      email: "Email",
      affiliateCode: "Affiliate Code",
      saveChanges: "Save Changes",
      saving: "Saving...",
      changeAvatar: "Change Avatar",
      uploadPhoto: "Upload Photo",
      notificationSettings: "Notification Settings",
      notificationDescription: "Configure how you receive notifications",
      emailNotifications: "Email Notifications",
      emailNotificationsDescription: "Receive email updates about your account",
      leadAlerts: "Lead Alerts",
      leadAlertsDescription: "Get notified when you get a new lead",
      payoutNotifications: "Payout Notifications",
      payoutNotificationsDescription: "Receive updates about your payouts",
      profileUpdated: "Profile updated",
      profileUpdatedDescription: "Your profile has been updated successfully.",
      updateFailed: "Update failed",
      updateFailedDescription: "Failed to update profile. Please try again.",
    },
  },

  pt: {
    // Common
    loading: "Carregando...",
    copy: "Copiar",
    copied: "Copiado",
    signOut: "Sair",

    // Auth Page
    auth: {
      welcomeBack: "Bem-vindo de volta",
      signInToContinue: "Entre para acessar seu painel de afiliado",
      createAccount: "Crie sua conta",
      startEarning: "Comece a ganhar com SnapLeads hoje",
      email: "Email",
      password: "Senha",
      fullName: "Nome Completo",
      signIn: "Entrar",
      signUp: "Cadastrar",
      forgotPassword: "Esqueceu a senha?",
      noAccount: "Não tem uma conta?",
      hasAccount: "Já tem uma conta?",
      resetPassword: "Redefinir Senha",
      resetPasswordDescription: "Digite seu email e enviaremos um link de redefinição",
      sendResetLink: "Enviar Link",
      cancel: "Cancelar",
    },

    // Dashboard
    dashboard: {
      hello: "Olá",
      welcomeMessage: "Veja o que está acontecendo com sua conta de afiliado hoje.",
      totalEarnings: "Ganhos Totais",
      activeLeads: "Leads Ativos",
      clickCount: "Total de Cliques",
      fromLastMonth: "em relação ao mês passado",
      yourAffiliateLink: "Seu Link de Afiliado",
      shareToEarn: "Compartilhe este link para ganhar comissões",
      earnCommission: "Ganhe até 30% de comissão para cada cliente que se cadastrar através do seu link.",
      linkCopied: "Link copiado!",
      linkCopiedDescription: "Seu link de afiliado foi copiado para a área de transferência.",
      copyFailed: "Falha ao copiar",
      copyFailedDescription: "Por favor, tente copiar o link manualmente.",
      performanceOverview: "Visão de Performance",
      last30Days: "Últimos 30 dias",
      earnings: "Ganhos",
      leads: "Leads",
      clicks: "Cliques",
    },

    // Navigation
    nav: {
      dashboard: "Painel",
      myLeads: "Meus Leads",
      payouts: "Pagamentos",
      settings: "Configurações",
    },

    // Leads Page
    leads: {
      title: "Meus Leads",
      subtitle: "Acompanhe e gerencie todos os seus leads indicados.",
      management: "Gestão de Leads",
      searchPlaceholder: "Buscar por nome ou email...",
      filterByStatus: "Filtrar por status",
      allStatuses: "Todos os Status",
      pending: "Em Atraso",
      converted: "Ativo",
      expired: "Inativo",
      name: "Nome",
      email: "Email",
      status: "Status",
      date: "Data",
      commission: "Comissão",
      noLeads: "Nenhum lead ainda",
      noLeadsDescription: "Comece a compartilhar seu link de afiliado para obter leads",
      total: "Total",
      page: "Página",
      of: "de",
    },

    // Payouts Page
    payouts: {
      title: "Pagamentos",
      subtitle: "Veja seus ganhos e histórico de pagamentos.",
      availableBalance: "Saldo Disponível",
      pendingPayouts: "Pagamentos Pendentes",
      totalPaid: "Total Pago",
      requestPayout: "Solicitar Pagamento",
      payoutHistory: "Histórico de Pagamentos",
      date: "Data",
      amount: "Valor",
      status: "Status",
      method: "Método",
      pending: "Pendente",
      completed: "Concluído",
      processing: "Processando",
      noPayouts: "Nenhum pagamento ainda",
      noPayoutsDescription: "Seu histórico de pagamentos aparecerá aqui",
      minimumPayout: "Pagamento mínimo: $50",
    },

    // Settings Page
    settings: {
      title: "Configurações",
      subtitle: "Gerencie suas preferências e configurações de conta.",
      profileSettings: "Configurações de Perfil",
      profileDescription: "Atualize suas informações pessoais",
      fullName: "Nome Completo",
      email: "Email",
      affiliateCode: "Código de Afiliado",
      saveChanges: "Salvar Alterações",
      saving: "Salvando...",
      changeAvatar: "Alterar Avatar",
      uploadPhoto: "Carregar Foto",
      notificationSettings: "Configurações de Notificação",
      notificationDescription: "Configure como você recebe notificações",
      emailNotifications: "Notificações por Email",
      emailNotificationsDescription: "Receba atualizações por email sobre sua conta",
      leadAlerts: "Alertas de Leads",
      leadAlertsDescription: "Seja notificado quando receber um novo lead",
      payoutNotifications: "Notificações de Pagamento",
      payoutNotificationsDescription: "Receba atualizações sobre seus pagamentos",
      profileUpdated: "Perfil atualizado",
      profileUpdatedDescription: "Seu perfil foi atualizado com sucesso.",
      updateFailed: "Falha na atualização",
      updateFailedDescription: "Falha ao atualizar perfil. Por favor, tente novamente.",
    },
  },

  es: {
    // Common
    loading: "Cargando...",
    copy: "Copiar",
    copied: "Copiado",
    signOut: "Cerrar sesión",

    // Auth Page
    auth: {
      welcomeBack: "Bienvenido de nuevo",
      signInToContinue: "Inicia sesión para continuar a tu panel de afiliado",
      createAccount: "Crea tu cuenta",
      startEarning: "Comienza a ganar con SnapLeads hoy",
      email: "Correo electrónico",
      password: "Contraseña",
      fullName: "Nombre Completo",
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes una cuenta?",
      hasAccount: "¿Ya tienes una cuenta?",
      resetPassword: "Restablecer Contraseña",
      resetPasswordDescription: "Ingresa tu correo y te enviaremos un enlace de restablecimiento",
      sendResetLink: "Enviar Enlace",
      cancel: "Cancelar",
    },

    // Dashboard
    dashboard: {
      hello: "Hola",
      welcomeMessage: "Esto es lo que está pasando con tu cuenta de afiliado hoy.",
      totalEarnings: "Ganancias Totales",
      activeLeads: "Leads Activos",
      clickCount: "Total de Clics",
      fromLastMonth: "respecto al mes pasado",
      yourAffiliateLink: "Tu Enlace de Afiliado",
      shareToEarn: "Comparte este enlace para ganar comisiones",
      earnCommission: "Gana hasta 30% de comisión por cada cliente que se registre a través de tu enlace.",
      linkCopied: "¡Enlace copiado!",
      linkCopiedDescription: "Tu enlace de afiliado se ha copiado al portapapeles.",
      copyFailed: "Error al copiar",
      copyFailedDescription: "Por favor, intenta copiar el enlace manualmente.",
      performanceOverview: "Resumen de Rendimiento",
      last30Days: "Últimos 30 días",
      earnings: "Ganancias",
      leads: "Leads",
      clicks: "Clics",
    },

    // Navigation
    nav: {
      dashboard: "Panel",
      myLeads: "Mis Leads",
      payouts: "Pagos",
      settings: "Configuración",
    },

    // Leads Page
    leads: {
      title: "Mis Leads",
      subtitle: "Rastrea y gestiona todos tus leads referidos.",
      management: "Gestión de Leads",
      searchPlaceholder: "Buscar por nombre o email...",
      filterByStatus: "Filtrar por estado",
      allStatuses: "Todos los Estados",
      pending: "Atrasado",
      converted: "Activo",
      expired: "Inactivo",
      name: "Nombre",
      email: "Email",
      status: "Estado",
      date: "Fecha",
      commission: "Comisión",
      noLeads: "Sin leads aún",
      noLeadsDescription: "Comienza a compartir tu enlace de afiliado para obtener leads",
      total: "Total",
      page: "Página",
      of: "de",
    },

    // Payouts Page
    payouts: {
      title: "Pagos",
      subtitle: "Ve tus ganancias e historial de pagos.",
      availableBalance: "Saldo Disponible",
      pendingPayouts: "Pagos Pendientes",
      totalPaid: "Total Pagado",
      requestPayout: "Solicitar Pago",
      payoutHistory: "Historial de Pagos",
      date: "Fecha",
      amount: "Monto",
      status: "Estado",
      method: "Método",
      pending: "Pendiente",
      completed: "Completado",
      processing: "Procesando",
      noPayouts: "Sin pagos aún",
      noPayoutsDescription: "Tu historial de pagos aparecerá aquí",
      minimumPayout: "Pago mínimo: $50",
    },

    // Settings Page
    settings: {
      title: "Configuración",
      subtitle: "Gestiona tus preferencias y configuraciones de cuenta.",
      profileSettings: "Configuración de Perfil",
      profileDescription: "Actualiza tu información personal",
      fullName: "Nombre Completo",
      email: "Email",
      affiliateCode: "Código de Afiliado",
      saveChanges: "Guardar Cambios",
      saving: "Guardando...",
      changeAvatar: "Cambiar Avatar",
      uploadPhoto: "Subir Foto",
      notificationSettings: "Configuración de Notificaciones",
      notificationDescription: "Configura cómo recibes notificaciones",
      emailNotifications: "Notificaciones por Email",
      emailNotificationsDescription: "Recibe actualizaciones por email sobre tu cuenta",
      leadAlerts: "Alertas de Leads",
      leadAlertsDescription: "Recibe notificaciones cuando obtengas un nuevo lead",
      payoutNotifications: "Notificaciones de Pago",
      payoutNotificationsDescription: "Recibe actualizaciones sobre tus pagos",
      profileUpdated: "Perfil actualizado",
      profileUpdatedDescription: "Tu perfil se ha actualizado correctamente.",
      updateFailed: "Error al actualizar",
      updateFailedDescription: "Error al actualizar perfil. Por favor, intenta de nuevo.",
    },
  },
} satisfies Record<Language, TranslationKeys>;
