const API_URL = "https://vimeo.franklingothic14.workers.dev";

// ВАЖЛИВО: Вкажіть тут точний порядок категорій, як ви хочете їх бачити на головній сторінці.
// Назви мають співпадати з назвами папок/тегів на Vimeo (з урахуванням регістру).
// Категорії, яких немає в цьому списку, будуть показані в кінці.
const CATEGORY_ORDER = ["NGO", "documentary", "ADVERTISING", "OTHER_PROJECTS"]; 

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

    // Сортуємо ключі об'єкта groupedVideos відповідно до масиву CATEGORY_ORDER
    const sortedCategories = Object.keys(groupedVideos).sort((a, b) => {
      let indexA = CATEGORY_ORDER.indexOf(a);
      let indexB = CATEGORY_ORDER.indexOf(b);
      // Якщо категорії немає в масиві, відправляємо її в кінець
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
      grid.className = "masonry-grid"; // Змінили клас на masonry-grid

      groupedVideos[currentCategory].forEach((video) => {
        const videoId = video.id;
        const title = video.name || "[UNTITLED_PROJECT]";
        const playerParams = "title=0&byline=0&portrait=0&color=e63946";
        
        // Визначаємо співвідношення сторін. Якщо Vimeo не віддає width/height, ставимо 16/9 за замовчуванням.
        // Оскільки наш Worker зараз повертає спрощений об'єкт, ми симулюємо пропорції. 
        // В ідеалі Worker має повертати video.width і video.height. 
        // Поки що CSS буде робити магію.
        
        const card = document.createElement("article");
        card.className = "project-card";
        
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
        grid.appendChild(card);
      });

      section.appendChild(grid);
      gridContainer.appendChild(section);
    } 
    else {
      const folderGrid = document.createElement("div");
      folderGrid.className = "folder-grid";

      // Використовуємо відсортований масив категорій
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