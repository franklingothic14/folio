const API_URL = "https://vimeo.franklingothic14.workers.dev";
const CATEGORY_ORDER = ["NGO", "DOCUMENTARY", "ADVERTISING", "OTHER_PROJECTS"]; 

async function loadPortfolioVideos() {
  const gridContainer = document.getElementById("work-grid");
  const urlParams = new URLSearchParams(window.location.search);
  const currentCategory = urlParams.get('cat');

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const videos = await res.json();

    if (videos.error) {
      gridContainer.innerHTML = `<p class="loading-msg" style="color: var(--accent);">[ API_ERROR: ${videos.error} ]</p>`;
      return;
    }

    if (!videos || videos.length === 0) {
      gridContainer.innerHTML = '<p class="loading-msg">[ NO_DATA_FOUND ]</p>';
      return;
    }

    gridContainer.innerHTML = ""; 

    const groupedVideos = {};
    videos.forEach(video => {
      let cat = video.category;
      if (!cat && video.tags && video.tags.length > 0) cat = video.tags[0];
      if (!cat) cat = "OTHER_PROJECTS";

      if (!groupedVideos[cat]) groupedVideos[cat] = [];
      groupedVideos[cat].push(video);
    });

    const sortedCategories = Object.keys(groupedVideos).sort((a, b) => {
      let indexA = CATEGORY_ORDER.indexOf(a.toUpperCase());
      let indexB = CATEGORY_ORDER.indexOf(b.toUpperCase());
      if (indexA === -1) indexA = 999; 
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });

    if (currentCategory && groupedVideos[currentCategory]) {
      const backBtn = document.createElement("a");
      backBtn.href = window.location.pathname + "#work"; 
      backBtn.className = "back-btn";
      backBtn.innerHTML = "< SYSTEM.BACK_TO_ROOT";
      gridContainer.appendChild(backBtn);

      const section = document.createElement("div");
      section.className = "category-section";

      const heading = document.createElement("h3");
      heading.className = "category-title";
      heading.textContent = `DIR: /${currentCategory}`;
      section.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "masonry-grid"; 

      groupedVideos[currentCategory].forEach((video) => {
        const videoId = video.id;
        const title = video.name || "[UNTITLED_PROJECT]";
        const playerParams = "title=0&byline=0&portrait=0&color=e63946";
        
        // Calculate dynamic aspect ratio based on API data
        const ratio = (video.width && video.height) ? `${video.width} / ${video.height}` : "16 / 9";
        
        const card = document.createElement("article");
        card.className = "project-card";
        
        // Injecting the aspect ratio directly into the HTML style
        card.innerHTML = `
          <div class="video-wrap" style="aspect-ratio: ${ratio};">
            <iframe 
              src="https://player.vimeo.com/video/${videoId}?${playerParams}"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
          <div class="card-body">
            <h3>${title}</h3>
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      gridContainer.appendChild(section);
    } 
    else {
      const folderGrid = document.createElement("div");
      folderGrid.className = "folder-grid";

      sortedCategories.forEach(catName => {
        const catVideos = groupedVideos[catName];
        const folder = document.createElement("a");
        folder.href = `?cat=${encodeURIComponent(catName)}#work`;
        folder.className = "folder-card";
        folder.innerHTML = `
          <div class="folder-icon">■</div>
          <div class="folder-name">/${catName}</div>
          <div class="folder-count">[ ${catVideos.length} FILES ]</div>
        `;
        folderGrid.appendChild(folder);
      });
      gridContainer.appendChild(folderGrid);
    }

  } catch (err) {
    console.error("Fetch error:", err);
    gridContainer.innerHTML = `<p class="loading-msg" style="color: var(--accent);">[ SIGNAL_LOST // CANNOT_CONNECT_TO_API ]</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolioVideos);