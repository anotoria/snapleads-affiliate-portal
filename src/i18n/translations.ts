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
  // New sign-up fields
  companyName: string;
  phoneNumber: string;
  confirmPassword: string;
  agreeNotifications: string;
  viewAffiliatePortal: string;
  // Change password screen
  changePassword: string;
  setNewPasswordDescription: string;
  passwordChangeRequired: string;
  newPassword: string;
  confirmNewPassword: string;
  updatePassword: string;
  // Validation messages
  companyNameRequired: string;
  phoneMinDigits: string;
  phoneMaxDigits: string;
  phoneOnlyNumbers: string;
  passwordsDontMatch: string;
  mustAgreeNotifications: string;
  passwordMinChars: string;
};

type DashboardTranslations = {
  hello: string;
  welcomeMessage: string;
  totalEarnings: string;
  activeLeads: string;
  inactiveLeads: string;
  fromLastMonth: string;
  yourAffiliateLink: string;
  shareToEarn: string;
  earnCommission: string;
  linkCopied: string;
  linkCopiedDescription: string;
  copyFailed: string;
  copyFailedDescription: string;
  performanceOverview: string;
  leadsPerformance: string;
  earningsPerformance: string;
  activeEntries: string;
  inactiveExits: string;
  cumulativeEarnings: string;
  last30Days: string;
  earnings: string;
  leads: string;
  clicks: string;
  yourTier: string;
  nextTier: string;
  toNextTier: string;
  commission: string;
  // New dashboard translations
  activeClients: string;
  monthlyRevenue: string;
  currentCommission: string;
  partnerLevel: string;
  levelProgress: string;
  remaining: string;
  bonusMessage: string;
  bonusMessagePart2: string;
  bonusMessagePart3: string;
  maxLevelReached: string;
  partnerSummary: string;
  lastPayment: string;
  nextEstimatedPayment: string;
  partnerStatus: string;
  toReach: string;
  increase: string;
  commissionsLast6Months: string;
  partnerDashboard: string;
  dashboardSubtitle: string;
};

type NavTranslations = {
  dashboard: string;
  myLeads: string;
  payouts: string;
  settings: string;
  commissions: string;
  reports: string;
  documents: string;
  support: string;
  supportMaterials: string;
  admin: string;
  adminDashboard: string;
  adminUsers: string;
  adminTiers: string;
  adminPricing: string;
  adminSupport: string;
  adminAdmins: string;
  adminSACommissions: string;
  adminTracks: string;
  adminMedia: string;
};

type LeadsTranslations = {
  title: string;
  subtitle: string;
  management: string;
  searchPlaceholder: string;
  filterByStatus: string;
  allStatuses: string;
  pending: string;
  late_payment: string;
  active: string;
  inactive: string;
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
  rejected: string;
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
  companyInfo: string;
  companyName: string;
  cnpj: string;
  phone: string;
};

type CommissionsTranslations = {
  title: string;
  subtitle: string;
  tierLevels: string;
  history: string;
  simulator: string;
  simulatorDescription: string;
  monthlyRevenue: string;
  calculate: string;
  estimatedCommission: string;
  bonus: string;
  total: string;
  noCommissions: string;
  noCommissionsDescription: string;
  referenceMonth: string;
  clients: string;
  revenue: string;
  rate: string;
  value: string;
  status: string;
  paidAt: string;
};

type ReportsTranslations = {
  title: string;
  subtitle: string;
  monthlyReport: string;
  exportCsv: string;
  exportPdf: string;
  period: string;
  totalLeads: string;
  totalEarnings: string;
  conversionRate: string;
  performanceEvolution: string;
};

type DocumentsTranslations = {
  title: string;
  subtitle: string;
  contracts: string;
  reports: string;
  invoices: string;
  other: string;
  allDocuments: string;
  noDocuments: string;
  noDocumentsDescription: string;
  download: string;
  uploadedAt: string;
  fileSize: string;
};

type SupportTranslations = {
  title: string;
  subtitle: string;
  faq: string;
  newTicket: string;
  myTickets: string;
  subject: string;
  message: string;
  priority: string;
  category: string;
  low: string;
  medium: string;
  high: string;
  urgent: string;
  billing: string;
  technical: string;
  general: string;
  otherCategory: string;
  open: string;
  inProgress: string;
  waitingUser: string;
  resolved: string;
  closed: string;
  createTicket: string;
  noTickets: string;
  noTicketsDescription: string;
  sendMessage: string;
  ticketCreated: string;
  ticketCreatedDescription: string;
};

type AdminTranslations = {
  dashboard: string;
  totalAffiliates: string;
  activeAffiliates: string;
  inactiveAffiliates: string;
  totalLeads: string;
  pendingPayouts: string;
  totalPaid: string;
  openTickets: string;
  affiliatesByTier: string;
  users: string;
  usersSubtitle: string;
  search: string;
  activate: string;
  deactivate: string;
  resetPassword: string;
  deleteUser: string;
  editUser: string;
  viewDetails: string;
  tier: string;
  company: string;
  leadsCount: string;
  pendingAmount: string;
  lastLogin: string;
  actions: string;
  tiers: string;
  tiersSubtitle: string;
  addTier: string;
  editTier: string;
  tierName: string;
  displayName: string;
  minRevenue: string;
  maxRevenue: string;
  commissionPercentage: string;
  bonusAmount: string;
  color: string;
  sortOrder: string;
  pricing: string;
  pricingSubtitle: string;
  addPricing: string;
  editPricing: string;
  minAccess: string;
  maxAccess: string;
  monthlyPrice: string;
  supportManagement: string;
  supportManagementSubtitle: string;
  assignTo: string;
  resolve: string;
  closeTicket: string;
  admins: string;
  adminsSubtitle: string;
  addAdmin: string;
  removeAdmin: string;
  promoteToSuperAdmin: string;
  role: string;
  superAdmin: string;
  adminRole: string;
  confirmAction: string;
  confirmDeactivate: string;
  confirmDelete: string;
  confirmResetPassword: string;
  // SA Commissions
  saCommissions: string;
  saCommissionsSubtitle: string;
  commissionCeiling: string;
  basePlanValue: string;
  affiliateRate: string;
  saRate: string;
  totalSACommission: string;
  saSettings: string;
};

type TiersTranslations = {
  silver: string;
  gold: string;
  platinum: string;
  diamond: string;
  titanium: string;
  audaks: string;
};

