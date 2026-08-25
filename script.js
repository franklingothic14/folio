const API_URL = "https://vimeo.franklingothic14.workers.dev";

async function loadPortfolioVideos() {
  const gridContainer = document.getElementById("work-grid");

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

    // 1. Group videos by Vimeo folders or tags automatically
    const groupedVideos = {};

    videos.forEach(video => {
      // Use folder name. If no folder, use the first tag. If neither, put in "OTHER_PROJECTS"
      let cat = video.category;
      if (!cat && video.tags && video.tags.length > 0) {
        cat = video.tags[0];
      }
      if (!cat) {
        cat = "OTHER_PROJECTS";
      }

      if (!groupedVideos[cat]) {
        groupedVideos[cat] = [];
      }
      groupedVideos[cat].push(video);
    });

    // 2. Build a carousel for each category
    for (const [catName, catVideos] of Object.entries(groupedVideos)) {
      const section = document.createElement("div");
      section.className = "category-section";

      const heading = document.createElement("h3");
      heading.className = "category-title";
      heading.textContent = `DIR: /${catName}`;
      section.appendChild(heading);

      const carousel = document.createElement("div");
      carousel.className = "carousel"; // New carousel class

      catVideos.forEach((video) => {
        const videoId = video.id;
        const title = video.name || "[UNTITLED_PROJECT]";
        const description = video.description
          ? video.description.slice(0, 100) + "..."
          : "";

        const playerParams = "title=0&byline=0&portrait=0&color=e63946";

        const card = document.createElement("article");
        card.className = "carousel-card project-card";
        
        // Removed description from UI to save space in carousel, kept only title
        card.innerHTML = `
          <div class="video-wrap">
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
        carousel.appendChild(card);
      });

      section.appendChild(carousel);
      gridContainer.appendChild(section);
    }

  } catch (err) {
    console.error("Fetch error:", err);
    gridContainer.innerHTML = `
      <p class="loading-msg" style="color: var(--accent);">
        [ SIGNAL_LOST // CANNOT_CONNECT_TO_API ]
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolioVideos);