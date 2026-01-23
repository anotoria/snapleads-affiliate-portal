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
  comingSoon: string;
  trackingAvailable: string;
  viewRates: string;
};

type PayoutsTranslations = {
  title: string;
  subtitle: string;
  management: string;
  comingSoon: string;
  systemAvailable: string;
  requestPayouts: string;
};

type SettingsTranslations = {
  title: string;
  subtitle: string;
  accountSettings: string;
  comingSoon: string;
  panelAvailable: string;
  updateProfile: string;
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
      comingSoon: "Coming soon in Phase 2",
      trackingAvailable: "Lead tracking will be available soon",
      viewRates: "View conversion rates, lead status, and more",
    },

    // Payouts Page
    payouts: {
      title: "Payouts",
      subtitle: "View your earnings and payout history.",
      management: "Payout Management",
      comingSoon: "Coming soon in Phase 2",
      systemAvailable: "Payout system will be available soon",
      requestPayouts: "Request payouts, view history, and set up payment methods",
    },

    // Settings Page
    settings: {
      title: "Settings",
      subtitle: "Manage your account preferences and settings.",
      accountSettings: "Account Settings",
      comingSoon: "Coming soon in Phase 2",
      panelAvailable: "Settings panel will be available soon",
      updateProfile: "Update profile, notifications, and security settings",
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
      comingSoon: "Em breve na Fase 2",
      trackingAvailable: "O rastreamento de leads estará disponível em breve",
      viewRates: "Veja taxas de conversão, status do lead e mais",
    },

    // Payouts Page
    payouts: {
      title: "Pagamentos",
      subtitle: "Veja seus ganhos e histórico de pagamentos.",
      management: "Gestão de Pagamentos",
      comingSoon: "Em breve na Fase 2",
      systemAvailable: "O sistema de pagamentos estará disponível em breve",
      requestPayouts: "Solicite pagamentos, veja histórico e configure métodos de pagamento",
    },

    // Settings Page
    settings: {
      title: "Configurações",
      subtitle: "Gerencie suas preferências e configurações de conta.",
      accountSettings: "Configurações da Conta",
      comingSoon: "Em breve na Fase 2",
      panelAvailable: "O painel de configurações estará disponível em breve",
      updateProfile: "Atualize perfil, notificações e configurações de segurança",
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
      comingSoon: "Próximamente en Fase 2",
      trackingAvailable: "El seguimiento de leads estará disponible pronto",
      viewRates: "Ver tasas de conversión, estado del lead y más",
    },

    // Payouts Page
    payouts: {
      title: "Pagos",
      subtitle: "Ve tus ganancias e historial de pagos.",
      management: "Gestión de Pagos",
      comingSoon: "Próximamente en Fase 2",
      systemAvailable: "El sistema de pagos estará disponible pronto",
      requestPayouts: "Solicita pagos, ve el historial y configura métodos de pago",
    },

    // Settings Page
    settings: {
      title: "Configuración",
      subtitle: "Gestiona tus preferencias y configuraciones de cuenta.",
      accountSettings: "Configuración de Cuenta",
      comingSoon: "Próximamente en Fase 2",
      panelAvailable: "El panel de configuración estará disponible pronto",
      updateProfile: "Actualiza perfil, notificaciones y configuraciones de seguridad",
    },
  },
} satisfies Record<Language, TranslationKeys>;