type SupportMaterialsTranslations = {
  title: string;
  subtitle: string;
  tracks: string;
  media: string;
  photos: string;
  videos: string;
  files: string;
  // Tracks
  allTracks: string;
  featuredTracks: string;
  startTrack: string;
  continueTrack: string;
  completedTrack: string;
  progress: string;
  modules: string;
  contents: string;
  duration: string;
  markAsComplete: string;
  nextContent: string;
  previousContent: string;
  noTracks: string;
  noTracksDescription: string;
  videoContent: string;
  textContent: string;
  minutes: string;
  // Media
  mediaLibrary: string;
  downloadSelected: string;
  downloadAll: string;
  selectAll: string;
  clearSelection: string;
  noMediaFound: string;
  noMediaDescription: string;
  zoomIn: string;
  zoomOut: string;
  download: string;
  categories: string;
  noCategories: string;
  noCategoriesDescription: string;
  itemsCount: string;
  // Admin
  manageTracks: string;
  manageTracksSubtitle: string;
  addTrack: string;
  editTrack: string;
  manageModules: string;
  manageModulesSubtitle: string;
  addModule: string;
  editModule: string;
  manageContents: string;
  manageContentsSubtitle: string;
  addContent: string;
  editContent: string;
  contentType: string;
  videoUrl: string;
  textEditor: string;
  durationMinutes: string;
  featured: string;
  manageMediaCategories: string;
  manageMediaCategoriesSubtitle: string;
  addCategory: string;
  editCategory: string;
  categoryType: string;
  manageMediaItems: string;
  manageMediaItemsSubtitle: string;
  uploadMedia: string;
  bulkUpload: string;
  fileType: string;
  fileSize: string;
  downloadCount: string;
  coverUrl: string;
  thumbnailUrl: string;
  sortOrder: string;
  isActive: string;
  isFeatured: string;
};

type CommonTranslations = {
  affiliatePortal: string;
  adminMode: string;
  affiliateMode: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  confirm: string;
  back: string;
  next: string;
  previous: string;
  loading: string;
  error: string;
  success: string;
  noData: string;
  comingSoon: string;
};

export type TranslationKeys = {
  loading: string;
  copy: string;
  copied: string;
  signOut: string;
  common: CommonTranslations;
  auth: AuthTranslations;
  dashboard: DashboardTranslations;
  nav: NavTranslations;
  leads: LeadsTranslations;
  payouts: PayoutsTranslations;
  settings: SettingsTranslations;
  commissions: CommissionsTranslations;
  reports: ReportsTranslations;
  documents: DocumentsTranslations;
  support: SupportTranslations;
  admin: AdminTranslations;
  tiers: TiersTranslations;
  supportMaterials: SupportMaterialsTranslations;
};

