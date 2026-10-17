/**
 * REVA PHOENIX CALIBRATION — CLOUD INTEGRATION CONFIGURATION
 * Firebase Authentication & Supabase Database Configuration
 */
window.CLOUD_CONFIG = {
  // 1. Firebase Authentication & Hosting
  firebase: {
    apiKey: "AIzaSyCNaf3HRvpeBcx1HmdsL_B3hh0whhDJVEY",
    authDomain: "calibration-51865.firebaseapp.com",
    projectId: "calibration-51865",
    storageBucket: "calibration-51865.firebasestorage.app",
    messagingSenderId: "847594557988",
    appId: "1:847594557988:web:06c745f623a7b3c5de3eb1",
    measurementId: "G-GQNLSBBL32"
  },

  // 2. Supabase Primary Database
  supabase: {
    url: window.SUPABASE_URL || "https://orsngqczvrsrnpyhopds.supabase.co",
    anonKey: window.SUPABASE_ANON_KEY || "sb_publishable_qeWCyT23yxwdVL_A-z7PHg_mimf2Mqp"
  }
};
