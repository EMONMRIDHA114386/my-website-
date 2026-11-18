
/* =========================================
   MY BROWSER - ACCOUNT SYSTEM
   Supabase Authentication & Database
========================================= */

(function () {
  "use strict";

  const URL = window.SUPABASE_URL;
  const KEY = window.SUPABASE_PUBLISHABLE_KEY;

  if (!URL || !KEY || !window.supabase) {
    console.error("Supabase configuration missing.");
    return;
  }

  const sb = window.supabase.createClient(URL, KEY);

  let currentUser = null;
  let currentProfile = null;
  let currentSettings = {};

  /* =====================================
     CREATE ACCOUNT BUTTON
  ===================================== */

  const accountButton = document.createElement("button");

  accountButton.id = "myAccountButton";
  accountButton.textContent = "👤 Account";

  accountButton.style.cssText = `
    position:fixed;
    top:75px;
    right:12px;
    z-index:9990;
    padding:11px 16px;
    border:1px solid #65e6c2;
    border-radius:12px;
    background:#192438;
    color:white;
    font-weight:bold;
    cursor:pointer;
  `;

  document.body.appendChild(accountButton);

  /* =====================================
     ACCOUNT WINDOW
  ===================================== */

  const style = document.createElement("style");

  style.textContent = `
    #mbAccount {
      display:none;
      position:fixed;
      inset:0;
      z-index:10000;
      background:#000b;
      overflow-y:auto;
      padding:15px;
      font-family:Arial,sans-serif;
    }

    #mbAccount .mb-box {
      max-width:440px;
      margin:30px auto;
      padding:22px;
      background:#192438;
      color:white;
      border:1px solid #30415d;
      border-radius:16px;
    }

    #mbAccount h2 {
      margin-bottom:15px;
      color:#65e6c2;
    }

    #mbAccount h3 {
      margin:18px 0 10px;
    }

    #mbAccount input,
    #mbAccount textarea,
    #mbAccount select {
      display:block;
      width:100%;
      padding:12px;
      margin:9px 0;
      background:#111d30;
      color:white;
      border:1px solid #40516c;
      border-radius:8px;
      outline:none;
    }

    #mbAccount textarea {
      min-height:75px;
      resize:vertical;
    }

    #mbAccount button {
      padding:11px 14px;
      margin:4px 2px;
      border:0;
      border-radius:8px;
      cursor:pointer;
      font-weight:bold;
    }

    #mbAccount .mb-primary {
      background:#65e6c2;
      color:#08251e;
    }

    #mbAccount .mb-secondary {
      background:#30415d;
      color:white;
    }

    #mbAccount .mb-danger {
      background:#a63e50;
      color:white;
    }

    #mbAccount .mb-status {
      padding:10px;
      margin:10px 0;
      border-radius:8px;
      background:#22314a;
      font-size:14px;
      overflow-wrap:anywhere;
    }

    #mbAccount .mb-item {
      background:#22314a;
      padding:12px;
      margin:8px 0;
      border-radius:9px;
      overflow-wrap:anywhere;
    }

    #mbAccount .mb-item small {
      display:block;
      color:#aab8ce;
      margin-top:5px;
    }

    #mbAccount .mb-section {
      border-top:1px solid #30415d;
      padding-top:12px;
      margin-top:18px;
    }

    #mbAccount .mb-row {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
    }

    #mbAccount .mb-hidden {
      display:none;
    }

    #mbAccount label {
      font-size:14px;
      color:#d5e1f3;
    }

    #mbAccount button:disabled {
      opacity:.5;
      cursor:not-allowed;
    }
  `;

  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "mbAccount";

  modal.innerHTML = `
    <div class="mb-box">

      <div class="mb-row">
        <h2>🌐 My Browser Account</h2>
        <button class="mb-secondary" id="mbClose">✕</button>
      </div>

      <div id="mbAuth">

        <div class="mb-status" id="mbStatus">
          নিজের অ্যাকাউন্ট খুলুন অথবা Login করুন।
        </div>

        <div id="mbAuthForm">

          <h3 id="mbAuthTitle">Create Account</h3>

          <input id="mbName"
            placeholder="আপনার নাম"
            autocomplete="name">

          <input id="mbEmail"
            type="email"
            placeholder="Email Address"
            autocomplete="email">

          <input id="mbPassword"
            type="password"
            placeholder="Password"
            autocomplete="current-password">

          <button class="mb-primary"
            id="mbSubmit" style="width:100%">
            Sign Up
          </button>

          <button class="mb-secondary"
            id="mbSwitch" style="width:100%">
            আগে Account আছে? Login করুন
          </button>

          <button class="mb-secondary"
            id="mbGoogle" style="width:100%">
            🌐 Continue with Google
          </button>

          <button class="mb-secondary"
            id="mbForgot" style="width:100%">
            Password ভুলে গেছেন?
          </button>

        </div>

      </div>

      <div id="mbDashboard" class="mb-hidden">

        <div class="mb-status" id="mbUserInfo">
          Loading...
        </div>

        <div class="mb-section">
          <h3>👤 Profile</h3>

          <input id="mbUsername"
            placeholder="আপনার নাম">

          <button class="mb-primary" id="mbSaveProfile">
            Profile Save
          </button>
        </div>

        <div class="mb-section">
          <h3>📁 Saved Items</h3>

          <input id="mbSaveTitle"
            placeholder="Title">

          <textarea id="mbSaveContent"
            placeholder="যা সংরক্ষণ করতে চান লিখুন"></textarea>

          <button class="mb-primary" id="mbSaveItem">
            Save
          </button>

          <div id="mbSavedList"></div>
        </div>

        <div class="mb-section">
          <h3>🕘 Search History</h3>

          <button class="mb-secondary" id="mbRefreshHistory">
            Refresh History
          </button>

          <button class="mb-danger" id="mbClearHistory">
            Clear History
          </button>

          <div id="mbHistoryList"></div>
        </div>

        <div class="mb-section">
          <h3>⚙️ Settings</h3>

          <label>Theme</label>

          <select id="mbTheme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>

          <button class="mb-primary" id="mbSaveSettings">
            Save Settings
          </button>
        </div>

        <div class="mb-section">
          <button class="mb-danger"
            id="mbLogout" style="width:100%">
            Logout
          </button>
        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const $ = id => document.getElementById(id);

  let authMode = "signup";

  function status(message) {
    $("mbStatus").textContent = message;
  }

  function showAuth() {
    $("mbAuth").classList.remove("mb-hidden");
    $("mbDashboard").classList.add("mb-hidden");
  }

  function showDashboard() {
    $("mbAuth").classList.add("mb-hidden");
    $("mbDashboard").classList.remove("mb-hidden");
  }

  function openAccount() {
    modal.style.display = "block";
  }

  function closeAccount() {
    modal.style.display = "none";
  }

  accountButton.addEventListener("click", openAccount);

  $("mbClose").addEventListener("click", closeAccount);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeAccount();
  });

  /* =====================================
     AUTH MODE
  ===================================== */

  function setAuthMode(mode) {

    authMode = mode;

    $("mbAuthTitle").textContent =
      mode === "signup" ? "Create Account" : "Login";

    $("mbSubmit").textContent =
      mode === "signup" ? "Sign Up" : "Login";

    $("mbSwitch").textContent =
      mode === "signup"
        ? "আগে Account আছে? Login করুন"
        : "নতুন Account খুলুন";

    $("mbName").style.display =
      mode === "signup" ? "block" : "none";
  }

  $("mbSwitch").addEventListener("click", () => {
    setAuthMode(authMode === "signup" ? "login" : "signup");
    status("আপনার তথ্য দিন।");
  });

  /* =====================================
     EMAIL SIGNUP / LOGIN
  ===================================== */

  $("mbSubmit").addEventListener("click", async () => {

    const email = $("mbEmail").value.trim();
    const password = $("mbPassword").value;
    const name = $("mbName").value.trim();

    if (!email || !password) {
      status("Email এবং Password লিখুন।");
      return;
    }

    if (password.length < 6) {
      status("Password কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    $("mbSubmit").disabled = true;
    status("অপেক্ষা করুন...");

    try {

      let result;

      if (authMode === "signup") {

        result = await sb.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split("@")[0]
            }
          }
        });

        if (result.error) throw result.error;

        status(
          result.data.session
            ? "Account তৈরি হয়েছে!"
            : "Account তৈরি হয়েছে। Email যাচাই করে Login করুন।"
        );

      } else {

        result = await sb.auth.signInWithPassword({
          email,
          password
        });

        if (result.error) throw result.error;

        status("Login সফল হয়েছে!");

        await refreshAccount();

      }

    } catch(error) {

      status("সমস্যা: " + error.message);

    } finally {

      $("mbSubmit").disabled = false;

    }

  });

  /* =====================================
     GOOGLE LOGIN
  ===================================== */

  $("mbGoogle").addEventListener("click", async () => {

    try {

      status("Google Login চালু হচ্ছে...");

      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;

    } catch(error) {

      status("Google Login সমস্যা: " + error.message);

    }

  });

  /* =====================================
     PASSWORD RESET
  ===================================== */

  $("mbForgot").addEventListener("click", async () => {

    const email = $("mbEmail").value.trim();

    if (!email) {
      status("আগে Email লিখুন।");
      return;
    }

    try {

      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) throw error;

      status("Password Reset Email পাঠানো হয়েছে।");

    } catch(error) {

      status(error.message);

    }

  });

  /* =====================================
     ACCOUNT REFRESH
  ===================================== */

  async function refreshAccount() {

    const { data, error } = await sb.auth.getUser();

    if (error || !data.user) {
      currentUser = null;
      showAuth();
      accountButton.textContent = "👤 Account";
      return;
    }

    currentUser = data.user;

    accountButton.textContent = "👤 My Account";

    showDashboard();

    $("mbUserInfo").textContent =
      "Login: " + currentUser.email;

    await loadProfile();
    await loadSavedItems();
    await loadRemoteHistory();
    await loadSettings();

  }

  /* =====================================
     PROFILE
  ===================================== */

  async function loadProfile() {

    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    currentProfile = data;

    $("mbUsername").value =
      data?.username || currentUser.user_metadata?.name || "";

  }

  $("mbSaveProfile").addEventListener("click", async () => {

    const username = $("mbUsername").value.trim();

    try {

      const { error } = await sb
        .from("profiles")
        .upsert({
          id: currentUser.id,
          username
        });

      if (error) throw error;

      status("Profile সংরক্ষণ হয়েছে।");

    } catch(error) {

      status(error.message);

    }

  });

  /* =====================================
     SAVE ITEMS
  ===================================== */

  async function loadSavedItems() {

    const { data, error } = await sb
      .from("saved_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      return;
    }

    const list = $("mbSavedList");
    list.innerHTML = "";

    if (!data.length) {
      list.textContent = "এখনো কিছু Save করা হয়নি।";
      return;
    }

    data.forEach(item => {

      const div = document.createElement("div");
      div.className = "mb-item";

      const title = document.createElement("b");
      title.textContent = item.title || "Untitled";

      const content = document.createElement("p");
      content.textContent = item.content || "";

      const del = document.createElement("button");
      del.className = "mb-danger";
      del.textContent = "Delete";

      del.addEventListener("click", async () => {

        const { error } = await sb
          .from("saved_items")
          .delete()
          .eq("id", item.id);

        if (error) {
          status(error.message);
          return;
        }

        await loadSavedItems();

      });

      div.append(title, content, del);
      list.appendChild(div);

    });

  }

  $("mbSaveItem").addEventListener("click", async () => {

    const title = $("mbSaveTitle").value.trim();
    const content = $("mbSaveContent").value.trim();

    if (!title && !content) {
      status("কিছু লিখুন।");
      return;
    }

    try {

      const { error } = await sb
        .from("saved_items")
        .insert({
          user_id: currentUser.id,
          title,
          content
        });

      if (error) throw error;

      $("mbSaveTitle").value = "";
      $("mbSaveContent").value = "";

      status("তথ্য Save হয়েছে!");

      await loadSavedItems();

    } catch(error) {

      status(error.message);

    }

  });

  /* =====================================
     SEARCH HISTORY
  ===================================== */

  async function loadRemoteHistory() {

    const { data, error } = await sb
      .from("search_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      return;
    }

    const list = $("mbHistoryList");
    list.innerHTML = "";

    data.forEach(item => {

      const div = document.createElement("div");
      div.className = "mb-item";

      const text = document.createElement("span");
      text.textContent = "🔎 " + item.search_text;

      div.appendChild(text);
      list.appendChild(div);

    });

    if (!data.length) {
      list.textContent = "কোনো History নেই।";
    }

    // Sync remote history with existing local history
    const oldHistory = JSON.parse(
      localStorage.getItem("myBrowserHistory") || "[]"
    );

    const merged = [
      ...data.map(item => item.search_text),
      ...oldHistory
    ];

    localStorage.setItem(
      "myBrowserHistory",
      JSON.stringify([...new Set(merged)].slice(0,10))
    );

    if (typeof window.showHistory === "function") {
      window.showHistory();
    }

  }

  // Save searches to the cloud
  const searchForm = document.getElementById("searchForm");

  if (searchForm) {

    searchForm.addEventListener("submit", async () => {

      const query = document.getElementById("searchInput").value.trim();

      if (!currentUser || !query) return;

      const { error } = await sb
        .from("search_history")
        .insert({
          user_id: currentUser.id,
          search_text: query
        });

      if (error) console.error(error);

    });

  }

  $("mbRefreshHistory").addEventListener(
    "click",
    loadRemoteHistory
  );

  $("mbClearHistory").addEventListener("click", async () => {

    if (!confirm("আপনার সব Cloud Search History মুছবেন?")) {
      return;
    }

    const { error } = await sb
      .from("search_history")
      .delete()
      .eq("user_id", currentUser.id);

    if (error) {
      status(error.message);
      return;
    }

    $("mbHistoryList").textContent = "History মুছে ফেলা হয়েছে।";

    localStorage.removeItem("myBrowserHistory");

    if (typeof window.showHistory === "function") {
      window.showHistory();
    }

    status("Cloud History মুছে ফেলা হয়েছে।");

  });

  /* =====================================
     SETTINGS
  ===================================== */

  async function loadSettings() {

    const { data, error } = await sb
      .from("user_settings")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    currentSettings = data?.settings || {};

    const theme = currentSettings.theme || "dark";

    $("mbTheme").value = theme;

  }

  $("mbSaveSettings").addEventListener("click", async () => {

    const theme = $("mbTheme").value;

    try {

      const { error } = await sb
        .from("user_settings")
        .upsert({
          user_id: currentUser.id,
          settings: {
            ...currentSettings,
            theme
          },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      currentSettings.theme = theme;

      document.body.classList.toggle(
        "light",
        theme === "light"
      );

      const themeButton = document.getElementById("themeButton");

      if (themeButton) {
        themeButton.textContent =
          theme === "light" ? "☀️" : "🌙";
      }

      localStorage.setItem("myBrowserTheme", theme);

      status("Settings সংরক্ষণ হয়েছে।");

    } catch(error) {

      status(error.message);

    }

  });

  /* =====================================
     LOGOUT
  ===================================== */

  $("mbLogout").addEventListener("click", async () => {

    if (!confirm("Logout করতে চান?")) return;

    const { error } = await sb.auth.signOut();

    if (error) {
      status(error.message);
      return;
    }

    currentUser = null;
    currentProfile = null;

    showAuth();

    setAuthMode("login");

    accountButton.textContent = "👤 Account";

    status("আপনি Logout করেছেন।");

  });

  /* =====================================
     AUTH STATE LISTENER
  ===================================== */

  sb.auth.onAuthStateChange((event, session) => {

    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {

      if (session?.user) {
        setTimeout(refreshAccount, 0);
      }

    }

    if (event === "SIGNED_OUT") {

      currentUser = null;

      showAuth();

      accountButton.textContent = "👤 Account";

    }

  });

  /* =====================================
     INITIALIZATION
  ===================================== */

  setAuthMode("signup");

  sb.auth.getSession().then(({ data }) => {

    if (data.session) {
      refreshAccount();
    }

  });

  console.log("My Browser Account System Loaded!");

})();
