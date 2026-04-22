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
  const SVG_GEAR   = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 0H8V2H10V4H12V8H10V10H8V12H4V10H2V8H0V4H2V2H4V0ZM4 4H8V8H4V4Z"/></svg>`;

  // Flat list of all projects across all folders
  const ALL_PROJECTS = DATA.flatMap(f => f.projects.map(p => ({ ...p, originalFolder: f.label })));

  function getDisplayName(label) {
    return localStorage.getItem('folder_name_' + label) || label;
  }

  function getSortedData() {
    const saved = localStorage.getItem('folder_order');
    if (!saved) return DATA;
    try {
      const order = JSON.parse(saved);
      return DATA.slice().sort((a, b) => {
        const ia = order.indexOf(a.label);
        const ib = order.indexOf(b.label);
        const ra = ia === -1 ? DATA.indexOf(a) : ia;
        const rb = ib === -1 ? DATA.indexOf(b) : ib;
        return ra - rb;
      });
    } catch (e) {
      return DATA;
    }
  }

  function saveFolderOrder(sorted) {
    localStorage.setItem('folder_order', JSON.stringify(sorted.map(f => f.label)));
  }

  function getLabels() {
    return getSortedData().map(f => f.label);
  }

  function getProjectFolder(href) {
    const f = DATA.find(f => f.projects.some(p => p.href === href));
    return f ? f.label : null;
  }

  function render(container) {
    const isAdmin = sessionStorage.getItem('portfolio_auth') === 'true';
    container.innerHTML = '';

    const sortedData = getSortedData();

    sortedData.forEach((folder, index) => {
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
      btn.appendChild(document.createTextNode(getDisplayName(folder.label)));

      // Project links — include projects assigned here via folder override
      const contents = document.createElement('div');
      contents.className = 'folder-contents';

      const assigned = ALL_PROJECTS.filter(p => {
        const override = localStorage.getItem('folder_' + p.href.replace('.html', ''));
        return override ? override === folder.label : p.originalFolder === folder.label;
      });

      const sorted = assigned.slice().sort((a, b) => {
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

      if (isAdmin) {
        // ── Header row: folder button + gear ──────────────────
        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex; gap:4px; align-items:stretch;';

        btn.style.flex = '1';

        const gearBtn = document.createElement('button');
        gearBtn.className = 'btn--secondary';
        gearBtn.innerHTML = SVG_GEAR;
        gearBtn.title = 'Folder settings';
        gearBtn.style.cssText = 'padding:0 10px; flex-shrink:0;';

        headerRow.appendChild(btn);
        headerRow.appendChild(gearBtn);

        // ── Settings panel (hidden by default) ────────────────
        const panel = document.createElement('div');
        panel.style.cssText = 'display:none; border:1px solid #000; background:#fff; padding:var(--space-3) var(--space-4); margin-top:4px; flex-wrap:wrap; gap:var(--space-2); align-items:center;';

        const upBtn = document.createElement('button');
        upBtn.className = 'btn--secondary';
        upBtn.textContent = '↑ Move Up';
        upBtn.disabled = index === 0;
        upBtn.addEventListener('click', () => {
          const order = getSortedData();
          [order[index - 1], order[index]] = [order[index], order[index - 1]];
          saveFolderOrder(order);
          render(container);
        });

        const downBtn = document.createElement('button');
        downBtn.className = 'btn--secondary';
        downBtn.textContent = '↓ Move Down';
        downBtn.disabled = index === sortedData.length - 1;
        downBtn.addEventListener('click', () => {
          const order = getSortedData();
          [order[index], order[index + 1]] = [order[index + 1], order[index]];
          saveFolderOrder(order);
          render(container);
        });

        const divider = document.createElement('div');
        divider.style.cssText = 'width:1px; align-self:stretch; background:#D4D4D4; margin:0 var(--space-1);';

        const nameLabel = document.createElement('span');
        nameLabel.className = 'caption';
        nameLabel.textContent = 'Name';
        nameLabel.style.cssText = 'flex-shrink:0;';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = getDisplayName(folder.label);
        nameInput.style.cssText = 'padding:4px 6px; border:1px solid #000; font-family:inherit; font-size:13px; min-width:120px;';
        nameInput.addEventListener('keydown', e => {
          if (e.key === 'Enter') saveBtn.click();
        });

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn--secondary';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => {
          const val = nameInput.value.trim();
          if (val && val !== folder.label) {
            localStorage.setItem('folder_name_' + folder.label, val);
          } else if (!val || val === folder.label) {
            localStorage.removeItem('folder_name_' + folder.label);
          }
          render(container);
        });

        panel.appendChild(upBtn);
        panel.appendChild(downBtn);
        panel.appendChild(divider);
        panel.appendChild(nameLabel);
        panel.appendChild(nameInput);
        panel.appendChild(saveBtn);

        gearBtn.addEventListener('click', e => {
          e.stopPropagation();
          const isOpen = panel.style.display === 'flex';
          panel.style.display = isOpen ? 'none' : 'flex';
          gearBtn.style.background = isOpen ? '' : '#000';
          gearBtn.style.color = isOpen ? '' : '#fff';
        });

        folderItem.appendChild(headerRow);
        folderItem.appendChild(panel);
      } else {
        folderItem.appendChild(btn);
      }

      folderItem.appendChild(contents);
      container.appendChild(folderItem);
    });

    // Folder open/close toggle — plays sound if the page has one
    const folderSound = document.getElementById('folder-sound');
    container.querySelectorAll('.btn-icon-folder').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen = btn.classList.toggle('is-open');
        const fc = btn.closest('.folder-item').querySelector('.folder-contents');
        if (fc) fc.classList.toggle('is-open', isOpen);
        if (isOpen && folderSound) {
          folderSound.currentTime = 0;
          folderSound.play().catch(() => {});
        }
      });
    });
  }

  return { render, getLabels, getProjectFolder, getDisplayName };
})();
