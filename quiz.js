
/* =========================================
   MY BROWSER - QUIZ ARENA DEMO
   Virtual credits only
========================================= */

(function () {
  "use strict";

  const URL = window.SUPABASE_URL;
  const KEY = window.SUPABASE_PUBLISHABLE_KEY;

  if (!URL || !KEY || !window.supabase) {
    console.error("Quiz: Supabase config missing");
    return;
  }

  const sb = window.supabase.createClient(URL, KEY);

  const style = document.createElement("style");

  style.textContent = `
    #quizArena {
      max-width:650px;
      margin:30px auto;
      padding:18px;
      border-radius:16px;
      background:#192438;
      color:white;
      border:1px solid #40516c;
      font-family:Arial,sans-serif;
    }

    #quizArena h2 {color:#65e6c2}
    #quizArena .q-card {
      background:#22314a;
      border-radius:12px;
      padding:14px;
      margin:12px 0;
    }

    #quizArena button {
      border:0;
      border-radius:9px;
      padding:12px;
      margin:5px 0;
      width:100%;
      cursor:pointer;
      font-weight:bold;
    }

    #quizArena .q-primary {
      background:#65e6c2;
      color:#08251e;
    }

    #quizArena .q-option {
      background:#30415d;
      color:white;
      text-align:left;
    }

    #quizArena .q-status {
      padding:12px;
      background:#111d30;
      border-radius:9px;
      margin:12px 0;
    }

    #quizArena .q-hidden {display:none}
  `;

  document.head.appendChild(style);

  const panel = document.createElement("section");
  panel.id = "quizArena";

  panel.innerHTML = `
    <h2>🏆 QUIZ ARENA</h2>

    <div class="q-card">
      <div>আপনার Demo Balance</div>
      <h2 id="qBalance">৳০.০০</h2>
    </div>

    <div class="q-card">
      <h3>Type A</h3>
      <p>এন্ট্রি ফি: ১০ ডেমো টাকা</p>
      <p>বিজয়ীর পুরস্কার: ৭০ ডেমো টাকা</p>
      <button class="q-primary" id="qJoin">
        কুইজে প্রবেশ করুন
      </button>
    </div>

    <div class="q-status" id="qStatus">
      কুইজে অংশ নিতে Login করুন।
    </div>

    <div id="qQuestion" class="q-card q-hidden">
      <h3 id="qQuestionText"></h3>
      <div id="qOptions"></div>
    </div>

    <div id="qAdmin" class="q-card q-hidden">
      <h3>🔐 Admin Dashboard</h3>
      <p>Platform Demo Balance</p>
      <h2 id="qPlatformTotal">৳০</h2>
      <p id="qRoomTotal"></p>
      <button class="q-primary" id="qAdminRefresh">
        Refresh Admin হিসাব
      </button>
    </div>

    <p style="font-size:12px;color:#aab8ce">
      এটি পরীক্ষামূলক ভার্চুয়াল ব্যালেন্স। বাস্তব টাকা নয়।
    </p>
  `;

  document.body.appendChild(panel);

  const $ = id => document.getElementById(id);

  let currentUser = null;
  let currentRoom = null;
  let polling = false;
  let answered = false;

  function message(text) {
    $("qStatus").textContent = text;
  }

  function money(amount) {
    return "৳" + Number(amount || 0).toFixed(2);
  }

  async function refreshBalance() {
    if (!currentUser) return;

    const { data, error } = await sb
      .from("quiz_wallets")
      .select("balance")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    $("qBalance").textContent = money(data?.balance || 0);
  }

  async function adminRefresh() {
    const { data, error } = await sb.rpc("quiz_admin_summary");

    if (error) {
      $("qAdmin").classList.add("q-hidden");
      console.error(error);
      return;
    }

    $("qAdmin").classList.remove("q-hidden");

    $("qPlatformTotal").textContent =
      money(data.platform_total);

    $("qRoomTotal").textContent =
      "সম্পন্ন রুম: " + data.completed_rooms;
  }

  function showQuestion(data) {
    if (!data.question || !Array.isArray(data.options)) return;

    $("qQuestion").classList.remove("q-hidden");
    $("qQuestionText").textContent = data.question;

    const list = $("qOptions");
    list.innerHTML = "";

    data.options.forEach((option, index) => {
      const button = document.createElement("button");

      button.className = "q-option";
      button.textContent = option;

      button.addEventListener("click", () => {
        submitAnswer(index);
      });

      list.appendChild(button);
    });
  }

  async function checkStatus() {
    if (!currentUser) return;

    const { data, error } = await sb.rpc("my_demo_quiz_status");

    if (error) {
      console.error(error);
      return;
    }

    if (!data || data.status === "none") return;

    currentRoom = data.room_id;

    if (data.status === "waiting") {
      $("qQuestion").classList.add("q-hidden");

      message(
        "আরও " + data.needed +
        " জন প্রয়োজন। বর্তমানে " +
        data.participant_count + "/10 জন।"
      );
    }

    if (data.status === "running") {
      message("🎯 কুইজ শুরু হয়েছে! দ্রুত উত্তর দিন।");
      if (!answered) showQuestion(data);
    }

    if (data.status === "finished") {
      $("qQuestion").classList.add("q-hidden");

      if (data.is_winner) {
        message("🎉 অভিনন্দন! আপনি ৭০ ডেমো টাকা পেয়েছেন!");
      } else {
        message("কুইজ শেষ। এই রুমের বিজয়ী নির্ধারিত হয়েছে।");
      }

      await refreshBalance();
      await adminRefresh();
    }
  }

  async function joinQuiz() {
    if (!currentUser) {
      message("আগে আপনার Account-এ Login করুন।");
      return;
    }

    $("qJoin").disabled = true;
    message("রুম খোঁজা হচ্ছে...");

    try {
      const { data, error } = await sb.rpc("join_demo_quiz");

      if (error) throw error;

      currentRoom = data.room_id;
      answered = false;

      await refreshBalance();

      if (data.status === "running") {
        message("রুম পূর্ণ! কুইজ শুরু হচ্ছে...");
      } else {
        message(
          "আরও " + data.needed +
          " জন প্রয়োজন। বর্তমানে " +
          data.participant_count + "/10 জন।"
        );
      }

      await checkStatus();

    } catch (error) {
      message("সমস্যা: " + error.message);
    } finally {
      $("qJoin").disabled = false;
    }
  }

  async function submitAnswer(option) {
    if (answered) return;

    answered = true;

    const buttons = $("qOptions").querySelectorAll("button");
    buttons.forEach(button => button.disabled = true);

    message("উত্তর জমা হচ্ছে...");

    try {
      const { data, error } = await sb.rpc(
        "submit_demo_answer",
        { p_option: option }
      );

      if (error) throw error;

      if (data.winner) {
        message("🎉 " + data.message);
      } else {
        message(data.message || "উত্তর জমা হয়েছে।");
      }

      await refreshBalance();
      await checkStatus();
      await adminRefresh();

    } catch (error) {
      answered = false;
      message("সমস্যা: " + error.message);
    }
  }

  $("qJoin").addEventListener("click", joinQuiz);
  $("qAdminRefresh").addEventListener("click", adminRefresh);

  async function initialize() {
    const { data, error } = await sb.auth.getUser();

    if (error || !data.user) {
      message("কুইজ খেলতে আগে Login করুন।");
      return;
    }

    currentUser = data.user;

    await refreshBalance();
    await checkStatus();
    await adminRefresh();

    if (!polling) {
      polling = true;

      setInterval(async () => {
        if (!currentUser) return;

        await checkStatus();
        await refreshBalance();
      }, 3000);
    }
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
      if (session?.user) {
        setTimeout(initialize, 0);
      }
    }

    if (event === "SIGNED_OUT") {
      currentUser = null;
      message("কুইজ খেলতে Login করুন।");
    }
  });

  initialize();

  console.log("Quiz Arena Demo Loaded");
})();
