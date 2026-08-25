const API_URL = "[YOUR_CLOUDFLARE_WORKER_URL]";
const CATEGORIES = ["[FOLDER_1]", "[FOLDER_2]", "[FOLDER_3]"];

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
    let hasAnyVideoBeenRendered = false;

    CATEGORIES.forEach((catName) => {
      const categoryVideos = videos.filter(v => 
        (v.category && v.category === catName) || 
        (v.tags && v.tags.includes(catName))
      );

      if (categoryVideos.length > 0) {
        hasAnyVideoBeenRendered = true;

        const section = document.createElement("div");
        section.className = "category-section";

        const heading = document.createElement("h3");
        heading.className = "category-title";
        heading.textContent = `DIR: /${catName}`;
        section.appendChild(heading);

        const grid = document.createElement("div");
        grid.className = "grid";

        categoryVideos.forEach((video) => {
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
      }
    });

    if (!hasAnyVideoBeenRendered) {
      gridContainer.innerHTML = `
        <p class="loading-msg" style="color: var(--accent);">
          [ UNCATEGORIZED_DATA ]<br>
          [SYS_MSG: NO_VIDEOS_MATCHED_TARGET_FOLDERS]
        </p>
      `;
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