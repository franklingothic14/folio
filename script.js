const API_URL = "https://vimeo.franklingothic14.workers.dev";

// --- ВАШІ НАЛАШТУВАННЯ ДЛЯ ГОЛОВНОГО ЕКРАНУ ---
const CATEGORY_ORDER = ["Ads", "Doc", "NGO", "OTHER_PROJECTS"]; 
const SHOWREEL_VIMEO_ID = "123456789"; // Вставте сюди ID вашого головного шоурілу
const LINKEDIN_URL = "https://linkedin.com/in/yourprofile";
const EMAIL_ADDRESS = "your.email@example.com";

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

    // Групуємо відео по папках
    const groupedVideos = {};
    videos.forEach(video => {
      let cat = video.category;
      if (!cat && video.tags && video.tags.length > 0) cat = video.tags[0];
      if (!cat) cat = "OTHER_PROJECTS";

      if (!groupedVideos[cat]) groupedVideos[cat] = [];
      groupedVideos[cat].push(video);
    });

    // Сортуємо
    const sortedCategories = Object.keys(groupedVideos).sort((a, b) => {
      let indexA = CATEGORY_ORDER.indexOf(a); // Точне співпадіння з регістром
      let indexB = CATEGORY_ORDER.indexOf(b);
      // Fallback до upperCase якщо не знайдено
      if(indexA === -1) indexA = CATEGORY_ORDER.indexOf(a.toUpperCase());
      if(indexB === -1) indexB = CATEGORY_ORDER.indexOf(b.toUpperCase());
      
      if (indexA === -1) indexA = 999; 
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });

    // === СЦЕНАРІЙ 1: ВІДКРИТА КОНКРЕТНА ПАПКА (СІТКА ВІДЕО) ===
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
        let description = video.description || "";
        const playerParams = "title=0&byline=0&portrait=0&color=e63946";
        
        const ratio = (video.width && video.height) ? `${video.width} / ${video.height}` : "16 / 9";
        
        let externalLinksHtml = "";
        const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s]+)/i;
        const igRegex = /(https?:\/\/(?:www\.)?instagram\.com[^\s]+)/i;

        const ytMatch = description.match(ytRegex);
        const igMatch = description.match(igRegex);

        if (ytMatch) {
          externalLinksHtml += `<a href="${ytMatch[0]}" target="_blank" class="ext-btn yt-btn">[ ► YOUTUBE ]</a>`;
          description = description.replace(ytMatch[0], ''); 
        }
        if (igMatch) {
          externalLinksHtml += `<a href="${igMatch[0]}" target="_blank" class="ext-btn ig-btn">[ ► INSTAGRAM ]</a>`;
          description = description.replace(igMatch[0], ''); 
        }

        const card = document.createElement("article");
        card.className = "project-card";
        
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
            ${description.trim() ? `<p class="vid-desc">${description}</p>` : ''}
            ${externalLinksHtml ? `<div class="ext-links">${externalLinksHtml}</div>` : ''}
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      gridContainer.appendChild(section);
    } 
    // === СЦЕНАРІЙ 2: ГОЛОВНИХ ЕКРАН (ШОУРІЛ + 3D ПАПКИ) ===
    else {
      // 1. Блок Шоурілу та Контактів
      const heroBlock = document.createElement("div");
      heroBlock.className = "main-hero-block";
      heroBlock.innerHTML = `
        <div class="hero-info">
          <h2 class="main-title">PORTFOLIO.SYS</h2>
          <p class="main-desc">Video Production / Editing / Direction</p>
          <div class="contact-links">
             <a href="${LINKEDIN_URL}" target="_blank" class="ext-btn">[ ► LINKEDIN ]</a>
             <a href="mailto:${EMAIL_ADDRESS}" class="ext-btn">[ ► EMAIL ]</a>
          </div>
        </div>
        <div class="hero-showreel">
          <div class="video-wrap" style="aspect-ratio: 16/9;">
            <iframe 
              src="https://player.vimeo.com/video/${SHOWREEL_VIMEO_ID}?title=0&byline=0&portrait=0&color=e63946"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        </div>
      `;
      gridContainer.appendChild(heroBlock);

      // 2. Блок 3D Папок
      const divider = document.createElement("div");
      divider.className = "section-divider";
      divider.innerHTML = `<span class="red-text">■</span> DIRECTORIES`;
      divider.style.marginTop = "60px";
      gridContainer.appendChild(divider);

      const stackWrapper = document.createElement("div");
      stackWrapper.className = "stack-wrapper";

      const stackContainer = document.createElement("div");
      stackContainer.className = "folders-stack-container";

      sortedCategories.forEach((catName, index) => {
        const catVideos = groupedVideos[catName];
        const folder = document.createElement("a");
        folder.href = `?cat=${encodeURIComponent(catName)}#work`;
        folder.className = "stack-folder";
        // Задаємо z-index, щоб перші були вище
        folder.style.zIndex = 50 - index;
        folder.style.setProperty('--i', index);
        
        folder.innerHTML = `
          <div class="folder-content">
            <div class="folder-icon">■</div>
            <div class="folder-name">/${catName}</div>
            <div class="folder-count">[ ${catVideos.length} FILES ]</div>
          </div>
        `;
        stackContainer.appendChild(folder);
      });
      
      stackWrapper.appendChild(stackContainer);
      gridContainer.appendChild(stackWrapper);
    }

  } catch (err) {
    console.error("Fetch error:", err);
    gridContainer.innerHTML = `<p class="loading-msg" style="color: var(--accent);">[ SIGNAL_LOST // CANNOT_CONNECT_TO_API ]</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolioVideos);