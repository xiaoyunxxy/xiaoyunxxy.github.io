// Homepage enhancements. Runs before town.js so the town dialog copies the same markup.
(() => {
  'use strict';
  // News: "- *2026.09*: text" -> <time>2026.09</time><span class="news-body">text</span>
  const list = document.querySelector('#news + ul');
  if (!list) return;
  list.classList.add('news-list');
  for (const li of list.children) {
    const em = li.firstElementChild;
    if (!em || em.tagName !== 'EM' || li.firstChild !== em) continue;
    const time = document.createElement('time');
    time.textContent = em.textContent.trim();
    em.remove();
    const body = document.createElement('span');
    body.className = 'news-body';
    while (li.firstChild) body.append(li.firstChild);
    if (body.firstChild && body.firstChild.nodeType === 3) body.firstChild.textContent = body.firstChild.textContent.replace(/^\s*:\s*/, '');
    li.append(time, body);
  }
})();