export const translations = {
  en: {
    loading: "Loading...",
    copy: "Copy",
    copied: "Copied",
    signOut: "Sign out",
    
    common: {
      affiliatePortal: "Affiliate Program",
      adminMode: "Admin Mode",
      affiliateMode: "Affiliate Mode",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      previous: "Previous",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      noData: "No data available",
      comingSoon: "Coming Soon",
    },
    
    auth: {
      welcomeBack: "Welcome back",
      signInToContinue: "Sign in to continue to your affiliate dashboard",
      createAccount: "Become our partner",
      startEarning: "Start earning with SnapLeads today. Sign up today and receive up to 40% recurring commissions while your clients' accounts are active.",
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
      // New sign-up fields
      companyName: "Company Name",
      phoneNumber: "Phone Number",
      confirmPassword: "Confirm Password",
      agreeNotifications: "I agree to receive email and phone notifications (like when I earn a commission) and other important notifications regarding the affiliate program.",
      viewAffiliatePortal: "View Affiliate Portal",
      // Change password screen
      changePassword: "Change Password",
      setNewPasswordDescription: "Please set a new password to continue",
      passwordChangeRequired: "Your account requires a password change before you can continue.",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      updatePassword: "Update Password",
      // Validation messages
      companyNameRequired: "Company name is required",
      phoneMinDigits: "Phone must have at least 10 digits",
      phoneMaxDigits: "Phone must have at most 15 digits",
      phoneOnlyNumbers: "Phone must contain only numbers",
      passwordsDontMatch: "Passwords don't match",
      mustAgreeNotifications: "You must agree to receive notifications",
      passwordMinChars: "Password must be at least 8 characters",
    },

    dashboard: {
      hello: "Hello",
      welcomeMessage: "Here's what's happening with your affiliate account today.",
      totalEarnings: "Total Earnings",
      activeLeads: "Active Leads",
      inactiveLeads: "Inactive Leads",
      fromLastMonth: "from last month",
      yourAffiliateLink: "Your Affiliate Link",
      shareToEarn: "Share this link to earn commissions",
      earnCommission: "Earn up to 30% commission for every customer who signs up through your link.",
      linkCopied: "Link copied!",
      linkCopiedDescription: "Your affiliate link has been copied to clipboard.",
      copyFailed: "Failed to copy",
      copyFailedDescription: "Please try copying the link manually.",
      performanceOverview: "Performance Overview",
      leadsPerformance: "Leads Performance",
      earningsPerformance: "Earnings Performance",
      activeEntries: "Active (Entries)",
      inactiveExits: "Inactive (Exits)",
      cumulativeEarnings: "Cumulative Earnings",
      last30Days: "Last 30 days",
      earnings: "Earnings",
      leads: "Leads",
      clicks: "Clicks",
      yourTier: "Your Tier",
      nextTier: "Next Tier",
      toNextTier: "to reach next tier",
      commission: "commission",
      activeClients: "Active Clients",
      monthlyRevenue: "Monthly Revenue",
      currentCommission: "Current Commission",
      partnerLevel: "Partner Level",
      levelProgress: "Level Progress",
      remaining: "Remaining",
      bonusMessage: "When you reach",
      bonusMessagePart2: "you will receive a bonus of",
      bonusMessagePart3: "and your commission will increase to",
      maxLevelReached: "You are at the maximum level!",
      partnerSummary: "Partner Summary",
      lastPayment: "Last Payment",
      nextEstimatedPayment: "Next Estimated Payment",
      partnerStatus: "Partner Status",
      toReach: "to",
      increase: "increase",
      commissionsLast6Months: "Commissions (Last 6 months)",
      partnerDashboard: "Partner Dashboard",
      dashboardSubtitle: "Overview of your clients, commissions and performance.",
    },

    nav: {
      dashboard: "Dashboard",
      myLeads: "My Leads",
      payouts: "Payouts",
      settings: "Settings",
      commissions: "Commissions",
      reports: "Reports",
      documents: "Documents",
      support: "Support",
      supportMaterials: "Support Materials",
      admin: "Admin",
      adminDashboard: "Admin Dashboard",
      adminUsers: "Affiliates",
      adminTiers: "Tiers",
      adminPricing: "Pricing",
      adminSupport: "Support",
      adminAdmins: "Administrators",
      adminSACommissions: "SA Commissions",
      adminTracks: "Tracks",
      adminMedia: "Media",
    },

    leads: {
      title: "My Leads",
      subtitle: "Track and manage all your referred leads.",
      management: "Lead Management",
      searchPlaceholder: "Search by name or email...",
      filterByStatus: "Filter by status",
      allStatuses: "All Statuses",
      pending: "Pending",
      late_payment: "Late Payment",
      active: "Active",
      inactive: "Inactive",
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
      rejected: "Rejected",
      noPayouts: "No payouts yet",
      noPayoutsDescription: "Your payout history will appear here",
      minimumPayout: "Minimum payout: $50",
    },

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
      companyInfo: "Company Information",
      companyName: "Company Name",
      cnpj: "CNPJ",
      phone: "Phone",
    },

    commissions: {
      title: "Commissions",
      subtitle: "View your commission levels and history.",
      tierLevels: "Tier Levels",
      history: "Commission History",
      simulator: "Commission Simulator",
      simulatorDescription: "Calculate your estimated commission based on monthly revenue",
      monthlyRevenue: "Monthly Revenue",
      calculate: "Calculate",
      estimatedCommission: "Estimated Commission",
      bonus: "Bonus",
      total: "Total",
      noCommissions: "No commissions yet",
      noCommissionsDescription: "Your commission history will appear here",
      referenceMonth: "Reference Month",
      clients: "Clients",
      revenue: "Revenue",
      rate: "Rate",
      value: "Value",
      status: "Status",
      paidAt: "Paid At",
    },

    reports: {
      title: "Reports",
      subtitle: "View and export your performance reports.",
      monthlyReport: "Monthly Report",
      exportCsv: "Export CSV",
      exportPdf: "Export PDF",
      period: "Period",
      totalLeads: "Total Leads",
      totalEarnings: "Total Earnings",
      conversionRate: "Conversion Rate",
      performanceEvolution: "Performance Evolution",
    },

    documents: {
      title: "Documents",
      subtitle: "Access your contracts and documents.",
      contracts: "Contracts",
      reports: "Reports",
      invoices: "Invoices",
      other: "Other",
      allDocuments: "All Documents",
      noDocuments: "No documents",
      noDocumentsDescription: "Your documents will appear here when available",
      download: "Download",
      uploadedAt: "Uploaded at",
      fileSize: "File size",
    },

    support: {
      title: "Support",
      subtitle: "Get help and create support tickets.",
      faq: "FAQ",
      newTicket: "New Ticket",
      myTickets: "My Tickets",
      subject: "Subject",
      message: "Message",
      priority: "Priority",
      category: "Category",
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
      billing: "Billing",
      technical: "Technical",
      general: "General",
      otherCategory: "Other",
      open: "Open",
      inProgress: "In Progress",
      waitingUser: "Waiting Response",
      resolved: "Resolved",
      closed: "Closed",
      createTicket: "Create Ticket",
      noTickets: "No tickets",
      noTicketsDescription: "You haven't created any support tickets yet",
      sendMessage: "Send Message",
      ticketCreated: "Ticket created",
      ticketCreatedDescription: "Your support ticket has been created successfully.",
    },

    admin: {
      dashboard: "Admin Dashboard",
      totalAffiliates: "Total Affiliates",
      activeAffiliates: "Active Affiliates",
      inactiveAffiliates: "Inactive Affiliates",
      totalLeads: "Total Leads",
      pendingPayouts: "Pending Payouts",
      totalPaid: "Total Paid",
      openTickets: "Open Tickets",
      affiliatesByTier: "Affiliates by Tier",
      users: "Affiliate Management",
      usersSubtitle: "Manage all affiliates and their accounts.",
      search: "Search affiliates...",
      activate: "Activate",
      deactivate: "Deactivate",
      resetPassword: "Reset Password",
      deleteUser: "Delete User",
      editUser: "Edit User",
      viewDetails: "View Details",
      tier: "Tier",
      company: "Company",
      leadsCount: "Leads",
      pendingAmount: "Pending",
      lastLogin: "Last Login",
      actions: "Actions",
      tiers: "Tier Management",
      tiersSubtitle: "Configure partnership tier levels.",
      addTier: "Add Tier",
      editTier: "Edit Tier",
      tierName: "Tier Name",
      displayName: "Display Name",
      minRevenue: "Min Revenue",
      maxRevenue: "Max Revenue",
      commissionPercentage: "Commission %",
      bonusAmount: "Bonus Amount",
      color: "Color",
      sortOrder: "Sort Order",
      pricing: "Pricing Management",
      pricingSubtitle: "Configure access-based pricing tiers.",
      addPricing: "Add Pricing",
      editPricing: "Edit Pricing",
      minAccess: "Min Access",
      maxAccess: "Max Access",
      monthlyPrice: "Monthly Price",
      supportManagement: "Support Management",
      supportManagementSubtitle: "Manage all support tickets.",
      assignTo: "Assign To",
      resolve: "Resolve",
      closeTicket: "Close Ticket",
      admins: "Administrators",
      adminsSubtitle: "Manage administrator accounts.",
      addAdmin: "Add Admin",
      removeAdmin: "Remove Admin",
      promoteToSuperAdmin: "Promote to Super Admin",
      role: "Role",
      superAdmin: "Super Admin",
      adminRole: "Admin",
      confirmAction: "Confirm Action",
      confirmDeactivate: "Are you sure you want to deactivate this user?",
      confirmDelete: "Are you sure you want to delete this user? This action cannot be undone.",
      confirmResetPassword: "Are you sure you want to reset this user's password?",
      // SA Commissions
      saCommissions: "SA Commissions",
      saCommissionsSubtitle: "Super Administrator commission management",
      commissionCeiling: "Commission Ceiling",
      basePlanValue: "Base Plan Value",
      affiliateRate: "Affiliate Rate",
      saRate: "SA Rate",
      totalSACommission: "Total SA Commission",
      saSettings: "Settings",
    },

    tiers: {
      silver: "Silver",
      gold: "Gold",
      platinum: "Platinum",
      diamond: "Diamond",
      titanium: "Titanium",
      audaks: "Audaks",
    },

    supportMaterials: {
      title: "Support Materials",
      subtitle: "Learn and access exclusive resources to boost your results",
      tracks: "Learning Tracks",
      media: "Media",
      photos: "Photos",
      videos: "Videos",
      files: "Files",
      // Tracks
      allTracks: "All Tracks",
      featuredTracks: "Featured Tracks",
      startTrack: "Start Track",
      continueTrack: "Continue Track",
      completedTrack: "Completed Track",
      progress: "Progress",
      modules: "Modules",
      contents: "Contents",
      duration: "Duration",
      markAsComplete: "Mark as complete",
      nextContent: "Next Content",
      previousContent: "Previous Content",
      noTracks: "No tracks available",
      noTracksDescription: "Learning tracks will be available soon.",
      videoContent: "Video Content",
      textContent: "Text Content",
      minutes: "min",
      // Media
      mediaLibrary: "Media Library",
      downloadSelected: "Download Selected",
      downloadAll: "Download All",
      selectAll: "Select All",
      clearSelection: "Clear Selection",
      noMediaFound: "No media found",
      noMediaDescription: "No media items available in this category.",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      download: "Download",
      categories: "Categories",
      noCategories: "No categories available",
      noCategoriesDescription: "Media categories will be available soon.",
      itemsCount: "items",
      // Admin
      manageTracks: "Manage Tracks",
      manageTracksSubtitle: "Create and manage learning tracks",
      addTrack: "New Track",
      editTrack: "Edit Track",
      manageModules: "Manage Modules",
      manageModulesSubtitle: "Organize track modules",
      addModule: "New Module",
      editModule: "Edit Module",
      manageContents: "Manage Contents",
      manageContentsSubtitle: "Create and manage module contents",
      addContent: "New Content",
      editContent: "Edit Content",
      contentType: "Content Type",
      videoUrl: "Video URL",
      textEditor: "Text Editor",
      durationMinutes: "Duration (minutes)",
      featured: "Featured",
      manageMediaCategories: "Media Categories",
      manageMediaCategoriesSubtitle: "Organize your media by category",
      addCategory: "New Category",
      editCategory: "Edit Category",
      categoryType: "Category Type",
      manageMediaItems: "Media Items",
      manageMediaItemsSubtitle: "Manage media files",
      uploadMedia: "Upload Media",
      bulkUpload: "Bulk Upload",
      fileType: "File Type",
      fileSize: "File Size",
      downloadCount: "Download Count",
      coverUrl: "Cover URL",
      thumbnailUrl: "Thumbnail URL",
      sortOrder: "Sort Order",
      isActive: "Active",
      isFeatured: "Featured",
    },
  },

  pt: {
    loading: "Carregando...",
    copy: "Copiar",
    copied: "Copiado",
    signOut: "Sair",

    common: {
      affiliatePortal: "Programa de Afiliados",
      adminMode: "Modo Admin",
      affiliateMode: "Modo Afiliado",
      save: "Salvar",
      cancel: "Cancelar",
      delete: "Excluir",
      edit: "Editar",
      add: "Adicionar",
      confirm: "Confirmar",
      back: "Voltar",
      next: "Próximo",
      previous: "Anterior",
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      noData: "Nenhum dado disponível",
      comingSoon: "Em Breve",
    },

    auth: {
      welcomeBack: "Bem-vindo de volta",
      signInToContinue: "Entre para acessar seu painel de afiliado",
      createAccount: "Se torne nosso parceiro",
      startEarning: "Comece a ganhar com SnapLeads hoje. Cadastre-se hoje e receba até 40% de comissões recorrentes enquanto as contas de seus clientes estiverem ativas.",
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
      // New sign-up fields
      companyName: "Nome da Empresa",
      phoneNumber: "Número de Telefone",
      confirmPassword: "Confirmar Senha",
      agreeNotifications: "Eu concordo em receber notificações por email e telefone (como quando eu ganho uma comissão) e outras notificações importantes sobre o programa de afiliados.",
      viewAffiliatePortal: "Ver Portal de Afiliados",
      // Change password screen
      changePassword: "Alterar Senha",
      setNewPasswordDescription: "Por favor, defina uma nova senha para continuar",
      passwordChangeRequired: "Sua conta requer uma alteração de senha antes de continuar.",
      newPassword: "Nova Senha",
      confirmNewPassword: "Confirmar Nova Senha",
      updatePassword: "Atualizar Senha",
      // Validation messages
      companyNameRequired: "Nome da empresa é obrigatório",
      phoneMinDigits: "Telefone deve ter pelo menos 10 dígitos",
      phoneMaxDigits: "Telefone deve ter no máximo 15 dígitos",
      phoneOnlyNumbers: "Telefone deve conter apenas números",
      passwordsDontMatch: "As senhas não coincidem",
      mustAgreeNotifications: "Você deve concordar em receber notificações",
      passwordMinChars: "A senha deve ter pelo menos 8 caracteres",
    },

    dashboard: {
      hello: "Olá",
      welcomeMessage: "Veja o que está acontecendo com sua conta de afiliado hoje.",
      totalEarnings: "Ganhos Totais",
      activeLeads: "Leads Ativos",
      inactiveLeads: "Leads Inativos",
      fromLastMonth: "em relação ao mês passado",
      yourAffiliateLink: "Seu Link de Afiliado",
      shareToEarn: "Compartilhe este link para ganhar comissões",
      earnCommission: "Ganhe até 30% de comissão para cada cliente que se cadastrar através do seu link.",
      linkCopied: "Link copiado!",
      linkCopiedDescription: "Seu link de afiliado foi copiado para a área de transferência.",
      copyFailed: "Falha ao copiar",
      copyFailedDescription: "Por favor, tente copiar o link manualmente.",
      performanceOverview: "Visão de Performance",
      leadsPerformance: "Performance de Leads",
      earningsPerformance: "Performance de Ganhos",
      activeEntries: "Ativos (Entradas)",
      inactiveExits: "Inativos (Saídas)",
      cumulativeEarnings: "Ganhos Acumulados",
      last30Days: "Últimos 30 dias",
      earnings: "Ganhos",
      leads: "Leads",
      clicks: "Cliques",
      yourTier: "Seu Nível",
      nextTier: "Próximo Nível",
      toNextTier: "para alcançar o próximo nível",
      commission: "de comissão",
      activeClients: "Clientes Ativos",
      monthlyRevenue: "Faturamento Mensal",
      currentCommission: "Comissão Atual",
      partnerLevel: "Nível do Parceiro",
      levelProgress: "Progresso de Nível",
      remaining: "Falta",
      bonusMessage: "Ao atingir",
      bonusMessagePart2: "você receberá um bônus de",
      bonusMessagePart3: "e sua comissão aumentará para",
      maxLevelReached: "Você está no nível máximo!",
      partnerSummary: "Resumo do Parceiro",
      lastPayment: "Último Pagamento",
      nextEstimatedPayment: "Próximo Pagamento Estimado",
      partnerStatus: "Status do Parceiro",
      toReach: "para",
      increase: "aumento",
      commissionsLast6Months: "Comissões (Últimos 6 meses)",
      partnerDashboard: "Dashboard do Parceiro",
      dashboardSubtitle: "Visão geral dos seus clientes, comissões e performance.",
    },

    nav: {
      dashboard: "Painel",
      myLeads: "Meus Leads",
      payouts: "Pagamentos",
      settings: "Configurações",
      commissions: "Comissões",
      reports: "Relatórios",
      documents: "Documentos",
      support: "Suporte",
      supportMaterials: "Materiais de Apoio",
      admin: "Admin",
      adminDashboard: "Painel Admin",
      adminUsers: "Afiliados",
      adminTiers: "Níveis",
      adminPricing: "Precificação",
      adminSupport: "Suporte",
      adminAdmins: "Administradores",
      adminSACommissions: "Comissões SA",
      adminTracks: "Trilhas",
      adminMedia: "Mídias",
    },

    leads: {
      title: "Meus Leads",
      subtitle: "Acompanhe e gerencie todos os seus leads indicados.",
      management: "Gestão de Leads",
      searchPlaceholder: "Buscar por nome ou email...",
      filterByStatus: "Filtrar por status",
      allStatuses: "Todos os Status",
      pending: "Pendente",
      late_payment: "Pagamento Atrasado",
      active: "Ativo",
      inactive: "Inativo",
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
      rejected: "Rejeitado",
      noPayouts: "Nenhum pagamento ainda",
      noPayoutsDescription: "Seu histórico de pagamentos aparecerá aqui",
      minimumPayout: "Pagamento mínimo: R$50",
    },

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
      companyInfo: "Informações da Empresa",
      companyName: "Nome da Empresa",
      cnpj: "CNPJ",
      phone: "Telefone",
    },

    commissions: {
      title: "Comissões",
      subtitle: "Veja seus níveis e histórico de comissões.",
      tierLevels: "Níveis de Parceria",
      history: "Histórico de Comissões",
      simulator: "Simulador de Comissões",
      simulatorDescription: "Calcule sua comissão estimada baseada no faturamento mensal",
      monthlyRevenue: "Faturamento Mensal",
      calculate: "Calcular",
      estimatedCommission: "Comissão Estimada",
      bonus: "Bônus",
      total: "Total",
      noCommissions: "Nenhuma comissão ainda",
      noCommissionsDescription: "Seu histórico de comissões aparecerá aqui",
      referenceMonth: "Mês de Referência",
      clients: "Clientes",
      revenue: "Faturamento",
      rate: "Taxa",
      value: "Valor",
      status: "Status",
      paidAt: "Pago em",
    },

    reports: {
      title: "Relatórios",
      subtitle: "Veja e exporte seus relatórios de performance.",
      monthlyReport: "Relatório Mensal",
      exportCsv: "Exportar CSV",
      exportPdf: "Exportar PDF",
      period: "Período",
      totalLeads: "Total de Leads",
      totalEarnings: "Ganhos Totais",
      conversionRate: "Taxa de Conversão",
      performanceEvolution: "Evolução de Performance",
    },

    documents: {
      title: "Documentos",
      subtitle: "Acesse seus contratos e documentos.",
      contracts: "Contratos",
      reports: "Relatórios",
      invoices: "Notas Fiscais",
      other: "Outros",
      allDocuments: "Todos os Documentos",
      noDocuments: "Nenhum documento",
      noDocumentsDescription: "Seus documentos aparecerão aqui quando disponíveis",
      download: "Baixar",
      uploadedAt: "Enviado em",
      fileSize: "Tamanho",
    },

    support: {
      title: "Suporte",
      subtitle: "Obtenha ajuda e crie tickets de suporte.",
      faq: "Perguntas Frequentes",
      newTicket: "Novo Ticket",
      myTickets: "Meus Tickets",
      subject: "Assunto",
      message: "Mensagem",
      priority: "Prioridade",
      category: "Categoria",
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      urgent: "Urgente",
      billing: "Financeiro",
      technical: "Técnico",
      general: "Geral",
      otherCategory: "Outro",
      open: "Aberto",
      inProgress: "Em Andamento",
      waitingUser: "Aguardando Resposta",
      resolved: "Resolvido",
      closed: "Fechado",
      createTicket: "Criar Ticket",
      noTickets: "Nenhum ticket",
      noTicketsDescription: "Você ainda não criou nenhum ticket de suporte",
      sendMessage: "Enviar Mensagem",
      ticketCreated: "Ticket criado",
      ticketCreatedDescription: "Seu ticket de suporte foi criado com sucesso.",
    },

    admin: {
      dashboard: "Painel Administrativo",
      totalAffiliates: "Total de Afiliados",
      activeAffiliates: "Afiliados Ativos",
      inactiveAffiliates: "Afiliados Inativos",
      totalLeads: "Total de Leads",
      pendingPayouts: "Pagamentos Pendentes",
      totalPaid: "Total Pago",
      openTickets: "Tickets Abertos",
      affiliatesByTier: "Afiliados por Nível",
      users: "Gestão de Afiliados",
      usersSubtitle: "Gerencie todos os afiliados e suas contas.",
      search: "Buscar afiliados...",
      activate: "Ativar",
      deactivate: "Desativar",
      resetPassword: "Resetar Senha",
      deleteUser: "Excluir Usuário",
      editUser: "Editar Usuário",
      viewDetails: "Ver Detalhes",
      tier: "Nível",
      company: "Empresa",
      leadsCount: "Leads",
      pendingAmount: "Pendente",
      lastLogin: "Último Login",
      actions: "Ações",
      tiers: "Gestão de Níveis",
      tiersSubtitle: "Configure os níveis de parceria.",
      addTier: "Adicionar Nível",
      editTier: "Editar Nível",
      tierName: "Nome do Nível",
      displayName: "Nome de Exibição",
      minRevenue: "Faturamento Mínimo",
      maxRevenue: "Faturamento Máximo",
      commissionPercentage: "% Comissão",
      bonusAmount: "Valor do Bônus",
      color: "Cor",
      sortOrder: "Ordem",
      pricing: "Gestão de Precificação",
      pricingSubtitle: "Configure as faixas de preço por acessos.",
      addPricing: "Adicionar Faixa",
      editPricing: "Editar Faixa",
      minAccess: "Acessos Mínimos",
      maxAccess: "Acessos Máximos",
      monthlyPrice: "Preço Mensal",
      supportManagement: "Gestão de Suporte",
      supportManagementSubtitle: "Gerencie todos os tickets de suporte.",
      assignTo: "Atribuir a",
      resolve: "Resolver",
      closeTicket: "Fechar Ticket",
      admins: "Administradores",
      adminsSubtitle: "Gerencie as contas de administradores.",
      addAdmin: "Adicionar Admin",
      removeAdmin: "Remover Admin",
      promoteToSuperAdmin: "Promover a Super Admin",
      role: "Função",
      superAdmin: "Super Admin",
      adminRole: "Admin",
      confirmAction: "Confirmar Ação",
      confirmDeactivate: "Tem certeza que deseja desativar este usuário?",
      confirmDelete: "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.",
      confirmResetPassword: "Tem certeza que deseja resetar a senha deste usuário?",
      // SA Commissions
      saCommissions: "Comissões SA",
      saCommissionsSubtitle: "Gerenciamento de comissões do Super Administrador",
      commissionCeiling: "Teto de Comissão",
      basePlanValue: "Valor Base do Plano",
      affiliateRate: "% Afiliado",
      saRate: "% SA",
      totalSACommission: "Total Comissão SA",
      saSettings: "Configurações",
    },

    tiers: {
      silver: "Prata",
      gold: "Ouro",
      platinum: "Platina",
      diamond: "Diamante",
      titanium: "Titânio",
      audaks: "Audaks",
    },

    supportMaterials: {
      title: "Materiais de Apoio",
      subtitle: "Aprenda e tenha acesso a recursos exclusivos para impulsionar seus resultados",
      tracks: "Trilhas de Aprendizado",
      media: "Mídias",
      photos: "Fotos",
      videos: "Vídeos",
      files: "Arquivos",
      // Tracks
      allTracks: "Todas as Trilhas",
      featuredTracks: "Trilhas em Destaque",
      startTrack: "Iniciar Trilha",
      continueTrack: "Continuar Trilha",
      completedTrack: "Trilha Concluída",
      progress: "Progresso",
      modules: "Módulos",
      contents: "Conteúdos",
      duration: "Duração",
      markAsComplete: "Marcar como concluído",
      nextContent: "Próximo Conteúdo",
      previousContent: "Conteúdo Anterior",
      noTracks: "Nenhuma trilha disponível",
      noTracksDescription: "As trilhas de aprendizado estarão disponíveis em breve.",
      videoContent: "Conteúdo em Vídeo",
      textContent: "Conteúdo em Texto",
      minutes: "min",
      // Media
      mediaLibrary: "Biblioteca de Mídias",
      downloadSelected: "Baixar Selecionados",
      downloadAll: "Baixar Todos",
      selectAll: "Selecionar Todos",
      clearSelection: "Limpar Seleção",
      noMediaFound: "Nenhuma mídia encontrada",
      noMediaDescription: "Nenhum item de mídia disponível nesta categoria.",
      zoomIn: "Ampliar",
      zoomOut: "Reduzir",
      download: "Baixar",
      categories: "Categorias",
      noCategories: "Nenhuma categoria disponível",
      noCategoriesDescription: "As categorias de mídia estarão disponíveis em breve.",
      itemsCount: "itens",
      // Admin
      manageTracks: "Gerenciar Trilhas",
      manageTracksSubtitle: "Crie e gerencie trilhas de aprendizado",
      addTrack: "Nova Trilha",
      editTrack: "Editar Trilha",
      manageModules: "Gerenciar Módulos",
      manageModulesSubtitle: "Organize os módulos da trilha",
      addModule: "Novo Módulo",
      editModule: "Editar Módulo",
      manageContents: "Gerenciar Conteúdos",
      manageContentsSubtitle: "Crie e gerencie conteúdos dos módulos",
      addContent: "Novo Conteúdo",
      editContent: "Editar Conteúdo",
      contentType: "Tipo de Conteúdo",
      videoUrl: "URL do Vídeo",
      textEditor: "Editor de Texto",
      durationMinutes: "Duração (minutos)",
      featured: "Destaque",
      manageMediaCategories: "Categorias de Mídia",
      manageMediaCategoriesSubtitle: "Organize suas mídias por categoria",
      addCategory: "Nova Categoria",
      editCategory: "Editar Categoria",
      categoryType: "Tipo de Categoria",
      manageMediaItems: "Itens de Mídia",
      manageMediaItemsSubtitle: "Gerencie arquivos de mídia",
      uploadMedia: "Fazer Upload",
      bulkUpload: "Upload em Lote",
      fileType: "Tipo de Arquivo",
      fileSize: "Tamanho do Arquivo",
      downloadCount: "Downloads",
      coverUrl: "URL da Capa",
      thumbnailUrl: "URL da Miniatura",
      sortOrder: "Ordem",
      isActive: "Ativo",
      isFeatured: "Destaque",
    },
  },

  es: {
    loading: "Cargando...",
    copy: "Copiar",
    copied: "Copiado",
    signOut: "Cerrar sesión",

    common: {
      affiliatePortal: "Programa de Afiliados",
      adminMode: "Modo Admin",
      affiliateMode: "Modo Afiliado",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      add: "Agregar",
      confirm: "Confirmar",
      back: "Volver",
      next: "Siguiente",
      previous: "Anterior",
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      noData: "Sin datos disponibles",
      comingSoon: "Próximamente",
    },

    auth: {
      welcomeBack: "Bienvenido de nuevo",
      signInToContinue: "Inicia sesión para continuar a tu panel de afiliado",
      createAccount: "Conviértete en nuestro socio",
      startEarning: "Comienza a ganar con SnapLeads hoy. Regístrate hoy y recibe hasta 40% de comisiones recurrentes mientras las cuentas de tus clientes estén activas.",
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
      // New sign-up fields
      companyName: "Nombre de la Empresa",
      phoneNumber: "Número de Teléfono",
      confirmPassword: "Confirmar Contraseña",
      agreeNotifications: "Acepto recibir notificaciones por correo electrónico y teléfono (como cuando gano una comisión) y otras notificaciones importantes sobre el programa de afiliados.",
      viewAffiliatePortal: "Ver Portal de Afiliados",
      // Change password screen
      changePassword: "Cambiar Contraseña",
      setNewPasswordDescription: "Por favor, establezca una nueva contraseña para continuar",
      passwordChangeRequired: "Su cuenta requiere un cambio de contraseña antes de continuar.",
      newPassword: "Nueva Contraseña",
      confirmNewPassword: "Confirmar Nueva Contraseña",
      updatePassword: "Actualizar Contraseña",
      // Validation messages
      companyNameRequired: "El nombre de la empresa es obligatorio",
      phoneMinDigits: "El teléfono debe tener al menos 10 dígitos",
      phoneMaxDigits: "El teléfono debe tener como máximo 15 dígitos",
      phoneOnlyNumbers: "El teléfono debe contener solo números",
      passwordsDontMatch: "Las contraseñas no coinciden",
      mustAgreeNotifications: "Debe aceptar recibir notificaciones",
      passwordMinChars: "La contraseña debe tener al menos 8 caracteres",
    },

    dashboard: {
      hello: "Hola",
      welcomeMessage: "Esto es lo que está pasando con tu cuenta de afiliado hoy.",
      totalEarnings: "Ganancias Totales",
      activeLeads: "Leads Activos",
      inactiveLeads: "Leads Inactivos",
      fromLastMonth: "respecto al mes pasado",
      yourAffiliateLink: "Tu Enlace de Afiliado",
      shareToEarn: "Comparte este enlace para ganar comisiones",
      earnCommission: "Gana hasta 30% de comisión por cada cliente que se registre a través de tu enlace.",
      linkCopied: "¡Enlace copiado!",
      linkCopiedDescription: "Tu enlace de afiliado se ha copiado al portapapeles.",
      copyFailed: "Error al copiar",
      copyFailedDescription: "Por favor, intenta copiar el enlace manualmente.",
      performanceOverview: "Resumen de Rendimiento",
      leadsPerformance: "Rendimiento de Leads",
      earningsPerformance: "Rendimiento de Ganancias",
      activeEntries: "Activos (Entradas)",
      inactiveExits: "Inactivos (Salidas)",
      cumulativeEarnings: "Ganancias Acumuladas",
      last30Days: "Últimos 30 días",
      earnings: "Ganancias",
      leads: "Leads",
      clicks: "Clics",
      yourTier: "Tu Nivel",
      nextTier: "Próximo Nivel",
      toNextTier: "para alcanzar el próximo nivel",
      commission: "de comisión",
      activeClients: "Clientes Activos",
      monthlyRevenue: "Facturación Mensual",
      currentCommission: "Comisión Actual",
      partnerLevel: "Nivel del Socio",
      levelProgress: "Progreso de Nivel",
      remaining: "Falta",
      bonusMessage: "Al alcanzar",
      bonusMessagePart2: "recibirás un bono de",
      bonusMessagePart3: "y tu comisión aumentará a",
      maxLevelReached: "¡Estás en el nivel máximo!",
      partnerSummary: "Resumen del Socio",
      lastPayment: "Último Pago",
      nextEstimatedPayment: "Próximo Pago Estimado",
      partnerStatus: "Estado del Socio",
      toReach: "para",
      increase: "aumento",
      commissionsLast6Months: "Comisiones (Últimos 6 meses)",
      partnerDashboard: "Dashboard del Socio",
      dashboardSubtitle: "Visión general de tus clientes, comisiones y rendimiento.",
    },

    nav: {
      dashboard: "Panel",
      myLeads: "Mis Leads",
      payouts: "Pagos",
      settings: "Configuración",
      commissions: "Comisiones",
      reports: "Reportes",
      documents: "Documentos",
      support: "Soporte",
      supportMaterials: "Materiales de Apoyo",
      admin: "Admin",
      adminDashboard: "Panel Admin",
      adminUsers: "Afiliados",
      adminTiers: "Niveles",
      adminPricing: "Precios",
      adminSupport: "Soporte",
      adminAdmins: "Administradores",
      adminSACommissions: "Comisiones SA",
      adminTracks: "Tracks",
      adminMedia: "Medios",
    },

    leads: {
      title: "Mis Leads",
      subtitle: "Rastrea y gestiona todos tus leads referidos.",
      management: "Gestión de Leads",
      searchPlaceholder: "Buscar por nombre o email...",
      filterByStatus: "Filtrar por estado",
      allStatuses: "Todos los Estados",
      pending: "Pendiente",
      late_payment: "Pago Atrasado",
      active: "Activo",
      inactive: "Inactivo",
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
      rejected: "Rechazado",
      noPayouts: "Sin pagos aún",
      noPayoutsDescription: "Tu historial de pagos aparecerá aquí",
      minimumPayout: "Pago mínimo: $50",
    },

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
      companyInfo: "Información de la Empresa",
      companyName: "Nombre de la Empresa",
      cnpj: "CNPJ",
      phone: "Teléfono",
    },

    commissions: {
      title: "Comisiones",
      subtitle: "Ve tus niveles e historial de comisiones.",
      tierLevels: "Niveles de Asociación",
      history: "Historial de Comisiones",
      simulator: "Simulador de Comisiones",
      simulatorDescription: "Calcula tu comisión estimada basada en la facturación mensual",
      monthlyRevenue: "Facturación Mensual",
      calculate: "Calcular",
      estimatedCommission: "Comisión Estimada",
      bonus: "Bono",
      total: "Total",
      noCommissions: "Sin comisiones aún",
      noCommissionsDescription: "Tu historial de comisiones aparecerá aquí",
      referenceMonth: "Mes de Referencia",
      clients: "Clientes",
      revenue: "Facturación",
      rate: "Tasa",
      value: "Valor",
      status: "Estado",
      paidAt: "Pagado en",
    },

    reports: {
      title: "Reportes",
      subtitle: "Ve y exporta tus reportes de rendimiento.",
      monthlyReport: "Reporte Mensual",
      exportCsv: "Exportar CSV",
      exportPdf: "Exportar PDF",
      period: "Período",
      totalLeads: "Total de Leads",
      totalEarnings: "Ganancias Totales",
      conversionRate: "Tasa de Conversión",
      performanceEvolution: "Evolución del Rendimiento",
    },

    documents: {
      title: "Documentos",
      subtitle: "Accede a tus contratos y documentos.",
      contracts: "Contratos",
      reports: "Reportes",
      invoices: "Facturas",
      other: "Otros",
      allDocuments: "Todos los Documentos",
      noDocuments: "Sin documentos",
      noDocumentsDescription: "Tus documentos aparecerán aquí cuando estén disponibles",
      download: "Descargar",
      uploadedAt: "Subido el",
      fileSize: "Tamaño",
    },

    support: {
      title: "Soporte",
      subtitle: "Obtén ayuda y crea tickets de soporte.",
      faq: "Preguntas Frecuentes",
      newTicket: "Nuevo Ticket",
      myTickets: "Mis Tickets",
      subject: "Asunto",
      message: "Mensaje",
      priority: "Prioridad",
      category: "Categoría",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente",
      billing: "Facturación",
      technical: "Técnico",
      general: "General",
      otherCategory: "Otro",
      open: "Abierto",
      inProgress: "En Progreso",
      waitingUser: "Esperando Respuesta",
      resolved: "Resuelto",
      closed: "Cerrado",
      createTicket: "Crear Ticket",
      noTickets: "Sin tickets",
      noTicketsDescription: "Aún no has creado ningún ticket de soporte",
      sendMessage: "Enviar Mensaje",
      ticketCreated: "Ticket creado",
      ticketCreatedDescription: "Tu ticket de soporte ha sido creado exitosamente.",
    },

    admin: {
      dashboard: "Panel Administrativo",
      totalAffiliates: "Total de Afiliados",
      activeAffiliates: "Afiliados Activos",
      inactiveAffiliates: "Afiliados Inactivos",
      totalLeads: "Total de Leads",
      pendingPayouts: "Pagos Pendientes",
      totalPaid: "Total Pagado",
      openTickets: "Tickets Abiertos",
      affiliatesByTier: "Afiliados por Nivel",
      users: "Gestión de Afiliados",
      usersSubtitle: "Gestiona todos los afiliados y sus cuentas.",
      search: "Buscar afiliados...",
      activate: "Activar",
      deactivate: "Desactivar",
      resetPassword: "Restablecer Contraseña",
      deleteUser: "Eliminar Usuario",
      editUser: "Editar Usuario",
      viewDetails: "Ver Detalles",
      tier: "Nivel",
      company: "Empresa",
      leadsCount: "Leads",
      pendingAmount: "Pendiente",
      lastLogin: "Último Acceso",
      actions: "Acciones",
      tiers: "Gestión de Niveles",
      tiersSubtitle: "Configura los niveles de asociación.",
      addTier: "Agregar Nivel",
      editTier: "Editar Nivel",
      tierName: "Nombre del Nivel",
      displayName: "Nombre de Exhibición",
      minRevenue: "Facturación Mínima",
      maxRevenue: "Facturación Máxima",
      commissionPercentage: "% Comisión",
      bonusAmount: "Monto del Bono",
      color: "Color",
      sortOrder: "Orden",
      pricing: "Gestión de Precios",
      pricingSubtitle: "Configura las franjas de precio por accesos.",
      addPricing: "Agregar Franja",
      editPricing: "Editar Franja",
      minAccess: "Accesos Mínimos",
      maxAccess: "Accesos Máximos",
      monthlyPrice: "Precio Mensual",
      supportManagement: "Gestión de Soporte",
      supportManagementSubtitle: "Gestiona todos los tickets de soporte.",
      assignTo: "Asignar a",
      resolve: "Resolver",
      closeTicket: "Cerrar Ticket",
      admins: "Administradores",
      adminsSubtitle: "Gestiona las cuentas de administradores.",
      addAdmin: "Agregar Admin",
      removeAdmin: "Remover Admin",
      promoteToSuperAdmin: "Promover a Super Admin",
      role: "Rol",
      superAdmin: "Super Admin",
      adminRole: "Admin",
      confirmAction: "Confirmar Acción",
      confirmDeactivate: "¿Estás seguro de que deseas desactivar este usuario?",
      confirmDelete: "¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.",
      confirmResetPassword: "¿Estás seguro de que deseas restablecer la contraseña de este usuario?",
      // SA Commissions
      saCommissions: "Comisiones SA",
      saCommissionsSubtitle: "Gestión de comisiones del Super Administrador",
      commissionCeiling: "Techo de Comisión",
      basePlanValue: "Valor Base del Plan",
      affiliateRate: "% Afiliado",
      saRate: "% SA",
      totalSACommission: "Total Comisión SA",
      saSettings: "Configuraciones",
    },

    tiers: {
      silver: "Plata",
      gold: "Oro",
      platinum: "Platino",
      diamond: "Diamante",
      titanium: "Titanio",
      audaks: "Audaks",
    },

    supportMaterials: {
      title: "Materiales de Apoyo",
      subtitle: "Aprende y accede a recursos exclusivos para impulsar tus resultados",
      tracks: "Rutas de Aprendizaje",
      media: "Medios",
      photos: "Fotos",
      videos: "Videos",
      files: "Archivos",
      // Tracks
      allTracks: "Todas las Rutas",
      featuredTracks: "Rutas Destacadas",
      startTrack: "Iniciar Ruta",
      continueTrack: "Continuar Ruta",
      completedTrack: "Ruta Completada",
      progress: "Progreso",
      modules: "Módulos",
      contents: "Contenidos",
      duration: "Duración",
      markAsComplete: "Marcar como completado",
      nextContent: "Siguiente Contenido",
      previousContent: "Contenido Anterior",
      noTracks: "Sin rutas disponibles",
      noTracksDescription: "Las rutas de aprendizaje estarán disponibles pronto.",
      videoContent: "Contenido en Video",
      textContent: "Contenido en Texto",
      minutes: "min",
      // Media
      mediaLibrary: "Biblioteca de Medios",
      downloadSelected: "Descargar Seleccionados",
      downloadAll: "Descargar Todos",
      selectAll: "Seleccionar Todos",
      clearSelection: "Limpiar Selección",
      noMediaFound: "Sin medios encontrados",
      noMediaDescription: "No hay elementos de media disponibles en esta categoría.",
      zoomIn: "Ampliar",
      zoomOut: "Reducir",
      download: "Descargar",
      categories: "Categorías",
      noCategories: "Sin categorías disponibles",
      noCategoriesDescription: "Las categorías de medios estarán disponibles pronto.",
      itemsCount: "elementos",
      // Admin
      manageTracks: "Gestionar Rutas",
      manageTracksSubtitle: "Crea y gestiona rutas de aprendizaje",
      addTrack: "Nueva Ruta",
      editTrack: "Editar Ruta",
      manageModules: "Gestionar Módulos",
      manageModulesSubtitle: "Organiza los módulos de la ruta",
      addModule: "Nuevo Módulo",
      editModule: "Editar Módulo",
      manageContents: "Gestionar Contenidos",
      manageContentsSubtitle: "Crea y gestiona contenidos de los módulos",
      addContent: "Nuevo Contenido",
      editContent: "Editar Contenido",
      contentType: "Tipo de Contenido",
      videoUrl: "URL del Video",
      textEditor: "Editor de Texto",
      durationMinutes: "Duración (minutos)",
      featured: "Destacado",
      manageMediaCategories: "Categorías de Medios",
      manageMediaCategoriesSubtitle: "Organiza tus medios por categoría",
      addCategory: "Nueva Categoría",
      editCategory: "Editar Categoría",
      categoryType: "Tipo de Categoría",
      manageMediaItems: "Elementos de Medios",
      manageMediaItemsSubtitle: "Gestiona archivos de medios",
      uploadMedia: "Subir Medio",
      bulkUpload: "Subida Masiva",
      fileType: "Tipo de Archivo",
      fileSize: "Tamaño del Archivo",
      downloadCount: "Descargas",
      coverUrl: "URL de Portada",
      thumbnailUrl: "URL de Miniatura",
      sortOrder: "Orden",
      isActive: "Activo",
      isFeatured: "Destacado",
    },
  },
} satisfies Record<Language, TranslationKeys>;
