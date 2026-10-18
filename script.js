(() => {
  "use strict";
  const STORAGE_KEY = "miamiDadeSheriffRoleplay_v1";
  const DEMO_PASSWORD = "goldbadge24"; // Demo-only; replace with server-side authentication before public launch.
  const placeholderPortrait = (label = "BSO") => {
    const safe = String(label).replace(/[&<>"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#333226"/><stop offset="1" stop-color="#10120f"/></linearGradient></defs><rect width="700" height="900" fill="url(#g)"/><circle cx="350" cy="285" r="125" fill="#77776a" opacity=".42"/><path d="M115 790c12-185 100-280 235-280s223 95 235 280" fill="#77776a" opacity=".35"/><path d="M350 70l35 78 86-12-39 76 63 61-88 6-57 73-57-73-88-6 63-61-39-76 86 12z" fill="none" stroke="#d7b45e" stroke-width="5" opacity=".8"/><text x="350" y="850" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" letter-spacing="8" fill="#d7b45e">${safe}</text></svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  };
  const today = () => new Date().toISOString().slice(0, 10);
  const seedData = () => ({
    members: [],
    announcements: [
      { id: "news-1", title: "Recruitment information coming soon", category: "Recruitment", date: today(), body: "Recruitment details will be posted here. Check the Apply Today link once the roleplay application portal has been configured." },
      { id: "news-2", title: "Training standards reminder", category: "Training", date: today(), body: "All members are encouraged to review department procedures and stay current with training expectations." },
      { id: "news-3", title: "Welcome to our roleplay community", category: "Department News", date: today(), body: "This is an unofficial ERLC/Roblox roleplay website inspired by Miami-Dade law enforcement. Add your own fictional staff and announcements in the admin panel." }
    ],
    settings: { applyUrl: "https://discord.com/" }
  });
  let data = loadData();
  let activeMember = 0;
  let toastTimer;
  const $ = (id) => document.getElementById(id);
  const esc = (value = "") => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (url) => {
    try { const parsed = new URL(url, window.location.href); return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : ""; }
    catch { return ""; }
  };
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.announcements) && parsed.settings) return parsed;
      }
    } catch (error) { console.warn("Could not read demo storage:", error); }
    return seedData();
  }
  function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
    catch (error) { showToast("Unable to save. Browser storage may be full."); return false; }
  }
  function photoFor(member) { return safeUrl(member.photo) || placeholderPortrait(member.rank || "BSO"); }
  function formatDate(date) {
    if (!date) return "DATE NOT SET";
    const parsed = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? esc(date) : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
  }
  function renderTeam() {
    if (!data.members.length) {
      $("featuredName").textContent = "YOUR TEAM AWAITS";
      $("featuredRank").textContent = "COMMAND STAFF";
      $("featuredBio").textContent = "Open Admin Login to add your fictional command staff.";
      $("featuredDivision").textContent = "Office of the Sheriff";
      $("featuredPhoto").src = placeholderPortrait("ADD MEMBER");
      $("photoIndex").textContent = "00 / 00";
      $("memberSelector").innerHTML = '<p class="empty-announcements">No team members yet. Add them in the admin panel.</p>';
      $("teamCount").textContent = "00 LEADERS";
      return;
    }
    activeMember = ((activeMember % data.members.length) + data.members.length) % data.members.length;
    const member = data.members[activeMember];
    $("featuredName").textContent = member.name.toUpperCase();
    $("featuredRank").textContent = member.rank.toUpperCase();
    $("featuredBio").textContent = member.bio || "Committed to professionalism, teamwork, and service.";
    $("featuredDivision").textContent = member.division || "Command Staff";
    $("featuredPhoto").src = photoFor(member);
    $("featuredPhoto").alt = `${member.name}, ${member.rank}`;
    $("photoIndex").textContent = `${String(activeMember + 1).padStart(2, "0")} / ${String(data.members.length).padStart(2, "0")}`;
    $("teamCount").textContent = `${String(data.members.length).padStart(2, "0")} ${data.members.length === 1 ? "LEADER" : "LEADERS"}`;
    $("memberSelector").innerHTML = data.members.map((m, i) => `<button class="member-select ${i === activeMember ? "active" : ""}" data-member-index="${i}" aria-pressed="${i === activeMember}"><img src="${esc(photoFor(m))}" alt="" loading="lazy"><span><small>${esc(m.rank.toUpperCase())}</small><strong>${esc(m.name)}</strong></span></button>`).join("");
    $("memberSelector").querySelectorAll("[data-member-index]").forEach(button => button.addEventListener("click", () => switchMember(Number(button.dataset.memberIndex))));
  }
  function switchMember(index) {
    if (!data.members.length) return;
    const panel = $("featuredMember");
    panel.classList.add("switching");
    window.setTimeout(() => { activeMember = index; renderTeam(); panel.classList.remove("switching"); }, 150);
  }
  function renderAnnouncements() {
    const posts = [...data.announcements].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    $("announcementGrid").innerHTML = posts.length ? posts.map(post => `<article class="announcement-card"><div class="announcement-meta"><span>${esc(post.category || "Department News")}</span><time>${formatDate(post.date)}</time></div><h3>${esc(post.title)}</h3><p>${esc(post.body)}</p><span class="read-more">MIAMI-DADE BRIEFING <span aria-hidden="true">↗</span></span></article>`).join("") : '<div class="empty-announcements">No announcements have been published yet. Check back soon.</div>';
  }
  function renderApplyLink() {
    const url = safeUrl(data.settings.applyUrl || "");
    $("applyButton").href = url || "#recruitment";
    $("applyButton").target = url ? "_blank" : "_self";
    $("applyButton").rel = "noopener";
  }
  function renderAll() { renderTeam(); renderAnnouncements(); renderApplyLink(); }
  function showToast(message) {
    const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function openAdmin() {
    $("adminModal").classList.add("open"); $("adminModal").setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
    $("loginView").hidden = false; $("dashboardView").hidden = true; $("loginError").textContent = ""; $("adminPassword").value = "";
    window.setTimeout(() => $("adminPassword").focus(), 80);
  }
  function closeAdmin() {
    $("adminModal").classList.remove("open"); $("adminModal").setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open");
  }
  function showDashboard() {
    $("loginView").hidden = true; $("dashboardView").hidden = false;
    renderAdminMembers(); renderAdminAnnouncements(); $("applyUrl").value = data.settings.applyUrl || "";
    switchTab("members");
  }
  function switchTab(tab) {
    document.querySelectorAll(".admin-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    document.querySelectorAll(".admin-pane").forEach(pane => pane.classList.toggle("active", pane.id === `${tab}Pane`));
  }
  function resetMemberForm() { $("memberForm").reset(); $("memberId").value = ""; $("memberError").textContent = ""; $("saveMemberButton").textContent = "Save member"; }
  function editMember(id) {
    const m = data.members.find(member => member.id === id); if (!m) return;
    $("memberId").value = m.id; $("memberName").value = m.name; $("memberRank").value = m.rank; $("memberPhoto").value = m.photo || ""; $("memberBio").value = m.bio || ""; $("memberDivision").value = m.division || "";
    $("saveMemberButton").textContent = "Update member"; $("memberForm").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderAdminMembers() {
    $("adminMemberList").innerHTML = data.members.length ? data.members.map(m => `<div class="admin-list-item"><img src="${esc(photoFor(m))}" alt=""><div class="item-copy"><strong>${esc(m.name)}</strong><small>${esc(m.rank)} · ${esc(m.division || "Command Staff")}</small></div><div class="item-actions"><button data-edit-member="${esc(m.id)}">Edit</button><button class="delete-item" data-delete-member="${esc(m.id)}">Delete</button></div></div>`).join("") : '<p class="settings-hint">No members yet. Use “Add member” to create one.</p>';
    $("adminMemberList").querySelectorAll("[data-edit-member]").forEach(btn => btn.addEventListener("click", () => editMember(btn.dataset.editMember)));
    $("adminMemberList").querySelectorAll("[data-delete-member]").forEach(btn => btn.addEventListener("click", () => {
      const m = data.members.find(member => member.id === btn.dataset.deleteMember);
      if (m && confirm(`Delete ${m.name} from the team?`)) { data.members = data.members.filter(member => member.id !== m.id); saveData(); activeMember = 0; renderAll(); renderAdminMembers(); showToast("Team member deleted."); }
    }));
  }
  function resetAnnouncementForm() { $("announcementForm").reset(); $("announcementId").value = ""; $("announcementDate").value = today(); $("announcementError").textContent = ""; }
  function editAnnouncement(id) {
    const post = data.announcements.find(item => item.id === id); if (!post) return;
    $("announcementId").value = post.id; $("announcementTitle").value = post.title; $("announcementCategory").value = post.category || "Department News"; $("announcementDate").value = post.date || today(); $("announcementBody").value = post.body;
    $("announcementForm").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderAdminAnnouncements() {
    $("adminAnnouncementList").innerHTML = data.announcements.length ? [...data.announcements].sort((a,b) => String(b.date).localeCompare(String(a.date))).map(post => `<div class="admin-list-item"><div class="item-copy"><strong>${esc(post.title)}</strong><small>${esc(post.category)} · ${formatDate(post.date)}</small></div><div class="item-actions"><button data-edit-post="${esc(post.id)}">Edit</button><button class="delete-item" data-delete-post="${esc(post.id)}">Delete</button></div></div>`).join("") : '<p class="settings-hint">No announcements yet. Publish your first post above.</p>';
    $("adminAnnouncementList").querySelectorAll("[data-edit-post]").forEach(btn => btn.addEventListener("click", () => editAnnouncement(btn.dataset.editPost)));
    $("adminAnnouncementList").querySelectorAll("[data-delete-post]").forEach(btn => btn.addEventListener("click", () => {
      const post = data.announcements.find(item => item.id === btn.dataset.deletePost);
      if (post && confirm(`Delete announcement “${post.title}”?`)) { data.announcements = data.announcements.filter(item => item.id !== post.id); saveData(); renderAnnouncements(); renderAdminAnnouncements(); showToast("Announcement deleted."); }
    }));
  }
  $("year").textContent = new Date().getFullYear();
  $("prevMember").addEventListener("click", () => switchMember(activeMember - 1));
  $("nextMember").addEventListener("click", () => switchMember(activeMember + 1));
  $("openAdminTop").addEventListener("click", openAdmin);
  $("closeAdmin").addEventListener("click", closeAdmin);
  $("adminModal").addEventListener("click", event => { if (event.target === $("adminModal")) closeAdmin(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeAdmin(); });
  $("loginForm").addEventListener("submit", event => {
    event.preventDefault();
    if ($("adminPassword").value === DEMO_PASSWORD) showDashboard();
    else $("loginError").textContent = "Incorrect password. Try the demo password shown below the field.";
  });
  $("logoutButton").addEventListener("click", () => { closeAdmin(); showToast("You have logged out."); });
  document.querySelectorAll(".admin-tab").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
  $("newMemberButton").addEventListener("click", () => { resetMemberForm(); $("memberName").focus(); $("memberForm").scrollIntoView({ behavior: "smooth", block: "start" }); });
  $("cancelMemberEdit").addEventListener("click", resetMemberForm);
  $("memberForm").addEventListener("submit", event => {
    event.preventDefault(); $("memberError").textContent = "";
    const photo = $("memberPhoto").value.trim();
    if (photo && !safeUrl(photo)) { $("memberError").textContent = "Please enter a valid http:// or https:// photo URL."; return; }
    const id = $("memberId").value;
    const member = { id: id || `member-${Date.now()}`, name: $("memberName").value.trim(), rank: $("memberRank").value.trim(), photo, bio: $("memberBio").value.trim(), division: $("memberDivision").value.trim() };
    if (!member.name || !member.rank) { $("memberError").textContent = "Name and rank are required."; return; }
    if (id) data.members = data.members.map(m => m.id === id ? member : m); else data.members.push(member);
    if (saveData()) { activeMember = Math.max(0, data.members.findIndex(m => m.id === member.id)); renderAll(); renderAdminMembers(); resetMemberForm(); showToast(id ? "Team member updated." : "Team member added."); }
  });
  $("newAnnouncementButton").addEventListener("click", () => { resetAnnouncementForm(); $("announcementTitle").focus(); $("announcementForm").scrollIntoView({ behavior: "smooth", block: "start" }); });
  $("cancelAnnouncementEdit").addEventListener("click", resetAnnouncementForm);
  $("announcementForm").addEventListener("submit", event => {
    event.preventDefault(); $("announcementError").textContent = "";
    const id = $("announcementId").value;
    const post = { id: id || `news-${Date.now()}`, title: $("announcementTitle").value.trim(), category: $("announcementCategory").value, date: $("announcementDate").value, body: $("announcementBody").value.trim() };
    if (!post.title || !post.date || !post.body) { $("announcementError").textContent = "Please complete the headline, date, and announcement."; return; }
    if (id) data.announcements = data.announcements.map(item => item.id === id ? post : item); else data.announcements.push(post);
    if (saveData()) { renderAnnouncements(); renderAdminAnnouncements(); resetAnnouncementForm(); showToast(id ? "Announcement updated." : "Announcement published."); }
  });
  $("settingsForm").addEventListener("submit", event => {
    event.preventDefault(); $("settingsError").textContent = "";
    const url = $("applyUrl").value.trim();
    if (!safeUrl(url)) { $("settingsError").textContent = "Enter a valid full URL beginning with https:// or http://."; return; }
    data.settings.applyUrl = url;
    if (saveData()) { renderApplyLink(); showToast("Application link saved."); }
  });
  $("resetDemoButton").addEventListener("click", () => {
    if (confirm("Reset all members, announcements, and settings to the original demo content? This cannot be undone.")) {
      data = seedData(); activeMember = 0; saveData(); renderAll(); renderAdminMembers(); renderAdminAnnouncements(); $("applyUrl").value = data.settings.applyUrl; resetMemberForm(); resetAnnouncementForm(); showToast("Demo data has been reset.");
    }
  });
  $("menuToggle").addEventListener("click", () => {
    const open = $("navLinks").classList.toggle("open"); $("menuToggle").setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("#navLinks a").forEach(link => link.addEventListener("click", () => { $("navLinks").classList.remove("open"); $("menuToggle").setAttribute("aria-expanded", "false"); }));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  } else document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
  renderAll();
})();