/* Adapted from https://github.com/hlxsites/cai/blob/main/blocks/cai/cai.js */

function generateOverlay(data) {
  return document.createRange().createContextualFragment(`
    <div class="credentials-overlay">
      ${data.thumbnail}
      <div>${data.claim_generator}</div>
    </div>`);
}

function removeOverlay(root) {
  root.querySelector('.credentials-overlay').remove();
}

const c2paData = async (imagePath) => {
  // Fails on localhost
  const subDomain = window.location.origin.split('://')[1].split('.')[0];
  const res = await fetch(`http://localhost:3000/metadata${imagePath}?subDomain=${subDomain}`);
  const data = await res.json();
  return generateOverlay(data);
};

function insertLoader(root) {
  const overlay = document.createElement('div');
  overlay.classList.add('credentials-overlay');
  overlay.innerHTML = '<div class="loader"></div>';
  root.appendChild(overlay);
}

function insertOverlay(root, node) {
  if (node === 'Empty') return;
  if (!node) return;
  root.appendChild(node);
}

export default function decorate(block) {
  let c2pa = 'Empty';
  const image = block.querySelector('img');
  const [src] = image.src.split('?');
  const nocorsURL = `https://little-forest-58aa.david8603.workers.dev/?url=${src}`;
  const crOverlay = document.createElement('a');
  crOverlay.classList.add('cai-overlay');
  crOverlay.href = `https://contentcredentials.org/verify?source=${encodeURIComponent(nocorsURL)}`;
  crOverlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 28 28" preserveAspectRatio="xMidYMid meet" part="svg">
      <g>
          <path fill="white" d="M1.45605 14C1.45605 7.06999 7.07006 1.45599 14.0001 1.45599C20.9301 1.45599 26.5441 7.06999 26.5441 14V26.544H14.0001C7.07006 26.544 1.45605 20.93 1.45605 14Z"></path>
          <path fill="#141414" fill-rule="evenodd" d="M25.578 14V25.578H14C7.602 25.578 2.422 20.398 2.422 14C2.422 7.602 7.602 2.422 14 2.422C20.398 2.422 25.578 7.602 25.578 14ZM0 14C0 6.272 6.272 0 14 0C21.728 0 28 6.272 28 14V28H14C6.272 28 0 21.728 0 14ZM5.572 14.56C5.572 17.444 7.518 19.88 10.612 19.88C13.16 19.88 14.882 18.2 15.302 16.002H12.782C12.46 17.01 11.648 17.626 10.612 17.626C9.044 17.626 8.022 16.394 8.022 14.56C8.022 12.726 9.044 11.494 10.612 11.494C11.62 11.494 12.418 12.068 12.754 13.02H15.288C14.84 10.878 13.132 9.24 10.612 9.24C7.504 9.24 5.572 11.676 5.572 14.56ZM18.676 9.52H16.296V19.614H18.774V14.35C18.774 13.356 19.054 12.712 19.53 12.306C19.95 11.928 20.496 11.732 21.392 11.732H22.022V9.394H21.406C20.104 9.394 19.236 9.87 18.676 10.598V9.506V9.52Z" clip-rule="evenodd"></path>
      </g>
      </svg>`;
  block.append(crOverlay);
  const { pathname } = new URL(src);

  crOverlay.addEventListener('mouseenter', async () => {
    try {
      block.querySelector('.credentials-overlay')?.classList?.remove('hidden');
      if (c2pa === 'Empty') {
        insertLoader(block);
        c2pa = 'Waiting';
        c2pa = await c2paData(pathname);
        removeOverlay(block);
        insertOverlay(block, c2pa);
      }
    } catch (e) {
      console.log(e);
      removeOverlay(block);
    }
  });
  crOverlay.addEventListener('mouseleave', () => {
    block.querySelector('.credentials-overlay')?.classList?.add('hidden');
  });
}
