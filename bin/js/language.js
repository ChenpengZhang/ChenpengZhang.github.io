(() => {
  'use strict';

  const button = document.querySelector('.language-toggle');
  if (!button) return;

  const storageKey = 'homepage-language';
  const description = document.querySelector('meta[name="description"]');
  const englishTitle = document.title;
  const englishDescription = description?.content;
  const textEntries = Array.from(document.querySelectorAll('body [data-zh]'), element => ({
    element,
    // Keep intentional line breaks without inserting HTML from translations.
    englishNodes: Array.from(element.childNodes, node => node.cloneNode(true)),
    chinese: element.dataset.zh,
  }));
  const attributeEntries = ['aria-label', 'alt'].flatMap(attribute =>
    Array.from(document.querySelectorAll(`[data-zh-${attribute}]`), element => ({
      element,
      attribute,
      english: element.getAttribute(attribute),
      chinese: element.getAttribute(`data-zh-${attribute}`),
    }))
  );

  function setLanguage(language) {
    const chinese = language === 'zh-CN';
    document.documentElement.lang = chinese ? 'zh-CN' : 'en';
    textEntries.forEach(entry => {
      if (chinese) {
        entry.element.textContent = entry.chinese;
      } else {
        entry.element.replaceChildren(...entry.englishNodes.map(node => node.cloneNode(true)));
      }
    });
    attributeEntries.forEach(entry => {
      entry.element.setAttribute(entry.attribute, chinese ? entry.chinese : entry.english);
    });
    document.title = chinese
      ? (document.querySelector('title').dataset.zh || 'Chenpeng Zhang — AI 智能体与地理空间系统')
      : englishTitle;
    if (description) {
      description.content = chinese
        ? (description.dataset.zh || 'Chenpeng Zhang 的个人主页：AI 智能体、地理空间系统、项目与研究经历。')
        : englishDescription;
    }
    button.textContent = chinese ? 'English' : '中文';
    button.lang = chinese ? 'en' : 'zh-CN';
    button.setAttribute('aria-label', chinese ? 'Switch to English' : '切换到中文');
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language: document.documentElement.lang } }));
  }

  let savedLanguage;
  try {
    savedLanguage = localStorage.getItem(storageKey);
  } catch {
    // Storage may be disabled; switching still works for this visit.
  }
  setLanguage(savedLanguage === 'zh-CN' ? 'zh-CN' : 'en');
  button.hidden = false;
  button.addEventListener('click', () => {
    const nextLanguage = document.documentElement.lang === 'en' ? 'zh-CN' : 'en';
    setLanguage(nextLanguage);
    try {
      localStorage.setItem(storageKey, nextLanguage);
    } catch {
      // Persistence is optional, never a requirement for changing language.
    }
  });
})();
