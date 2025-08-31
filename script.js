//-- JS: nav toggle + GitHub images + lightbox -->
  <script>
    // Mobile nav toggle (matches your CSS)
    (function(){
      const header = document.getElementById('site-header');
      const btn = header.querySelector('.nav-toggle');
      btn.addEventListener('click', () => {
        const open = header.classList.toggle('nav-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    })();

    // Repo configuration (default branch is main)
    const OWNER  = "ImpashreeShetty";
    const REPO   = "responsible-individuals-website";
    const BRANCH = "main";

    const FOLDERS = {
      launch: "Launchphotos",
      office: "Photos/Office",
      ground: "Photos/Groundvisit"
    };

    // Fetch images from GitHub folder via Contents API
    async function fetchImages(folderPath) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(folderPath)}?ref=${encodeURIComponent(BRANCH)}`;
  
  const res = await fetch(url, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  });

  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${folderPath}`);

  const items = await res.json();

  return items
    .filter(x => x.type === 'file' && /\.(jpe?g|png|webp|gif)$/i.test(x.name))
    .filter(x => !/^readme(\..+)?$/i.test(x.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(x => x.download_url);
}


    function renderGallery(name, urls) {
      const root = document.querySelector(`.gallery[data-gallery="\${name}"]`);
      if (!root) return;
      root.innerHTML = urls.map((src, i) => `
        <figure class="ri-tile">
          ${src}
        </figure>
      `).join('');
    }

    function setCover(imgId, urls) {
      const el = document.getElementById(imgId);
      if (el && urls && urls.length) el.src = urls[0];
    }

    (async function init(){
      try {
        const [launch, office, ground] = await Promise.all([
          fetchImages(FOLDERS.launch),
          fetchImages(FOLDERS.office),
          fetchImages(FOLDERS.ground)
        ]);
        renderGallery('launch', launch);
        renderGallery('office', office);
        renderGallery('ground', ground);

        setCover('cover-launch', launch);
        setCover('cover-office', office);
        setCover('cover-ground', ground);

        // Use first Launch photo as Recent banner if available
        const banner = document.getElementById('recent-banner');
        if (banner && launch && launch.length) {
          banner.src = launch[0];
          banner.style.display = 'block';
        }
      } catch (err) {
        console.warn(err);
        document.querySelectorAll('.gallery').forEach(g => {
          g.innerHTML = `<div class="card" style="border-style:dashed;">
            Couldn’t load images from GitHub right now. Please refresh later or verify folder paths/branch.
          </div>`;
        });
      }
    })();

    // Lightbox
    (function(){
      const lb = document.getElementById('ri-lightbox');
      const imgEl = lb.querySelector('.lb-img');
      const closeBtn = lb.querySelector('.lb-close');

      document.addEventListener('click', (e) => {
        const img = e.target.closest('.gallery img');
        if (!img) return;
        imgEl.src = img.dataset.full || img.src;
        imgEl.alt = img.alt || "Gallery image";
        lb.showModal();
      });

      closeBtn.addEventListener('click', () => lb.close());
      lb.addEventListener('click', (e) => {
        const rect = imgEl.getBoundingClientRect();
        const outside = e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right;
        if (outside) lb.close();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.open) lb.close(); });
    })();

//Gallery 
  
function toggleGallery(id) {
  const gallery = document.getElementById(id);
  if (gallery) {
    gallery.classList.toggle('hidden');
  } else {
    console.error("Gallery not found:", id);
  }
}

</script>



