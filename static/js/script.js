const input = document.getElementById("video-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("video-list");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const themeToggle = document.getElementById("theme-toggle");

/* ---------------- Video Watchlist Logic ---------------- */
function getVideos() {
  return JSON.parse(localStorage.getItem("videos")) || [];
}

function saveVideos(videos) {
  localStorage.setItem("videos", JSON.stringify(videos));
}

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

function renderVideos() {
  list.innerHTML = "";
  const videos = getVideos();
  videos.forEach((video, index) => {
    const card = document.createElement("div");
    card.className = "video-card";

    const thumb = document.createElement("img");
    thumb.src = `https://img.youtube.com/vi/${video.id}/0.jpg`;
    thumb.className = "thumbnail";

    const info = document.createElement("div");
    info.className = "video-info";
    info.innerHTML = `<a href="https://youtu.be/${video.id}" target="_blank">https://youtu.be/${video.id}</a>`;

    const actions = document.createElement("div");
    actions.className = "video-actions";

    const watchBtn = document.createElement("button");
    watchBtn.textContent = video.watched ? "Watched" : "Mark Watched";
    watchBtn.className = "watch-btn" + (video.watched ? " watched" : "");
    watchBtn.onclick = () => {
      videos[index].watched = !videos[index].watched;
      saveVideos(videos);
      renderVideos();
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = () => {
      videos.splice(index, 1);
      saveVideos(videos);
      renderVideos();
    };

    actions.appendChild(watchBtn);
    actions.appendChild(removeBtn);

    card.appendChild(thumb);
    card.appendChild(info);
    card.appendChild(actions);

    list.appendChild(card);
  });
}

addBtn.addEventListener("click", () => {
  const url = input.value.trim();
  const id = extractVideoId(url);
  if (id) {
    const videos = getVideos();
    videos.push({ id, watched: false });
    saveVideos(videos);
    renderVideos();
    input.value = "";
  } else {
    alert("Please enter a valid YouTube link.");
  }
});

// Export list as JSON file
exportBtn.addEventListener("click", () => {
  const data = JSON.stringify(getVideos(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "watchlist.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import list from JSON file
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          saveVideos(imported);
          renderVideos();
          alert("Watchlist imported successfully!");
        } else {
          alert("Invalid file format.");
        }
      } catch {
        alert("Error reading file.");
      }
    };
    reader.readAsText(file);
  }
});

/* ---------------- Theme Toggle Logic ---------------- */
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
});

// Apply saved theme on load
applyTheme(localStorage.getItem("theme") || "light");

/* ---------------- Initial Render ---------------- */
renderVideos();
