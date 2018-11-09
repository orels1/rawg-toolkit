const createElement = (tag, text = null, attrs = {}, onClick) => {
  const el = document.createElement(tag);
  if (text && text.length) {
    el.append(text);
  }
  Object.entries(attrs).forEach(([attr, value]) =>
    el.setAttribute(attr, value)
  );
  if (onClick) {
    el.onclick = onClick;
  }
  return el;
};

(() => {
  let app = null;
  let insertInterval = null;

  const mount = () => {
    app = new Vue({
      el: '#rawg-cleanup',
      template: `
        <div id="rawg-cleanup">
          <launch-btn @click="show = true" />
          <keep-alive>
            <overlay v-if="show" @close="show = false" />
          </keep-alive>
        </div>
      `,
      data: () => ({
        show: false
      })
    });
  };

  const insert = () => {
    const root = document.querySelector('.category-container.available');
    if (!root) {
      clearInterval(insertInterval);
      return;
    }

    const mountPoint = createElement('div', '', { id: 'rawg-cleanup' });
    root.prepend(mountPoint);
    document.head.append(
      createElement('link', '', {
        href: 'https://fonts.googleapis.com/css?family=Press+Start+2P',
        rel: 'stylesheet'
      })
    );
    mount();
  };

  const checkInsertion = () => {
    if (!document.querySelector('#rawg-cleanup')) {
      insert();
    }
  };

  if (window.location.pathname.includes('@')) {
    insertInterval = setInterval(checkInsertion, 1000);
  }

  // grab and sync cookie on first launch
  const grabCookie = () => {
    let token = document.cookie.substr(document.cookie.indexOf('token'));
    token = token.substr(6, token.indexOf(';') - 6);
    chrome.storage.sync.set({ token: `Token ${token}` });
  };

  grabCookie();
})();
