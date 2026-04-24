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

  const HEADER_ICONS = [
    { label: 'Pages',       src: 'icons/pages.svg'            },
    { label: 'Page',        src: 'icons/page.svg'             },
    { label: 'Computer',    src: 'icons/computer.svg'         },
    { label: 'Folder',      src: 'icons/folder.svg'           },
    { label: 'Folder Open', src: 'icons/folder-open.svg'      },
    { label: 'Mac',         src: 'icons/mac45.svg'            },
    { label: 'Mac 5',       src: 'icons/Mac5.svg'             },
    { label: '184',         src: 'icons/184.svg'              },
    { label: '-68',         src: 'icons/-68.svg'              },
    { label: '-69',         src: 'icons/-69.svg'              },
    { label: '-72',         src: 'icons/-72.svg'              },
    { label: '-78',         src: 'icons/-78.svg'              },
    { label: 'Comm 3',      src: 'icons/Communication3.svg'   },
    { label: 'Comm 8',      src: 'icons/Communication8.svg'   },
    { label: 'Comm 11',     src: 'icons/Communication11.svg'  },
    { label: 'Comm 13',     src: 'icons/Communication13.svg'  },
    { label: 'Comm 56',     src: 'icons/Communication56.svg'  },
    { label: 'Misc 7',      src: 'icons/_Ends__Odds7.svg'     },
    { label: 'Misc 17',     src: 'icons/_Ends__Odds17.svg'    },
    { label: 'Misc 62',     src: 'icons/_Ends__Odds62.svg'    },
    { label: 'Arrow Up',    src: 'icons/arrow up.svg'         },
    { label: 'Arrow Down',  src: 'icons/arrow down.svg'       },
    { label: 'Arrow Left',  src: 'icons/arrow left.svg'       },
    { label: 'Arrow Right', src: 'icons/arrow right.svg'      },
  ];

  const SVG_ARROW_UP   = `<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.58824 0.79469V1.19204H6.17647H5.76471V1.58939V1.98674H5.35294H4.94118V2.38409V2.78144H4.52941H4.11765V3.1788V3.57615H3.70588H3.29412V3.9735V4.37085H2.88235H2.47059V4.7682V5.16555H2.05882H1.64706V5.5629V5.96025H1.23529H0.823529V6.3576V6.75495H0.411765H0V7.15231V7.54966H2.05882H4.11765V9.77482V12H7H9.88235V9.77617V7.55236L11.9618 7.53114L14.0412 7.50992L14.0655 7.11257L14.0898 6.71522L13.6331 6.74248L13.1765 6.76966V6.36499V5.96025H12.7647H12.3529V5.5629V5.16555H11.9412H11.5294V4.7682V4.37085H11.1176H10.7059V3.9735V3.57615H10.2941H9.88235V3.1788V2.78144H9.47059H9.05882V2.38409V1.98674H8.64706H8.23529V1.58939V1.19204H7.82353H7.41176V0.79469V0.397339H7H6.58824V0.79469ZM0.0247059 7.15231C0.0247059 7.3927 0.0401059 7.49109 0.0589647 7.37085C0.0778235 7.25061 0.0778235 7.054 0.0589647 6.93376C0.0401059 6.81352 0.0247059 6.91191 0.0247059 7.15231Z" fill="currentColor"/></svg>`;
  const SVG_ARROW_DOWN = `<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.11765 2.78144V5.16555H2.05882H0V5.5629V5.96025H0.411765H0.823529V6.3576V6.75495H1.23529H1.64706V7.15231V7.54966H2.05882H2.47059V7.94701V8.34436H2.88235H3.29412V8.74171V9.13906H3.70588H4.11765V9.53641V9.93376H4.52941H4.94118V10.3311V10.7285H5.35294H5.76471V11.1258V11.5232H6.17647C6.57909 11.5232 6.58824 11.5285 6.58824 11.7616C6.58824 11.9947 6.59738 12 7 12C7.40262 12 7.41176 11.9947 7.41176 11.7616C7.41176 11.5285 7.42091 11.5232 7.82353 11.5232H8.23529V11.1258V10.7285H8.64706H9.05882V10.3311V9.93376H9.47059H9.88235V9.53641V9.13906H10.2941H10.7059V8.74171V8.34436H11.1176H11.5294V7.94701V7.54966H11.9412H12.3529V7.15231V6.75495H12.7647H13.1765V6.36174V5.9686L13.6088 5.94452L14.0412 5.92052L14.0654 5.52317L14.0897 5.12582L11.986 5.14831L9.88235 5.1708V2.78407V0.397339H7H4.11765V2.78144ZM0.0247059 5.5629C0.0247059 5.8033 0.0401059 5.90168 0.0589647 5.78144C0.0778235 5.66121 0.0778235 5.4646 0.0589647 5.34436C0.0401059 5.22412 0.0247059 5.3225 0.0247059 5.5629Z" fill="currentColor"/></svg>`;

  const openSettings = new Set();

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
    renderSectionsList();
  }

  function renderBlock(block, index, total, admin, nextBlock) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-block';
    if (block.hugTop) wrap.classList.add('cb-block--hug-top');

    // ── Section block ────────────────────────────────────────
    if (block.type === 'section') {
      if (admin) {
        wrap.style.cssText = 'background-color:rgba(255,255,255,0.5); border:1px dashed #D4D4D4;';
        wrap.appendChild(renderSectionControls(block.id, index, total, block));
      } else {
        wrap.id = 'cb-section-' + block.id;
        wrap.style.cssText = 'background:transparent; border:none; padding:0; margin:0; height:0; overflow:hidden;';
      }
      return wrap;
    }

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
        wrap.classList.add('cb-spacer');
        wrap.style.cssText = 'background:transparent; border:none; padding:0;';
        wrap.style.setProperty('--spacer-h', height + 'px');
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

      // Apply padding and alignment settings
      const pad   = block.imagePadding;
      const align = block.imageAlign || 'left';
      const hug   = pad === 'hug';
      const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

      if (hug) {
        const maxScale = Math.max(...images.map(i => i.scale || 100));
        wrap.style.backgroundColor = 'transparent';
        wrap.style.border = 'none';
        wrap.style.display = 'flex';
        wrap.style.justifyContent = justifyMap[align] || 'flex-start';
        wrap.style.alignItems = 'flex-start';
        imgWrap.style.backgroundColor = fill;
        imgWrap.style.border = '1px solid #000000';
        imgWrap.style.width = maxScale + '%';
      } else if (pad === 'centered') {
        imgWrap.style.padding = '32px';
        imgWrap.style.display = 'flex';
        imgWrap.style.flexDirection = 'column';
        imgWrap.style.alignItems = 'center';
      } else if (pad) {
        imgWrap.style.padding = pad + 'px';
      }

      const flow = block.imageFlow || 'vertical';
      if (flow === 'horizontal') {
        imgWrap.style.flexDirection = 'row';
        imgWrap.style.alignItems = 'flex-start';
      }

      images.forEach((imgData, imgIndex) => {
        const imgRow = document.createElement('div');
        imgRow.className = 'cb-image-row';
        if (flow === 'horizontal') imgRow.style.flex = '1';

        const img = document.createElement('img');
        img.src       = imgData.src;
        img.alt       = imgData.alt || '';
        img.className = 'cb-image';
        if (hug) {
          img.style.width = '100%';
        } else {
          img.style.width = (imgData.scale || 100) + '%';
          if (align === 'center') { img.style.marginLeft = 'auto'; img.style.marginRight = 'auto'; }
          else if (align === 'right') { img.style.marginLeft = 'auto'; img.style.marginRight = '0'; }
        }
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

    if (index > 0)         actions.appendChild(makeArrowBtn(SVG_ARROW_UP,   () => moveBlock(id, -1)));
    if (index < total - 1) actions.appendChild(makeArrowBtn(SVG_ARROW_DOWN, () => moveBlock(id,  1)));

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

    // Settings + Remove group, pushed to the right
    const rightGroup = document.createElement('div');
    rightGroup.style.cssText = 'display:flex; align-items:center; gap:32px; margin-left:auto;';

    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'btn--secondary cb-scale-btn';
    settingsBtn.textContent = '⚙ Settings';
    if (openSettings.has(id)) settingsBtn.classList.add('cb-scale-btn--active');
    settingsBtn.addEventListener('click', () => {
      openSettings.has(id) ? openSettings.delete(id) : openSettings.add(id);
      render();
    });

    const del = makeBtn('✕ Remove', () => deleteBlock(id));
    del.classList.add('cb-btn--delete');

    rightGroup.appendChild(settingsBtn);
    rightGroup.appendChild(del);
    actions.appendChild(rightGroup);

    wrap.appendChild(actions);

    // Collapsible settings panel
    if (openSettings.has(id)) {
      const panel = document.createElement('div');
      panel.style.cssText = 'padding-top:var(--space-3); display:flex; flex-direction:column; gap:var(--space-3);';

      // Fill
      const fillSection = document.createElement('div');
      const swatchLabel = document.createElement('p');
      swatchLabel.className = 'label';
      swatchLabel.style.cssText = 'margin-bottom:var(--space-2); color:inherit;';
      swatchLabel.textContent = 'Fill';
      fillSection.appendChild(swatchLabel);

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
      fillSection.appendChild(swatches);
      panel.appendChild(fillSection);

      // Image-only controls
      if (block.type === 'image') {
        // Padding
        const padSection = document.createElement('div');
        const padLabel = document.createElement('p');
        padLabel.className = 'label';
        padLabel.style.cssText = 'margin-bottom:var(--space-2); color:inherit;';
        padLabel.textContent = 'Padding';
        padSection.appendChild(padLabel);

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
          { label: 'Hug',    value: 'hug'      },
        ];
        PAD_OPTIONS.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'btn--secondary cb-scale-btn';
          btn.textContent = opt.label;
          if ((block.imagePadding || '1') === opt.value) btn.classList.add('cb-scale-btn--active');
          btn.addEventListener('click', () => setPadding(block.id, opt.value));
          padRow.appendChild(btn);
        });
        padSection.appendChild(padRow);
        panel.appendChild(padSection);

        // Align
        const alignSection = document.createElement('div');
        const alignLabel = document.createElement('p');
        alignLabel.className = 'label';
        alignLabel.style.cssText = 'margin-bottom:var(--space-2); color:inherit;';
        alignLabel.textContent = 'Align';
        alignSection.appendChild(alignLabel);

        const alignRow = document.createElement('div');
        alignRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--space-2);';
        [{ label: '← Left', value: 'left' }, { label: '⊛ Center', value: 'center' }, { label: 'Right →', value: 'right' }].forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'btn--secondary cb-scale-btn';
          btn.textContent = opt.label;
          if ((block.imageAlign || 'left') === opt.value) btn.classList.add('cb-scale-btn--active');
          btn.addEventListener('click', () => setAlignment(block.id, opt.value));
          alignRow.appendChild(btn);
        });
        alignSection.appendChild(alignRow);
        panel.appendChild(alignSection);

        // Layout (2+ images only)
        if (normalizeImages(block).length > 1) {
          const flowSection = document.createElement('div');
          const flowLabel = document.createElement('p');
          flowLabel.className = 'label';
          flowLabel.style.cssText = 'margin-bottom:var(--space-2); color:inherit;';
          flowLabel.textContent = 'Layout';
          flowSection.appendChild(flowLabel);

          const flowRow = document.createElement('div');
          flowRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--space-2);';
          [{ label: '↓ Vertical', value: 'vertical' }, { label: '→ Horizontal', value: 'horizontal' }].forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn--secondary cb-scale-btn';
            btn.textContent = opt.label;
            if ((block.imageFlow || 'vertical') === opt.value) btn.classList.add('cb-scale-btn--active');
            btn.addEventListener('click', () => setImageFlow(block.id, opt.value));
            flowRow.appendChild(btn);
          });
          flowSection.appendChild(flowRow);
          panel.appendChild(flowSection);
        }

        // Add image button
        const addImgBtn = document.createElement('button');
        addImgBtn.className = 'btn--secondary';
        addImgBtn.textContent = '+ Add Image';
        addImgBtn.addEventListener('click', () => openImagePicker(block.id));
        panel.appendChild(addImgBtn);
      }

      wrap.appendChild(panel);
    }

    return wrap;
  }

  function renderSpacerControls(id, index, total, block, nextBlock) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-controls';

    const actions = document.createElement('div');
    actions.className = 'cb-actions';

    if (index > 0)         actions.appendChild(makeArrowBtn(SVG_ARROW_UP,   () => moveBlock(id, -1)));
    if (index < total - 1) actions.appendChild(makeArrowBtn(SVG_ARROW_DOWN, () => moveBlock(id,  1)));

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

  function renderSectionControls(id, index, total, block) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-controls';

    const actions = document.createElement('div');
    actions.className = 'cb-actions';

    const sectionLabel = document.createElement('span');
    sectionLabel.className = 'label';
    sectionLabel.style.cssText = 'color:inherit; flex-shrink:0;';
    sectionLabel.textContent = '§ Section';
    actions.appendChild(sectionLabel);

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = block.sectionTitle || '';
    titleInput.placeholder = 'Section title…';
    titleInput.style.cssText = 'padding:4px 6px; border:1px solid #000; font-family:inherit; font-size:13px; flex:1; min-width:0;';
    titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') titleInput.blur(); });
    titleInput.addEventListener('blur', () => setSectionTitle(id, titleInput.value.trim()));
    actions.appendChild(titleInput);

    const rightGroup = document.createElement('div');
    rightGroup.style.cssText = 'display:flex; align-items:center; gap:var(--space-2); margin-left:auto;';

    if (index > 0)         rightGroup.appendChild(makeArrowBtn(SVG_ARROW_UP,   () => moveBlock(id, -1)));
    if (index < total - 1) rightGroup.appendChild(makeArrowBtn(SVG_ARROW_DOWN, () => moveBlock(id,  1)));

    const del = makeBtn('✕ Remove', () => deleteBlock(id));
    del.classList.add('cb-btn--delete');
    rightGroup.appendChild(del);
    actions.appendChild(rightGroup);

    wrap.appendChild(actions);
    return wrap;
  }

  function setSectionTitle(id, title) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.sectionTitle = title; saveBlocks(blocks); }
    renderSectionsList();
  }

  function renderSectionsList() {
    const h1 = document.querySelector('h1.heading-xl');
    if (!h1) return;

    const existing = document.getElementById('cb-sections-nav');
    if (existing) existing.remove();

    const blocks = loadBlocks();
    const sections = blocks.filter(b => b.type === 'section' && b.sectionTitle);
    if (sections.length < 2) return;

    const nav = document.createElement('div');
    nav.id = 'cb-sections-nav';
    nav.className = 'page-content page-content--wide';
    nav.style.cssText = 'margin-top:var(--space-4); display:flex; flex-direction:column; align-items:flex-start; gap:var(--space-1);';

    sections.forEach(b => {
      const link = document.createElement('button');
      link.className = 'btn--primary';
      link.style.cssText = 'display:flex; align-items:center; gap:6px;';

      const icon = document.createElement('img');
      icon.src = 'icons/page.svg';
      icon.style.cssText = 'width:auto; height:1em; flex-shrink:0;';
      link.appendChild(icon);
      link.appendChild(document.createTextNode(b.sectionTitle));

      link.addEventListener('click', () => {
        const target = document.getElementById('cb-section-' + b.id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
      nav.appendChild(link);
    });

    h1.parentElement.parentElement.insertAdjacentElement('afterend', nav);
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

    const sectionBtn = document.createElement('button');
    sectionBtn.className = 'btn--secondary';
    sectionBtn.textContent = '+ Section Block';
    sectionBtn.addEventListener('click', () => addBlock({ type: 'section', sectionTitle: '' }));

    bar.appendChild(textBtn);
    bar.appendChild(imgBtn);
    bar.appendChild(vidBtn);
    bar.appendChild(spacerBtn);
    bar.appendChild(sectionBtn);
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

  function setAlignment(id, value) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.imageAlign = value; saveBlocks(blocks); }
    render();
  }

  function setImageFlow(id, value) {
    const blocks = loadBlocks();
    const b = blocks.find(b => b.id === id);
    if (b) { b.imageFlow = value; saveBlocks(blocks); }
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

  function makeArrowBtn(svgHtml, onClick) {
    const btn = document.createElement('button');
    btn.className = 'btn--secondary';
    btn.innerHTML = svgHtml;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ── Dither color & pattern ────────────────────────────────

  const DITHER_PATTERNS = [
    {
      id: 'dot',      label: 'Dot',      w: 5, h: 5,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='5' height='5'%3E%3Crect width='2' height='2' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'checker',  label: 'Checker',  w: 4, h: 4,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='2' height='2' fill='${c}'/%3E%3Crect x='2' y='2' width='2' height='2' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'fence',    label: 'Fence',    w: 8, h: 8,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8' height='8'%3E%3Crect x='1' y='3' width='1' height='1' fill='${c}'/%3E%3Crect y='4' width='1' height='1' fill='${c}'/%3E%3Cpolygon points='2 7 1 7 1 8 2 8 3 8 4 8 4 7 3 7 3 6 2 6 2 7' fill='${c}'/%3E%3Cpolygon points='4 0 0 0 0 1 1 1 1 2 2 2 2 3 3 3 3 2 4 2 4 1 5 1 5 0 4 0' fill='${c}'/%3E%3Crect x='5' y='1' width='1' height='1' fill='${c}'/%3E%3Cpolygon points='7 3 7 2 6 2 6 3 5 3 5 4 4 4 4 5 5 5 5 6 6 6 6 7 7 7 7 6 8 6 8 5 8 4 8 3 7 3' fill='${c}'/%3E%3Crect x='7' y='7' width='1' height='1' fill='${c}'/%3E%3Crect x='3' y='5' width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'sparse',   label: 'Sparse',   w: 8, h: 8,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'h-lines',  label: 'H-Lines',  w: 1, h: 4,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='4'%3E%3Crect width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'v-lines',  label: 'V-Lines',  w: 4, h: 1,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='1'%3E%3Crect width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'diagonal', label: 'Diag',     w: 4, h: 4,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect x='0' y='0' width='1' height='1' fill='${c}'/%3E%3Crect x='1' y='1' width='1' height='1' fill='${c}'/%3E%3Crect x='2' y='2' width='1' height='1' fill='${c}'/%3E%3Crect x='3' y='3' width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'anti-diagonal', label: 'Anti', w: 4, h: 4,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect x='3' y='0' width='1' height='1' fill='${c}'/%3E%3Crect x='2' y='1' width='1' height='1' fill='${c}'/%3E%3Crect x='1' y='2' width='1' height='1' fill='${c}'/%3E%3Crect x='0' y='3' width='1' height='1' fill='${c}'/%3E%3C/svg%3E")`,
    },
    {
      id: 'crosshatch', label: 'Cross',  w: 4, h: 4,
      fn: c => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='1' fill='${c}'/%3E%3Crect width='1' height='4' fill='${c}'/%3E%3C/svg%3E")`,
    },
  ];

  function ditherKey() {
    return 'dither_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function patternKey() {
    return 'pattern_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function ditherScaleKey() {
    return 'dither_scale_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function bgKey() {
    return 'bg_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function ditherSvg(hex, patternId) {
    const c = hex.replace('#', '%23');
    const p = DITHER_PATTERNS.find(p => p.id === patternId) || DITHER_PATTERNS[0];
    return p.fn(c);
  }

  function applyDither(hex, patternId, scale) {
    if (scale === undefined) scale = parseFloat(localStorage.getItem(ditherScaleKey()) || '1');
    const p = DITHER_PATTERNS.find(p => p.id === patternId) || DITHER_PATTERNS[0];
    document.body.style.backgroundImage = ditherSvg(hex, patternId);
    document.body.style.backgroundSize  = scale === 1 ? '' : `${p.w * scale}px ${p.h * scale}px`;
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

    const savedScale = parseFloat(localStorage.getItem(ditherScaleKey()) || '1');
    applyDither(savedDither || '#000000', savedPattern, savedScale);
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

    // Pattern scale
    const scaleLabel = document.createElement('p');
    scaleLabel.className = 'label';
    scaleLabel.style.cssText = 'margin-top:var(--space-4); margin-bottom:var(--space-2);';
    scaleLabel.textContent = 'Pattern Scale';
    bar.appendChild(scaleLabel);

    const scaleRow = document.createElement('div');
    scaleRow.style.cssText = 'display:flex; gap:var(--space-2);';
    const currentScale = parseFloat(localStorage.getItem(ditherScaleKey()) || '1');

    [1, 1.5, 2, 4].forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'btn--secondary cb-scale-btn';
      btn.textContent = s + 'x';
      if (s === currentScale) btn.classList.add('cb-scale-btn--active');
      btn.addEventListener('click', () => {
        scaleRow.querySelectorAll('.cb-scale-btn').forEach(b => b.classList.remove('cb-scale-btn--active'));
        btn.classList.add('cb-scale-btn--active');
        localStorage.setItem(ditherScaleKey(), s);
        applyDither(localStorage.getItem(ditherKey()) || '#000000', localStorage.getItem(patternKey()) || 'dot', s);
      });
      scaleRow.appendChild(btn);
    });

    bar.appendChild(scaleRow);

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

    // ── Gear button + settings panel ──────────────────────────
    const SVG_GEAR = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 0H8V2H10V4H12V8H10V10H8V12H4V10H2V8H0V4H2V2H4V0ZM4 4H8V8H4V4Z"/></svg>`;

    const gearBtn = document.createElement('button');
    gearBtn.className = 'btn--secondary';
    gearBtn.innerHTML = SVG_GEAR;
    gearBtn.title = 'Header settings';
    gearBtn.style.cssText = 'padding:0 10px; flex-shrink:0;';

    const panel = document.createElement('div');
    panel.style.cssText = 'margin-top:var(--space-3); padding:var(--space-3) var(--space-4); border:1px solid #000; background:#fff; flex-direction:column; gap:var(--space-4);';
    panel.style.display = 'none';

    // Fill section
    const fillKey      = headerFillKey();
    const opacityKey   = 'header_opacity_' + filename.replace('.html', '');
    const textColorKey = 'header_text_color_' + filename.replace('.html', '');
    const savedFill    = localStorage.getItem(fillKey);
    const titleCard    = h1.parentElement;

    function applyFill(hex, opacity) {
      if (opacity === undefined) opacity = parseInt(localStorage.getItem(opacityKey) ?? '100', 10);
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      titleCard.style.backgroundColor = opacity < 100 ? `rgba(${r},${g},${b},${opacity/100})` : hex;
      titleCard.style.borderColor = isDarkFill(hex) ? '#FFFFFF' : '#000000';
      const savedTextColor = localStorage.getItem(textColorKey);
      const textColor = savedTextColor || (isDarkFill(hex) ? '#FFFFFF' : '#000000');
      h1.style.color = textColor;
    }

    const fillLabel = document.createElement('p');
    fillLabel.className = 'label';
    fillLabel.style.marginBottom = 'var(--space-2)';
    fillLabel.textContent = 'Header Fill';
    panel.appendChild(fillLabel);
    panel.appendChild(makeSwatchRow(savedFill || '#FFFFFF', hex => {
      localStorage.setItem(fillKey, hex);
      applyFill(hex);
    }));

    // Opacity slider
    const opacityLabel = document.createElement('p');
    opacityLabel.className = 'label';
    opacityLabel.style.cssText = 'margin-bottom:var(--space-2); margin-top:var(--space-3);';
    opacityLabel.textContent = 'Opacity';
    panel.appendChild(opacityLabel);

    const opacityRow = document.createElement('div');
    opacityRow.style.cssText = 'display:flex; align-items:center; gap:var(--space-2);';

    const savedOpacity = parseInt(localStorage.getItem(opacityKey) ?? '100', 10);
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '100';
    opacitySlider.value = savedOpacity;
    opacitySlider.style.cssText = 'flex:1;';

    const opacityDisplay = document.createElement('span');
    opacityDisplay.className = 'label';
    opacityDisplay.style.cssText = 'width:3em; text-align:right;';
    opacityDisplay.textContent = savedOpacity + '%';

    opacitySlider.addEventListener('input', () => {
      const val = parseInt(opacitySlider.value, 10);
      opacityDisplay.textContent = val + '%';
      localStorage.setItem(opacityKey, val);
      applyFill(localStorage.getItem(fillKey) || '#FFFFFF', val);
    });

    opacityRow.appendChild(opacitySlider);
    opacityRow.appendChild(opacityDisplay);
    panel.appendChild(opacityRow);

    // Text color
    const textColorLabel = document.createElement('p');
    textColorLabel.className = 'label';
    textColorLabel.style.cssText = 'margin-bottom:var(--space-2); margin-top:var(--space-3);';
    textColorLabel.textContent = 'Header Text Color';
    panel.appendChild(textColorLabel);
    const savedTextColor = localStorage.getItem(textColorKey);
    panel.appendChild(makeSwatchRow(savedTextColor || (isDarkFill(savedFill || '#FFFFFF') ? '#FFFFFF' : '#000000'), hex => {
      localStorage.setItem(textColorKey, hex);
      h1.style.color = hex;
      const backLink = titleCard.querySelector('.btn--secondary');
      if (backLink) backLink.style.color = hex;
    }));

    // Icon section
    const iconKey   = 'header_icon_' + filename.replace('.html', '');
    const savedIcon = localStorage.getItem(iconKey) || 'icons/pages.svg';

    const iconLabel = document.createElement('p');
    iconLabel.className = 'label';
    iconLabel.style.marginBottom = 'var(--space-2)';
    iconLabel.textContent = 'Header Icon';
    panel.appendChild(iconLabel);

    const iconRow = document.createElement('div');
    iconRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--space-2);';
    panel.appendChild(iconRow);

    function buildIconButtons(icons) {
      iconRow.innerHTML = '';
      icons.forEach(def => {
        const iconBtn = document.createElement('button');
        iconBtn.className = 'btn--secondary cb-scale-btn';
        iconBtn.style.cssText = 'padding:4px 8px; background:#D4D4D4;';
        iconBtn.title = def.label;
        if (def.src === savedIcon) iconBtn.classList.add('cb-scale-btn--active');

        const img = document.createElement('img');
        img.src = def.src;
        img.alt = def.label;
        img.style.cssText = 'height:28px; width:auto; display:block;';
        iconBtn.appendChild(img);

        iconBtn.addEventListener('click', () => {
          localStorage.setItem(iconKey, def.src);
          const headerIcon = document.getElementById('cb-header-icon');
          if (headerIcon) headerIcon.src = def.src;
          iconRow.querySelectorAll('.cb-scale-btn').forEach(b => b.classList.remove('cb-scale-btn--active'));
          iconBtn.classList.add('cb-scale-btn--active');
        });

        iconRow.appendChild(iconBtn);
      });
    }

    // Folder button style
    const folderStyleKey = 'header_folder_style_' + filename.replace('.html', '');
    const savedFolderStyle = localStorage.getItem(folderStyleKey) || 'black';
    const backLink = titleCard.querySelector('.btn--text');
    if (backLink) backLink.classList.add('btn--text--' + savedFolderStyle);

    const folderStyleLabel = document.createElement('p');
    folderStyleLabel.className = 'label';
    folderStyleLabel.style.cssText = 'margin-bottom:var(--space-2); margin-top:var(--space-3);';
    folderStyleLabel.textContent = 'Folder Button';
    panel.appendChild(folderStyleLabel);

    const folderStyleRow = document.createElement('div');
    folderStyleRow.style.cssText = 'display:flex; gap:var(--space-2);';
    ['black', 'white'].forEach(variant => {
      const btn = document.createElement('button');
      btn.className = 'btn--secondary cb-scale-btn';
      btn.textContent = variant.charAt(0).toUpperCase() + variant.slice(1);
      if (variant === savedFolderStyle) btn.classList.add('cb-scale-btn--active');
      btn.addEventListener('click', () => {
        folderStyleRow.querySelectorAll('.cb-scale-btn').forEach(b => b.classList.remove('cb-scale-btn--active'));
        btn.classList.add('cb-scale-btn--active');
        localStorage.setItem(folderStyleKey, variant);
        if (backLink) {
          backLink.classList.remove('btn--text--black', 'btn--text--white');
          backLink.classList.add('btn--text--' + variant);
        }
      });
      folderStyleRow.appendChild(btn);
    });
    panel.appendChild(folderStyleRow);

    let iconsLoaded = false;
    gearBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = panel.style.display === 'flex';
      panel.style.display = isOpen ? 'none' : 'flex';
      gearBtn.style.background = isOpen ? '' : '#000';
      gearBtn.style.color = isOpen ? '' : '#fff';

      if (!isOpen && !iconsLoaded) {
        iconsLoaded = true;
        fetch('/api/icons')
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(icons => buildIconButtons(icons))
          .catch(() => buildIconButtons(HEADER_ICONS));
      }
    });

    row.appendChild(btn);
    row.appendChild(rankWrap);
    row.appendChild(folderWrap);
    row.appendChild(gearBtn);
    titleCard.appendChild(row);
    titleCard.appendChild(panel);
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

    h1.parentElement.after(el);
  }

  // ── Init ──────────────────────────────────────────────────

  // ── Header fill ───────────────────────────────────────────

  function headerFillKey() {
    return 'header_fill_' + window.location.pathname.split('/').pop().replace('.html', '');
  }

  function initHeaderFill() {
    const h1 = document.querySelector('h1.heading-xl');
    if (!h1) return;
    const slug    = window.location.pathname.split('/').pop().replace('.html', '');
    const titleCard = h1.closest('.page-top');
    const backLink  = document.querySelector('.page-top .btn--text');
    const savedFolderStyle = localStorage.getItem('header_folder_style_' + slug) || 'black';
    if (backLink) backLink.classList.add('btn--text--' + savedFolderStyle);
    const saved = localStorage.getItem(headerFillKey());
    if (!saved) return;
    const opacity = parseInt(localStorage.getItem('header_opacity_' + slug) ?? '100', 10);
    const r = parseInt(saved.slice(1,3), 16);
    const g = parseInt(saved.slice(3,5), 16);
    const b = parseInt(saved.slice(5,7), 16);
    const savedTextColor = localStorage.getItem('header_text_color_' + slug);
    titleCard.style.backgroundColor = opacity < 100 ? `rgba(${r},${g},${b},${opacity/100})` : saved;
    titleCard.style.borderColor = isDarkFill(saved) ? '#FFFFFF' : '#000000';
    const textColor = savedTextColor || (isDarkFill(saved) ? '#FFFFFF' : '#000000');
    h1.style.color = textColor;
  }


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

  function initPageIcon() {
    const h1 = document.querySelector('h1.heading-xl');
    if (!h1) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex; align-items:flex-start; gap:8px;';
    h1.parentElement.insertBefore(wrapper, h1);
    wrapper.appendChild(h1);

    const slug = window.location.pathname.split('/').pop().replace('.html', '');
    const savedSrc = localStorage.getItem('header_icon_' + slug) || 'icons/pages.svg';

    const icon = document.createElement('img');
    icon.id = 'cb-header-icon';
    icon.src = savedSrc;
    icon.alt = '';
    icon.className = 'cb-header-icon';
    icon.style.cssText = 'height:' + getComputedStyle(h1).fontSize + '; width:auto; flex-shrink:0;';
    wrapper.prepend(icon);
  }

  function init() {
    createToolbar();
    initDither();
    initTitle();
    initPageIcon();
    initDate();
    initVisibility();
    initHeaderFill();
    initFolderLabel();
    render();
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', () => ContentBuilder.init());
