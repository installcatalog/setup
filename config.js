const APP_CONFIG = {
  // Basic brand
  brandName: "Purple Fashion",
  shortName: "Purple",
  logoText: "Purple Fashion",
  tagline: "Premium fashion catalog",

  // Theme
  themeColor: "#7c3aed",
  accentColor: "#d4af37",
  backgroundColor: "#f6f2ff",
  textColor: "#101827",

  // API
  scriptApi: "https://script.google.com/macros/s/AKfycbxfmL8OXpraFy7mlx6ulfXIh6dToJJsxgdnNG8fSYGJVsNyqOuK81lj3X5oxIxR4MUj/exec",

  // Seller contact
  sellerWhatsApp: "919836697502",
  sellerCallNumber: "9836697502",
  sellerEmail: "",
  shopAddress: "",
  businessHours: "10 AM - 9 PM",

  // Product settings
  productIdPrefix: "CT",
  currencySymbol: "₹",
  defaultStock: "In Stock",
  defaultShow: "Yes",
  emptyImageUrl: "",

  // Categories
  categories: [
    "Saree",
    "Kurti",
    "Tops",
    "Palazzo",
    "Salwar",
    "Gown",
    "Nighty",
    "Western",
    "Kids",
    "Bedsheet",
    "Trendz"
  ],

  // Auto product text
  categoryText: {
    Saree: {
      names: [
        "Royal Silk Saree",
        "Elegant Cotton Saree",
        "Premium Designer Saree"
      ],
      short: [
        "Elegant saree for festive style",
        "Premium saree for graceful look"
      ],
      long: [
        "Elegant saree crafted for festive moments family functions and graceful traditional styling",
        "Premium saree designed for comfort elegance and beautiful ethnic fashion"
      ]
    },

    Kurti: {
      names: [
        "Stylish Cotton Kurti",
        "Premium Ethnic Kurti",
        "Modern Daily Kurti"
      ],
      short: [
        "Stylish kurti for daily comfort",
        "Premium kurti for ethnic style"
      ],
      long: [
        "Stylish kurti designed for daily comfort simple ethnic fashion and easy everyday styling",
        "Premium kurti made for casual outings family wear and graceful daily fashion"
      ]
    }
  },

  // WhatsApp messages
  whatsappMessages: {
    productEnquiry:
      "Hi I am interested in this product",
    availabilityRequest:
      "Please inform me when this product is available",
    contact:
      "Hi I want to know more about your products"
  },

  // Payment link for order message
  payment: {
    enabled: true,
    paymentText: "Pay here",
    paymentLink: "https://your-payment-link.com",
    qrImageUrl: ""
  },

  // Features on/off
  features: {
    favourite: true,
    analytics: true,
    installPrompt: true,
    lightLogin: true,
    growPage: true,
    uploadPage: true,
    adminPage: true
  },

  // Common UI behaviour
  ui: {
    preventTextSelection: true
  },

  // Login
  login: {
    requiredOnOpen: false,
    requiredForFavourite: true,
    requiredForWhatsApp: true,
    requiredForProductView: false,
    requiredForContact: true
  },

  // Admin/security
  admin: {
    pinEnabled: true,
    autoExitSeconds: 180,
    wrongPinLimit: 5,
    wrongPinBlockHours: 24
  },

  // Install app prompt
  installPrompt: {
    title: "Install App",
    message: "Shop faster from your home screen",
    laterText: "Later",
    installText: "Install"
  },

  // Grow page
  growPage: {
    title: "Want this catalog for your shop?",
    subtitle: "Get your own product catalog app with WhatsApp enquiry and seller analytics",
    contactWhatsApp: "919836697502"
  },

  // Backward-compatible old keys
  growContactWhatsApp: "919836697502",
  paymentOrContactText: "Contact seller on WhatsApp",

  // Sheet names
  sheets: {
    products: "Products",
    users: "Users",
    events: "UserEvents",
    productIdHistory: "ProductIdHistory",
    adminLogs: "AdminLogs"
  },

  // Data retention
  retention: {
    userEventsKeepDays: 15,
    adminLogsMaxRows: 200
  }
};
