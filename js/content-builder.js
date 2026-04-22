/* ============================================================
   CONTENT BUILDER — Admin block editor for project pages
   ============================================================ */

const ContentBuilder = (() => {

  const SESSION_KEY = 'portfolio_auth';

  // ── Add new images here when you drop them in the folder ──
  const IMAGES = [
    'images/page%20builder%20images/alone%20in%20the%20store%20am%20I%20dreaming.png',
    'images/page%20builder%20images/office%20flat.png',
    'images/page%20builder%20images/Info%20people.png',
    'images/page%20builder%20images/LeviCaterInfographic.png',
    'images/page%20builder%20images/SkyInfographic.png',
    'images/page%20builder%20images/scenic.png',
  ];

  const TEXT_STYLES = [
    { label: 'Display',    value: 'display-lg' },
    { label: 'H XL',       value: 'heading-xl'  },
    { label: 'H LG',       value: 'heading-lg'  },
    { label: 'H MD',       value: 'heading-md'  },
    { label: 'H SM',       value: 'heading-sm'  },
    { label: 'Body LG',    value: 'body-lg'     },
    { label: 'Body',       value: 'body-base'   },
    { label: 'Body SM',    value: 'body-sm'     },
    { label: 'Label',      value: 'label'       },
    { label: 'Caption',    value: 'caption'     },
  ];

  const TYPE_CLASSES = TEXT_STYLES.map(s => s.value);

  const COLORS = [
    { label: 'White',    value: '#FFFFFF', dark: false },
    { label: 'Gray 50',  value: '#FAFAFA', dark: false },
    { label: 'Gray 100', value: '#F5F5F5', dark: false },
    { label: 'Gray 200', value: '#E5E5E5', dark: false },
    { label: 'Gray 300', value: '#D4D4D4', dark: false },
    { label: 'Gray 400', value: '#A3A3A3', dark: false },
    { label: 'Gray 500', value: '#737373', dark: true  },
    { label: 'Gray 600', value: '#404040', dark: true  },
    { label: 'Gray 700', value: '#2E2E2E', dark: true  },
    { label: 'Gray 800', value: '#1F1F1F', dark: true  },
    { label: 'Gray 900', value: '#141414', dark: true  },
    { label: 'Gray 950', value: '#0A0A0A', dark: true  },
    { label: 'Black',    value: '#000000', dark: true  },
    { label: 'Blue 01',  value: '#E7E1D4', dark: false },
    { label: 'Brand',    value: '#9A1638', dark: true  },
    { label: 'Slate',    value: '#6E7F92', dark: true  },
    { label: 'Steel',    value: '#CBD5E0', dark: false },
    { label: 'Taupe',    value: '#AFA392', dark: false },
    { label: 'Linen',    value: '#EDE0D0', dark: false },
    { label: 'Mist',     value: '#D5DCE8', dark: false },
    { label: 'Stone',    value: '#A09280', dark: false },
  ];

  function isAdmin() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function pageKey() {
    return 'cb_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  // In-memory cache — primary source of truth
  // localStorage used for persistence where available
  let _cache = null;

  function loadBlocks() {
    if (_cache !== null) return _cache;
    try { _cache = JSON.parse(localStorage.getItem(pageKey())) || []; }
    catch (e) { _cache = []; }
    return _cache;
  }

  function saveBlocks(blocks) {
    _cache = blocks;
    try { localStorage.setItem(pageKey(), JSON.stringify(blocks)); }
    catch (e) { /* localStorage unavailable — blocks persist in memory only */ }
  }

  function uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  function isDarkFill(hex) {
    const c = COLORS.find(c => c.value === hex);
    return c ? c.dark : false;
  }

  // ── Floating toolbar ──────────────────────────────────────

  let toolbar = null;
  let activeTextEl = null;

  function createToolbar() {
    if (toolbar) return;
    toolbar = document.createElement('div');
    toolbar.id = 'cb-floating-toolbar';

    TEXT_STYLES.forEach(style => {
      const btn = document.createElement('button');
      btn.className = 'cb-tb-btn';
      btn.textContent = style.label;
      btn.dataset.style = style.value;
      btn.addEventListener('mousedown', e => {
        e.preventDefault(); // keep focus in editor
        applyStyleToCurrentParagraph(style.value);
        updateToolbarActive(style.value);
      });
      toolbar.appendChild(btn);
    });

    document.body.appendChild(toolbar);
  }

  function showToolbar(el) {
    if (!toolbar) createToolbar();
    activeTextEl = el;
    toolbar.classList.add('cb-tb--visible');
    updateToolbarActive(getCurrentParagraphStyle());
  }

  function hideToolbar() {
    if (toolbar) toolbar.classList.remove('cb-tb--visible');
    activeTextEl = null;
  }

  function updateToolbarActive(styleValue) {
    if (!toolbar) return;
    toolbar.querySelectorAll('.cb-tb-btn').forEach(btn => {
      btn.classList.toggle('cb-tb-btn--active', btn.dataset.style === styleValue);
    });
  }

  function getCurrentParagraph() {
    if (!activeTextEl) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    while (node && node.parentElement !== activeTextEl) {
      node = node.parentElement;
    }
    return (node && node.parentElement === activeTextEl) ? node : null;
  }

  function getCurrentParagraphStyle() {
    const para = getCurrentParagraph();
    if (!para) return 'body-base';
    return TYPE_CLASSES.find(c => para.classList.contains(c)) || 'body-base';
  }

  function applyStyleToCurrentParagraph(styleValue) {
    const para = getCurrentParagraph();
    if (!para) return;
    TYPE_CLASSES.forEach(c => para.classList.remove(c));
    para.classList.add(styleValue);
    // Save
    saveCurrentTextBlock();
  }

  function saveCurrentTextBlock() {
    if (!activeTextEl) return;
    const id = activeTextEl.dataset.blockId;
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.content = activeTextEl.innerHTML; saveBlocks(blocks); }
  }

  // ── Render ───────────────────────────────────────────────

  function render() {
    const container = document.getElementById('cb-content');
    if (!container) return;
    container.innerHTML = '';

    const blocks = loadBlocks();
    const admin  = isAdmin();

    blocks.forEach((block, i) => {
      container.appendChild(renderBlock(block, i, blocks.length, admin, blocks[i + 1]));
    });

    if (admin) container.appendChild(renderAddBar());
  }

  function renderBlock(block, index, total, admin, nextBlock) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-block';
    if (block.hugTop) wrap.classList.add('cb-block--hug-top');

    // ── Spacer block ─────────────────────────────────────────
    if (block.type === 'spacer') {
      const height = block.spacerHeight || 32;
      if (admin) {
        wrap.style.cssText = 'background-color:rgba(255,255,255,0.5); border:1px dashed #D4D4D4;';
        wrap.appendChild(renderSpacerControls(block.id, index, total, block, nextBlock));
        const preview = document.createElement('div');
        preview.style.height = height + 'px';
        wrap.appendChild(preview);
      } else {
        wrap.style.cssText = 'background:transparent; border:none; height:' + height + 'px;';
      }
      return wrap;
    }

    const fill = block.fill || '#FFFFFF';
    const dark = isDarkFill(fill);
    wrap.style.backgroundColor = fill;
    wrap.style.color = dark ? '#FFFFFF' : '#000000';

    if (admin) wrap.appendChild(renderControls(block.id, index, total, fill, block, nextBlock));

    if (block.type === 'text') {
      const el = document.createElement('div');
      el.className = 'cb-text';
      el.style.color = dark ? '#FFFFFF' : '#000000';
      el.dataset.blockId = block.id;

      // Build paragraph content
      if (block.content) {
        el.innerHTML = block.content;
      } else if (admin) {
        const p = document.createElement('div');
        p.className = 'body-base';
        p.textContent = 'Click to edit…';
        el.appendChild(p);
      }

      if (admin) {
        el.contentEditable = 'true';

        // Enter key → new body-base paragraph
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const para = getCurrentParagraph();
            const currentStyle = para
              ? (TYPE_CLASSES.find(c => para.classList.contains(c)) || 'body-base')
              : 'body-base';
            const newPara = document.createElement('div');
            newPara.className = currentStyle;
            newPara.innerHTML = '<br>';
            if (para) para.after(newPara);
            else el.appendChild(newPara);
            // Move cursor
            const range = document.createRange();
            range.setStart(newPara, 0);
            range.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        });

        el.addEventListener('focus', () => showToolbar(el));
        el.addEventListener('blur',  () => setTimeout(() => {
          if (document.activeElement !== el && !toolbar?.contains(document.activeElement)) {
            saveCurrentTextBlock();
            hideToolbar();
          }
        }, 150));

        el.addEventListener('keyup',       () => updateToolbarActive(getCurrentParagraphStyle()));
        el.addEventListener('mouseup',     () => updateToolbarActive(getCurrentParagraphStyle()));
        el.addEventListener('selectionchange', () => updateToolbarActive(getCurrentParagraphStyle()));
      }

      wrap.appendChild(el);

    } else if (block.type === 'image') {
      wrap.classList.add('cb-block--image');
      const images = normalizeImages(block);
      const imgWrap = document.createElement('div');
      imgWrap.className = 'cb-image-wrap';

      // Apply padding setting
      const pad = block.imagePadding;
      if (pad === 'centered') {
        imgWrap.style.padding = '32px';
        imgWrap.style.display = 'flex';
        imgWrap.style.flexDirection = 'column';
        imgWrap.style.alignItems = 'center';
      } else if (pad) {
        imgWrap.style.padding = pad + 'px';
      }

      images.forEach((imgData, imgIndex) => {
        const imgRow = document.createElement('div');
        imgRow.className = 'cb-image-row';

        const img = document.createElement('img');
        img.src       = imgData.src;
        img.alt       = imgData.alt || '';
        img.className = 'cb-image';
        img.style.width = (imgData.scale || 100) + '%';
        imgRow.appendChild(img);

        if (admin) {
          const imgControls = document.createElement('div');
          imgControls.className = 'cb-image-controls';

          // Scale buttons
          const scaleLabel = document.createElement('span');
          scaleLabel.className = 'label';
          scaleLabel.style.cssText = 'color:inherit; margin-right:var(--space-2);';
          scaleLabel.textContent = 'Scale:';
          imgControls.appendChild(scaleLabel);

          [25, 50, 75, 100].forEach(pct => {
            const btn = document.createElement('button');
            btn.className = 'btn--secondary cb-scale-btn';
            btn.textContent = pct + '%';
            if (pct === (imgData.scale || 100)) btn.classList.add('cb-scale-btn--active');
            btn.addEventListener('click', () => setImageScale(block.id, imgIndex, pct));
            imgControls.appendChild(btn);
          });

          // Remove this image
          if (images.length > 1) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn--secondary cb-btn--delete';
            removeBtn.style.marginLeft = 'auto';
            removeBtn.textContent = '✕';
            removeBtn.addEventListener('click', () => removeImage(block.id, imgIndex));
            imgControls.appendChild(removeBtn);
          }

          imgRow.appendChild(imgControls);
        }

        imgWrap.appendChild(imgRow);
      });

      wrap.appendChild(imgWrap);

    } else if (block.type === 'video') {
      wrap.classList.add('cb-block--video');
      const embedId = youtubeId(block.url || '');
      const videoWrap = document.createElement('div');
      videoWrap.className = 'cb-video-wrap';

      if (embedId) {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + embedId;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.frameBorder = '0';
        videoWrap.appendChild(iframe);
      } else {
        const placeholder = document.createElement('p');
        placeholder.className = 'caption';
        placeholder.style.cssText = 'padding:var(--space-4); text-align:center;';
        placeholder.textContent = admin ? 'No video URL set — click "Change URL" to add one.' : '';
        videoWrap.appendChild(placeholder);
      }

      if (admin) {
        const urlBtn = document.createElement('button');
        urlBtn.className = 'btn--secondary';
        urlBtn.style.marginTop = 'var(--space-3)';
        urlBtn.textContent = 'Change URL';
        urlBtn.addEventListener('click', () => openVideoPicker(block.id));
        videoWrap.appendChild(urlBtn);
      }

      wrap.appendChild(videoWrap);
    }

    return wrap;
  }

  function renderControls(id, index, total, currentFill, block, nextBlock) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-controls';

    const actions = document.createElement('div');
    actions.className = 'cb-actions';

    if (index > 0)         actions.appendChild(makeBtn('↑ Move Up',   () => moveBlock(id, -1)));
    if (index < total - 1) actions.appendChild(makeBtn('↓ Move Down', () => moveBlock(id,  1)));

    const hugTopBtn = document.createElement('button');
    hugTopBtn.className = 'btn--secondary cb-scale-btn';
    hugTopBtn.textContent = '^ Hug Top';
    if (block.hugTop) hugTopBtn.classList.add('cb-scale-btn--active');
    hugTopBtn.addEventListener('click', () => toggleHugTop(id));
    actions.appendChild(hugTopBtn);

    if (index < total - 1) {
      const hugBotBtn = document.createElement('button');
      hugBotBtn.className = 'btn--secondary cb-scale-btn';
      hugBotBtn.textContent = 'v Hug Bottom';
      if (nextBlock && nextBlock.hugTop) hugBotBtn.classList.add('cb-scale-btn--active');
      hugBotBtn.addEventListener('click', () => toggleHugBottom(id));
      actions.appendChild(hugBotBtn);
    }

    const del = makeBtn('✕ Remove', () => deleteBlock(id));
    del.classList.add('cb-btn--delete');
    actions.appendChild(del);
    wrap.appendChild(actions);

    // Color swatches
    const swatchLabel = document.createElement('p');
    swatchLabel.className = 'label';
    swatchLabel.style.cssText = 'margin-bottom:var(--space-2); color:inherit;';
    swatchLabel.textContent = 'Fill';
    wrap.appendChild(swatchLabel);

    const swatches = document.createElement('div');
    swatches.className = 'cb-swatches';

    COLORS.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'cb-swatch';
      btn.style.backgroundColor = color.value;
      btn.title = color.label;
      if (color.value === currentFill) btn.classList.add('cb-swatch--active');
      btn.addEventListener('click', () => setFill(id, color.value));
      swatches.appendChild(btn);
    });

    wrap.appendChild(swatches);

    // Image-only controls
    if (block.type === 'image') {
      // Padding selector
      const padLabel = document.createElement('p');
      padLabel.className = 'label';
      padLabel.style.cssText = 'margin-bottom:var(--space-2); margin-top:var(--space-3); color:inherit;';
      padLabel.textContent = 'Padding';
      wrap.appendChild(padLabel);

      const padRow = document.createElement('div');
      padRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--space-2);';

      const PAD_OPTIONS = [
        { label: '0px',    value: '0'        },
        { label: '1px',    value: '1'        },
        { label: '8px',    value: '8'        },
        { label: '16px',   value: '16'       },
        { label: '32px',   value: '32'       },
        { label: '64px',   value: '64'       },
        { label: 'Center', value: 'centered' },
      ];

      PAD_OPTIONS.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn--secondary cb-scale-btn';
        btn.textContent = opt.label;
        if ((block.imagePadding || '1') === opt.value) btn.classList.add('cb-scale-btn--active');
        btn.addEventListener('click', () => setPadding(block.id, opt.value));
        padRow.appendChild(btn);
      });

      wrap.appendChild(padRow);

      // Add image button
      const addImgBtn = document.createElement('button');
      addImgBtn.className = 'btn--secondary';
      addImgBtn.style.marginTop = 'var(--space-3)';
      addImgBtn.textContent = '+ Add Image';
      addImgBtn.addEventListener('click', () => openImagePicker(block.id));
      wrap.appendChild(addImgBtn);
    }

    return wrap;
  }

  function renderSpacerControls(id, index, total, block, nextBlock) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-controls';

    const actions = document.createElement('div');
    actions.className = 'cb-actions';

    if (index > 0)         actions.appendChild(makeBtn('↑ Move Up',   () => moveBlock(id, -1)));
    if (index < total - 1) actions.appendChild(makeBtn('↓ Move Down', () => moveBlock(id,  1)));

    const hugTopBtn = document.createElement('button');
    hugTopBtn.className = 'btn--secondary cb-scale-btn';
    hugTopBtn.textContent = '^ Hug Top';
    if (block.hugTop) hugTopBtn.classList.add('cb-scale-btn--active');
    hugTopBtn.addEventListener('click', () => toggleHugTop(id));
    actions.appendChild(hugTopBtn);

    if (index < total - 1) {
      const hugBotBtn = document.createElement('button');
      hugBotBtn.className = 'btn--secondary cb-scale-btn';
      hugBotBtn.textContent = 'v Hug Bottom';
      if (nextBlock && nextBlock.hugTop) hugBotBtn.classList.add('cb-scale-btn--active');
      hugBotBtn.addEventListener('click', () => toggleHugBottom(id));
      actions.appendChild(hugBotBtn);
    }

    const del = makeBtn('✕ Remove', () => deleteBlock(id));
    del.classList.add('cb-btn--delete');
    actions.appendChild(del);
    wrap.appendChild(actions);

    const heightLabel = document.createElement('p');
    heightLabel.className = 'label';
    heightLabel.style.cssText = 'margin-bottom:var(--space-2); margin-top:var(--space-3); color:inherit;';
    heightLabel.textContent = 'Height';
    wrap.appendChild(heightLabel);

    const heightRow = document.createElement('div');
    heightRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--space-2);';

    [8, 16, 32, 64, 128].forEach(px => {
      const btn = document.createElement('button');
      btn.className = 'btn--secondary cb-scale-btn';
      btn.textContent = px + 'px';
      if ((block.spacerHeight || 32) === px) btn.classList.add('cb-scale-btn--active');
      btn.addEventListener('click', () => setSpacerHeight(id, px));
      heightRow.appendChild(btn);
    });

    wrap.appendChild(heightRow);
    return wrap;
  }

  function setSpacerHeight(id, height) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.spacerHeight = height; saveBlocks(blocks); }
    render();
  }

  function renderAddBar() {
    const bar = document.createElement('div');
    bar.className = 'cb-add-bar';

    const textBtn = document.createElement('button');
    textBtn.className = 'btn--secondary';
    textBtn.textContent = '+ Text Block';
    textBtn.addEventListener('click', () => addBlock({ type: 'text', content: '', fill: '#FFFFFF' }));

    const imgBtn = document.createElement('button');
    imgBtn.className = 'btn--secondary';
    imgBtn.textContent = '+ Image Block';
    imgBtn.addEventListener('click', () => openImagePicker());

    const vidBtn = document.createElement('button');
    vidBtn.className = 'btn--secondary';
    vidBtn.textContent = '+ Video Block';
    vidBtn.addEventListener('click', () => openVideoPicker());

    const spacerBtn = document.createElement('button');
    spacerBtn.className = 'btn--secondary';
    spacerBtn.textContent = '+ Padding Block';
    spacerBtn.addEventListener('click', () => addBlock({ type: 'spacer', spacerHeight: 32 }));

    bar.appendChild(textBtn);
    bar.appendChild(imgBtn);
    bar.appendChild(vidBtn);
    bar.appendChild(spacerBtn);
    return bar;
  }

  // ── Block operations ──────────────────────────────────────

  function addBlock(data) {
    const blocks = loadBlocks();
    blocks.push({ id: uid(), ...data });
    saveBlocks(blocks);
    render();
  }

  function deleteBlock(id) {
    saveBlocks(loadBlocks().filter(b => b.id !== id));
    render();
  }

  function moveBlock(id, dir) {
    const blocks = loadBlocks();
    const i = blocks.findIndex(b => b.id === id);
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    saveBlocks(blocks);
    render();
  }

  // Migrate old single-image blocks to images array format
  function normalizeImages(block) {
    if (block.images) return block.images;
    if (block.src) return [{ src: block.src, alt: block.alt || '', scale: block.scale || 100 }];
    return [];
  }

  function setImageScale(blockId, imgIndex, scale) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === blockId);
    if (b) {
      const images = normalizeImages(b);
      images[imgIndex].scale = scale;
      b.images = images;
      delete b.src; delete b.alt; delete b.scale;
      saveBlocks(blocks);
    }
    render();
  }

  function removeImage(blockId, imgIndex) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === blockId);
    if (b) {
      const images = normalizeImages(b);
      images.splice(imgIndex, 1);
      b.images = images;
      delete b.src; delete b.alt; delete b.scale;
      saveBlocks(blocks);
    }
    render();
  }

  function addImageToBlock(blockId, src) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === blockId);
    if (b) {
      const images = normalizeImages(b);
      images.push({ src, alt: '', scale: 100 });
      b.images = images;
      delete b.src; delete b.alt; delete b.scale;
      saveBlocks(blocks);
    }
    render();
  }

  function setPadding(id, value) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.imagePadding = value; saveBlocks(blocks); }
    render();
  }

  function toggleHugTop(id) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.hugTop = !b.hugTop; saveBlocks(blocks); }
    render();
  }

  function toggleHugBottom(id) {
    const blocks = loadBlocks();
    const i = blocks.findIndex(b => b.id === id);
    if (i >= 0 && i < blocks.length - 1) {
      blocks[i + 1].hugTop = !blocks[i + 1].hugTop;
      saveBlocks(blocks);
      render();
    }
  }

  function setFill(id, fill) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.fill = fill; saveBlocks(blocks); }
    render();
  }

  // ── Image picker ──────────────────────────────────────────

  function driveDirectUrl(input) {
    const m = input.match(/\/d\/([A-Za-z0-9_-]{10,})/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1600';
    return null;
  }

  function openImagePicker(blockId = null) {
    const modal = document.createElement('div');
    modal.className = 'cb-modal';

    const inner = document.createElement('div');
    inner.className = 'cb-modal-inner';

    const heading = document.createElement('p');
    heading.className = 'label';
    heading.style.marginBottom = 'var(--space-4)';
    heading.textContent = 'Select an Image';
    inner.appendChild(heading);

    // ── URL paste row ──────────────────────────────────────
    const urlRow = document.createElement('div');
    urlRow.style.cssText = 'display:flex; gap:var(--space-2); margin-bottom:var(--space-6);';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Paste any image URL or Google Drive share link…';
    urlInput.style.cssText = 'flex:1; padding:6px 8px; border:1px solid #000; font-family:inherit; font-size:13px;';

    const urlBtn = document.createElement('button');
    urlBtn.className = 'btn--secondary';
    urlBtn.textContent = 'Add';
    urlBtn.addEventListener('click', () => {
      const raw = urlInput.value.trim();
      if (!raw) return;
      const src = driveDirectUrl(raw) || raw;
      if (blockId) {
        addImageToBlock(blockId, src);
      } else {
        addBlock({ type: 'image', images: [{ src, alt: '', scale: 100 }], fill: '#FFFFFF' });
      }
      document.body.removeChild(modal);
    });

    urlRow.appendChild(urlInput);
    urlRow.appendChild(urlBtn);
    inner.appendChild(urlRow);

    const grid = document.createElement('div');
    grid.className = 'cb-image-grid';
    inner.appendChild(grid);

    const cancel = document.createElement('button');
    cancel.className = 'btn--text';
    cancel.textContent = 'Cancel';
    cancel.style.marginTop = 'var(--space-6)';
    cancel.addEventListener('click', () => document.body.removeChild(modal));
    inner.appendChild(cancel);

    modal.appendChild(inner);
    modal.addEventListener('click', e => {
      if (e.target === modal) document.body.removeChild(modal);
    });

    document.body.appendChild(modal);

    grid.innerHTML = '<p class="caption" style="padding:8px;">Loading…</p>';

    loadPickerImages().then(images => {
      grid.innerHTML = '';
      if (images.length === 0) {
        grid.innerHTML = '<p class="caption" style="padding:8px;">No images found. Add images to your Google Drive folder or connect one in GitHub Settings.</p>';
        return;
      }
      images.forEach(({ src, thumb, name }) => {
        const thumbEl = document.createElement('div');
        thumbEl.className = 'cb-image-thumb';
        const img = document.createElement('img');
        img.src = thumb;
        img.alt = name;
        thumbEl.appendChild(img);
        const label = document.createElement('p');
        label.className = 'caption';
        label.style.cssText = 'margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';
        label.textContent = name;
        thumbEl.appendChild(label);
        thumbEl.addEventListener('click', () => {
          if (blockId) {
            addImageToBlock(blockId, src);
          } else {
            addBlock({ type: 'image', images: [{ src, alt: '', scale: 100 }], fill: '#FFFFFF' });
          }
          document.body.removeChild(modal);
        });
        grid.appendChild(thumbEl);
      });
    }).catch(() => {
      grid.innerHTML = '<p class="caption" style="padding:8px; color:#9A1638;">Failed to load images. Check your Drive settings.</p>';
    });
  }

  async function fetchDriveImages() {
    const folderId = localStorage.getItem('__drive_folder__');
    const apiKey   = localStorage.getItem('__drive_key__');
    if (!folderId || !apiKey) return [];

    const q   = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=100&orderBy=createdTime+desc&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map(f => ({
      src:   `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`,
      thumb: `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
      name:  f.name,
    }));
  }

  async function loadPickerImages() {
    const driveImages = await fetchDriveImages();
    const localImages = IMAGES.map(src => ({
      src,
      thumb: src,
      name:  decodeURIComponent(src.split('/').pop()),
    }));
    return [...driveImages, ...localImages];
  }

  // ── Video picker ──────────────────────────────────────────

  function youtubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function openVideoPicker(blockId = null) {
    const modal = document.createElement('div');
    modal.className = 'cb-modal';

    const inner = document.createElement('div');
    inner.className = 'cb-modal-inner';

    const heading = document.createElement('p');
    heading.className = 'label';
    heading.style.marginBottom = 'var(--space-4)';
    heading.textContent = 'YouTube URL';
    inner.appendChild(heading);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'https://www.youtube.com/watch?v=...';
    input.style.cssText = 'width:100%; padding:8px; font-size:14px; border:1px solid #000; box-sizing:border-box;';
    inner.appendChild(input);

    const preview = document.createElement('div');
    preview.className = 'cb-video-wrap';
    preview.style.marginTop = 'var(--space-4)';
    inner.appendChild(preview);

    input.addEventListener('input', () => {
      const id = youtubeId(input.value.trim());
      preview.innerHTML = '';
      if (id) {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + id;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.frameBorder = '0';
        preview.appendChild(iframe);
      }
    });

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:var(--space-3); margin-top:var(--space-6);';

    const confirm = document.createElement('button');
    confirm.className = 'btn--primary';
    confirm.textContent = 'Embed';
    confirm.addEventListener('click', () => {
      const url = input.value.trim();
      if (!youtubeId(url)) return;
      if (blockId) {
        const blocks = loadBlocks();
        const b = blocks.find(b => b.id === blockId);
        if (b) { b.url = url; saveBlocks(blocks); }
      } else {
        addBlock({ type: 'video', url, fill: '#FFFFFF' });
      }
      document.body.removeChild(modal);
      render();
    });

    const cancel = document.createElement('button');
    cancel.className = 'btn--text';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => document.body.removeChild(modal));

    btnRow.appendChild(confirm);
    btnRow.appendChild(cancel);
    inner.appendChild(btnRow);

    modal.appendChild(inner);
    modal.addEventListener('click', e => {
      if (e.target === modal) document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
    input.focus();
  }

  // ── Helpers ───────────────────────────────────────────────

  function makeBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.className = 'btn--secondary';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ── Dither color & pattern ────────────────────────────────

  const DITHER_PATTERNS = [
    {
      id: 'dot',
      label: 'Dot',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='5' height='5'%3E%3Crect width='2' height='2' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'checker',
      label: 'Checker',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='2' height='2' fill='${c}'/%3E%3Crect x='2' y='2' width='2' height='2' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'fence',
      label: 'Fence',
      size: '8px 8px',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8' height='8'%3E%3Crect x='1' y='3' width='1' height='1' fill='${c}'/%3E%3Crect y='4' width='1' height='1' fill='${c}'/%3E%3Cpolygon points='2 7 1 7 1 8 2 8 3 8 4 8 4 7 3 7 3 6 2 6 2 7' fill='${c}'/%3E%3Cpolygon points='4 0 0 0 0 1 1 1 1 2 2 2 2 3 3 3 3 2 4 2 4 1 5 1 5 0 4 0' fill='${c}'/%3E%3Crect x='5' y='1' width='1' height='1' fill='${c}'/%3E%3Cpolygon points='7 3 7 2 6 2 6 3 5 3 5 4 4 4 4 5 5 5 5 6 6 6 6 7 7 7 7 6 8 6 8 5 8 4 8 3 7 3' fill='${c}'/%3E%3Crect x='7' y='7' width='1' height='1' fill='${c}'/%3E%3Crect x='3' y='5' width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'sparse',
      label: 'Sparse',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'h-lines',
      label: 'H-Lines',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='4'%3E%3Crect width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'v-lines',
      label: 'V-Lines',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='1'%3E%3Crect width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'diagonal',
      label: 'Diag',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect x='0' y='0' width='1' height='1' fill='${c}'/%3E%3Crect x='1' y='1' width='1' height='1' fill='${c}'/%3E%3Crect x='2' y='2' width='1' height='1' fill='${c}'/%3E%3Crect x='3' y='3' width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'anti-diagonal',
      label: 'Anti',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect x='3' y='0' width='1' height='1' fill='${c}'/%3E%3Crect x='2' y='1' width='1' height='1' fill='${c}'/%3E%3Crect x='1' y='2' width='1' height='1' fill='${c}'/%3E%3Crect x='0' y='3' width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'crosshatch',
      label: 'Cross',
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='1' fill='${c}'/%3E%3Crect width='1' height='4' fill='${c}'/%3E%3C/svg%3E")`,
    },
  ];

  function ditherKey() {
    return 'dither_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function patternKey() {
    return 'pattern_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function bgKey() {
    return 'bg_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function ditherSvg(hex, patternId) {
    const c = hex.replace('#', '%23');
    const p = DITHER_PATTERNS.find(p => p.id === patternId) || DITHER_PATTERNS[0];
    return p.fn(c);
  }

  function applyDither(hex, patternId) {
    const p = DITHER_PATTERNS.find(p => p.id === patternId) || DITHER_PATTERNS[0];
    document.body.style.backgroundImage = ditherSvg(hex, patternId);
    document.body.style.backgroundSize  = p.size || '';
  }

  // keep alias for existing callers
  function applyDitherColor(hex) {
    const patternId = localStorage.getItem(patternKey()) || 'dot';
    applyDither(hex, patternId);
  }

  function applyBgColor(hex) {
    document.body.style.backgroundColor = hex;
  }

  function makeSwatchRow(currentValue, onSelect) {
    const wrap = document.createElement('div');

    const swatches = document.createElement('div');
    swatches.className = 'cb-swatches';
    COLORS.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'cb-swatch';
      btn.style.backgroundColor = color.value;
      btn.title = color.label;
      if (color.value === currentValue) btn.classList.add('cb-swatch--active');
      btn.addEventListener('click', () => {
        swatches.querySelectorAll('.cb-swatch').forEach(s => s.classList.remove('cb-swatch--active'));
        btn.classList.add('cb-swatch--active');
        hexInput.value = color.value;
        onSelect(color.value);
      });
      swatches.appendChild(btn);
    });
    wrap.appendChild(swatches);

    // Hex input
    const hexRow = document.createElement('div');
    hexRow.style.cssText = 'display:flex; align-items:center; gap:var(--space-2); margin-top:var(--space-2);';

    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.value = currentValue || '';
    hexInput.placeholder = '#000000';
    hexInput.style.cssText = 'width:90px; padding:4px 6px; font-size:11pt; border:1px solid #000; font-family:monospace;';

    const hexPreview = document.createElement('div');
    hexPreview.style.cssText = 'width:20px; height:20px; border:1px solid #000; flex-shrink:0;';
    hexPreview.style.backgroundColor = currentValue || '#000000';

    hexInput.addEventListener('input', () => {
      const val = hexInput.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        hexPreview.style.backgroundColor = val;
        swatches.querySelectorAll('.cb-swatch').forEach(s => s.classList.remove('cb-swatch--active'));
        onSelect(val);
      }
    });

    hexRow.appendChild(hexInput);
    hexRow.appendChild(hexPreview);
    wrap.appendChild(hexRow);

    return wrap;
  }

  function initDither() {
    const savedDither  = localStorage.getItem(ditherKey());
    const savedPattern = localStorage.getItem(patternKey()) || 'dot';
    const savedBg      = localStorage.getItem(bgKey());

    applyDither(savedDither || '#000000', savedPattern);
    if (savedBg) applyBgColor(savedBg);

    if (!isAdmin()) return;

    const container = document.getElementById('cb-content');
    if (!container) return;

    const bar = document.createElement('div');
    bar.className = 'cb-page-settings';

    // Pattern selector
    const patternLabel = document.createElement('p');
    patternLabel.className = 'label';
    patternLabel.style.cssText = 'margin-bottom:var(--space-2);';
    patternLabel.textContent = 'Dither Pattern';
    bar.appendChild(patternLabel);

    const patternRow = document.createElement('div');
    patternRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--space-2);';

    DITHER_PATTERNS.forEach(pat => {
      const btn = document.createElement('button');
      btn.className = 'cb-pattern-btn';
      btn.title = pat.label;
      // Preview in black on white
      btn.style.backgroundImage = pat.fn('%23000');
      btn.style.backgroundColor = '#fff';
      if (pat.id === savedPattern) btn.classList.add('cb-pattern-btn--active');
      btn.addEventListener('click', () => {
        patternRow.querySelectorAll('.cb-pattern-btn').forEach(b => b.classList.remove('cb-pattern-btn--active'));
        btn.classList.add('cb-pattern-btn--active');
        localStorage.setItem(patternKey(), pat.id);
        applyDither(localStorage.getItem(ditherKey()) || '#000000', pat.id);
      });
      patternRow.appendChild(btn);
    });

    bar.appendChild(patternRow);

    // Dither color
    const ditherLabel = document.createElement('p');
    ditherLabel.className = 'label';
    ditherLabel.style.cssText = 'margin-top:var(--space-4); margin-bottom:var(--space-2);';
    ditherLabel.textContent = 'Dither Color';
    bar.appendChild(ditherLabel);
    bar.appendChild(makeSwatchRow(savedDither || '#000000', hex => {
      localStorage.setItem(ditherKey(), hex);
      applyDither(hex, localStorage.getItem(patternKey()) || 'dot');
    }));

    // Background color
    const bgLabel = document.createElement('p');
    bgLabel.className = 'label';
    bgLabel.style.cssText = 'margin-top:var(--space-4); margin-bottom:var(--space-2);';
    bgLabel.textContent = 'Background Color';
    bar.appendChild(bgLabel);
    bar.appendChild(makeSwatchRow(savedBg || '#FFFFFF', hex => {
      applyBgColor(hex);
      localStorage.setItem(bgKey(), hex);
    }));

    container.before(bar);
  }

  // ── Title editor ──────────────────────────────────────────

  function titleKey() {
    return 'title_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function initTitle() {
    const h1 = document.querySelector('h1.heading-xl');
    if (!h1) return;

    // Apply saved title for all visitors
    const saved = localStorage.getItem(titleKey());
    if (saved) h1.textContent = saved;

    if (!isAdmin()) return;

    // Make editable in admin mode
    h1.contentEditable = 'true';
    h1.classList.add('cb-title--editable');

    h1.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); h1.blur(); }
    });

    h1.addEventListener('blur', () => {
      const title = h1.textContent.trim();
      if (title) localStorage.setItem(titleKey(), title);
    });
  }

  // ── Visibility toggle ─────────────────────────────────────

  function visibilityKey() {
    return 'page_hidden_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function initVisibility() {
    if (!isAdmin()) return;

    const h1 = document.querySelector('h1.heading-xl');
    if (!h1) return;

    // Only show on known project pages, not on portfolio/index
    const filename = window.location.pathname.split('/').pop();
    if (typeof Folders !== 'undefined' && !Folders.getProjectFolder(filename)) return;

    const key = visibilityKey();

    function isHidden() {
      return localStorage.getItem(key) === 'true';
    }

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; gap:var(--space-3); margin-top:var(--space-3); flex-wrap:wrap;';

    const btn = document.createElement('button');
    btn.className = 'btn--secondary';
    btn.textContent = isHidden() ? 'Hidden from visitors' : 'Visible to visitors';

    btn.addEventListener('click', () => {
      const nowHidden = !isHidden();
      if (nowHidden) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.removeItem(key);
      }
      btn.textContent = nowHidden ? 'Hidden from visitors' : 'Visible to visitors';
    });

    // ── Rank field ─────────────────────────────────────────
    const rankKey = 'rank_' + filename.replace('.html', '');
    const rankWrap = document.createElement('div');
    rankWrap.style.cssText = 'display:flex; align-items:center; gap:6px;';

    const rankLabel = document.createElement('label');
    rankLabel.className = 'caption';
    rankLabel.textContent = 'Order:';

    const rankInput = document.createElement('input');
    rankInput.type = 'number';
    rankInput.min = '1';
    rankInput.placeholder = '—';
    rankInput.style.cssText = 'width:52px; padding:4px 6px; border:1px solid #000; font-family:inherit; font-size:13px; text-align:center;';
    const savedRank = localStorage.getItem(rankKey);
    if (savedRank) rankInput.value = savedRank;

    rankInput.addEventListener('change', () => {
      const val = rankInput.value.trim();
      if (val) {
        localStorage.setItem(rankKey, val);
      } else {
        localStorage.removeItem(rankKey);
      }
    });

    rankWrap.appendChild(rankLabel);
    rankWrap.appendChild(rankInput);

    // ── Folder selector ────────────────────────────────────
    const folderKey = 'folder_' + filename.replace('.html', '');
    const folderWrap = document.createElement('div');
    folderWrap.style.cssText = 'display:flex; align-items:center; gap:6px;';

    const folderLabel = document.createElement('label');
    folderLabel.className = 'caption';
    folderLabel.textContent = 'Folder:';

    const folderSelect = document.createElement('select');
    folderSelect.style.cssText = 'padding:4px 6px; border:1px solid #000; font-family:inherit; font-size:13px; background:#fff;';

    const labels = (typeof Folders !== 'undefined') ? Folders.getLabels() : [];
    const defaultFolder = (typeof Folders !== 'undefined') ? Folders.getProjectFolder(filename) : null;
    const savedFolder = localStorage.getItem(folderKey) || defaultFolder;

    labels.forEach(label => {
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = (typeof Folders !== 'undefined') ? Folders.getDisplayName(label) : label;
      if (label === savedFolder) opt.selected = true;
      folderSelect.appendChild(opt);
    });

    folderSelect.addEventListener('change', () => {
      const val = folderSelect.value;
      if (val === defaultFolder) {
        localStorage.removeItem(folderKey);
      } else {
        localStorage.setItem(folderKey, val);
      }
    });

    folderWrap.appendChild(folderLabel);
    folderWrap.appendChild(folderSelect);

    row.appendChild(btn);
    row.appendChild(rankWrap);
    row.appendChild(folderWrap);
    h1.parentElement.appendChild(row);
  }

  // ── Date subheading ───────────────────────────────────────

  function dateKey() {
    return 'date_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function initDate() {
    const h1 = document.querySelector('h1.heading-xl');
    if (!h1) return;

    const key = dateKey();
    const saved = localStorage.getItem(key);
    const admin = isAdmin();

    if (!saved && !admin) return;

    const el = document.createElement('p');
    el.className = 'label';
    el.style.cssText = 'color:#000000; margin-top:var(--space-2);';

    if (saved) {
      el.textContent = saved;
    } else {
      el.textContent = 'Add a date...';
      el.style.opacity = '0.35';
    }

    if (admin) {
      el.contentEditable = 'true';
      el.classList.add('cb-title--editable');

      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
      });

      el.addEventListener('focus', () => {
        if (!localStorage.getItem(key)) {
          el.textContent = '';
          el.style.opacity = '1';
        }
      });

      el.addEventListener('blur', () => {
        const val = el.textContent.trim();
        if (val) {
          localStorage.setItem(key, val);
          el.style.opacity = '1';
        } else {
          localStorage.removeItem(key);
          el.textContent = 'Add a date...';
          el.style.opacity = '0.35';
        }
      });
    }

    h1.after(el);
  }

  // ── Init ──────────────────────────────────────────────────

  function initFolderLabel() {
    const btn = document.querySelector('.page-top .btn--text');
    if (!btn) return;
    const filename = window.location.pathname.split('/').pop().replace('.html', '');
    const saved = localStorage.getItem('folder_' + filename);
    if (!saved) return;
    for (let i = btn.childNodes.length - 1; i >= 0; i--) {
      const node = btn.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        node.textContent = node.textContent.replace(node.textContent.trim(), saved);
        break;
      }
    }
  }

  function init() {
    createToolbar();
    initDither();
    initTitle();
    initDate();
    initVisibility();
    initFolderLabel();
    render();
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', () => ContentBuilder.init());
