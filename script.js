const API_URL = "https://vimeo.franklingothic14.workers.dev";

async function loadPortfolioVideos() {
  const gridContainer = document.getElementById("work-grid");

  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const videos = await res.json();
    
    console.log("API Response:", videos);

    if (videos.error) {
      gridContainer.innerHTML = `<p class="loading-msg" style="color: var(--accent);">[ API_ERROR: ${videos.error} ]</p>`;
      return;
    }

    if (!videos || videos.length === 0) {
      gridContainer.innerHTML = '<p class="loading-msg">[ NO_DATA_FOUND ]</p>';
      return;
    }

    gridContainer.innerHTML = ""; 
    
    // Створюємо одну загальну секцію для ВСІХ відео
    const section = document.createElement("div");
    section.className = "category-section";

    const heading = document.createElement("h3");
    heading.className = "category-title";
    heading.textContent = `DIR: /ALL_PROJECTS`; 
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "grid";

    // Виводимо кожне відео, яке є на каналі
    videos.forEach((video) => {
      const videoId = video.id;
      const title = video.name || "[UNTITLED_PROJECT]";
      const description = video.description
        ? video.description.slice(0, 120) + "..."
        : "";

      const playerParams = "title=0&byline=0&portrait=0&color=e63946";

      const card = document.createElement("article");
      card.className = "project-card";
      card.innerHTML = `
        <div class="video-wrap" style="padding-top: 56.25%;">
          <iframe 
            src="https://player.vimeo.com/video/${videoId}?${playerParams}"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        <div class="card-body">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    gridContainer.appendChild(section);

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