/* ============================================================
   FOLDERS — Single source of truth for folder/project data.
   Both index.html and portfolio.html render from here, so
   adding or removing projects only needs to happen once.
   ============================================================ */

const Folders = (() => {

  // ── Add / remove projects here ────────────────────────────
  const DATA = [
    {
      label: 'UX Design',
      projects: [
        { href: 'ux-project-01.html', label: 'Project 01' },
        { href: 'ux-project-02.html', label: 'Project 02' },
        { href: 'ux-project-03.html', label: 'Project 03' },
        { href: 'ux-project-04.html', label: 'Project 04' },
        { href: 'ux-project-05.html', label: 'Project 05' },
        { href: 'ux-project-06.html', label: 'Project 06' },
      ],
    },
    {
      label: 'Motion Graphics',
      projects: [
        { href: 'motion-project-01.html', label: 'Project 01' },
        { href: 'motion-project-02.html', label: 'Project 02' },
        { href: 'motion-project-03.html', label: 'Project 03' },
        { href: 'motion-project-04.html', label: 'Project 04' },
        { href: 'motion-project-05.html', label: 'Project 05' },
        { href: 'motion-project-06.html', label: 'Project 06' },
      ],
    },
    {
      label: 'Graphic Design',
      projects: [
        { href: 'graphic-project-01.html', label: 'Project 01' },
        { href: 'graphic-project-02.html', label: 'Project 02' },
        { href: 'graphic-project-03.html', label: 'Project 03' },
        { href: 'graphic-project-04.html', label: 'Project 04' },
        { href: 'graphic-project-05.html', label: 'Project 05' },
        { href: 'graphic-project-06.html', label: 'Project 06' },
      ],
    },
    {
      label: 'The Perpetual World',
      projects: [
        { href: 'perpetual-world-manifesto.html', label: 'The Perpetual World Manifesto' },
      ],
    },
    {
      label: 'Miscellaneous Projects',
      projects: [
        { href: 'misc-project-01.html', label: 'Project 01' },
        { href: 'misc-project-02.html', label: 'Project 02' },
        { href: 'misc-project-03.html', label: 'Project 03' },
        { href: 'misc-project-04.html', label: 'Project 04' },
        { href: 'misc-project-05.html', label: 'Project 05' },
        { href: 'misc-project-06.html', label: 'Project 06' },
        { href: 'misc-project-07.html', label: 'Project 07' },
        { href: 'misc-project-08.html', label: 'Project 08' },
        { href: 'misc-project-09.html', label: 'Project 09' },
        { href: 'misc-project-10.html', label: 'Project 10' },
      ],
    },
  ];

  const SVG_CLOSED = `<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 12H0V0H3.5814L4.55814 1H14V12Z" fill="currentColor"/></svg>`;
  const SVG_OPEN   = `<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.0408 1V2.66667H1.95918L0 10.3333V2.66667V0H3.59184L4.57143 1H14.0408Z" fill="currentColor"/><path d="M14.2041 12H0.489796L2.44898 3.5H16L14.2041 12Z" fill="currentColor"/></svg>`;

  function render(container) {
    const isAdmin = sessionStorage.getItem('portfolio_auth') === 'true';
    container.innerHTML = '';

    DATA.forEach(folder => {
      const folderItem = document.createElement('div');
      folderItem.className = 'folder-item';

      // Folder toggle button
      const btn = document.createElement('button');
      btn.className = 'btn--primary btn-icon-folder';

      const iconClosed = document.createElement('span');
      iconClosed.className = 'icon--folder';
      iconClosed.innerHTML = SVG_CLOSED;

      const iconOpen = document.createElement('span');
      iconOpen.className = 'icon--folder-open';
      iconOpen.innerHTML = SVG_OPEN;

      btn.appendChild(iconClosed);
      btn.appendChild(iconOpen);
      btn.appendChild(document.createTextNode(folder.label));

      // Project links
      const contents = document.createElement('div');
      contents.className = 'folder-contents';

      const sorted = folder.projects.slice().sort((a, b) => {
        const ra = parseFloat(localStorage.getItem('rank_' + a.href.replace('.html', ''))) || Infinity;
        const rb = parseFloat(localStorage.getItem('rank_' + b.href.replace('.html', ''))) || Infinity;
        return ra - rb;
      });

      sorted.forEach(project => {
        const slug = project.href.replace('.html', '');
        const hidden = localStorage.getItem('page_hidden_' + slug) === 'true';

        if (hidden && !isAdmin) return;

        const link = document.createElement('a');
        link.href = project.href;
        link.className = 'btn--primary';
        link.textContent = localStorage.getItem('title_' + slug) || project.label;

        if (hidden && isAdmin) {
          link.style.opacity = '0.35';
          link.title = 'Hidden from visitors';
        }

        contents.appendChild(link);
      });

      folderItem.appendChild(btn);
      folderItem.appendChild(contents);
      container.appendChild(folderItem);
    });

    // Folder open/close toggle — plays sound if the page has one
    const folderSound = document.getElementById('folder-sound');
    container.querySelectorAll('.btn-icon-folder').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen = btn.classList.toggle('is-open');
        const fc = btn.nextElementSibling;
        if (fc && fc.classList.contains('folder-contents')) {
          fc.classList.toggle('is-open', isOpen);
        }
        if (isOpen && folderSound) {
          folderSound.currentTime = 0;
          folderSound.play().catch(() => {});
        }
      });
    });
  }

  return { render };
})();
