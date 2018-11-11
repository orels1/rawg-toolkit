const coolLog = (...arguments) => {
  console.log(
    '%c RAWG' + '%c TOOLKIT 🚀 ',
    'background: #000; color: #fff; font-weight: bold;',
    'background: #000; color: hsl(0, 0%, 50%)',
    ...arguments
  );
};

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

// add fonts
document.head.append(
  createElement('link', '', {
    href: 'https://fonts.googleapis.com/css?family=Press+Start+2P',
    rel: 'stylesheet'
  })
);

// global components prefix
const prefix = 'rgtk';
// components object
const components = {};
// list of mount points for Vue components
// uses `prepend` by default
// can supply `method` prop to change that
const mountPoints = {
  cleanup: {
    selector: '.category-container',
    urlFilter: url => url.includes('@')
  },
  random: {
    selector: '.input-search-main',
    urlFilter: url => url === '/'
  },
  randomInDb: {
    selector: '.breadcrumbs',
    urlFilter: url => url.includes('/games') && !url.includes('@'),
    method: 'append'
  }
};

const insert = () => {
  let failed = false;
  let retryCount = 0;
  const interval = setInterval(() => {
    failed = false;
    Object.entries(mountPoints).forEach(([component, options]) => {
      // check if already injected
      if (!!document.querySelector(`#${prefix}_${component}`)) {
        return;
      }
      // check if on proper page
      if (!options.urlFilter(window.location.pathname)) {
        return;
      }

      const root = document.querySelector(options.selector);
      // if for some reason there is no root node - abort and retry
      if (!root) {
        failed = true;
        return;
      }
      const mountEl = createElement('div', '', {
        id: `${prefix}_${component}`
      });
      root[options.method || 'prepend'](mountEl);
      // call the load method
      components[`${prefix}_load_${component}`]();
    });
    if (!failed) {
      clearInterval(interval);
    } else {
      retryCount += 1;
    }

    // it's dead, Bob ¯\_(ツ)_/¯
    if (retryCount === 10) {
      clearInterval(interval);
    }
  }, 300);
};

// check that all components were registered
const registerInterval = setInterval(() => {
  if (Object.keys(components).length === Object.keys(mountPoints).length) {
    insert();
    clearInterval(registerInterval);
  }
}, 200);

// grab and sync cookie on first launch
const grabCookie = () => {
  let token = document.cookie.substr(document.cookie.indexOf('token'));
  token = token.substr(6, token.indexOf(';') - 6);
  chrome.storage.sync.set({ token: `Token ${token}` });
};

grabCookie();

chrome.runtime.onMessage.addListener(request => {
  if (request.type === 'locationChange') {
    // check if any url rules match
    const matches = Object.entries(mountPoints).filter(([component, options]) =>
      options.urlFilter(window.location.pathname)
    );
    if (!!matches.length) {
      insert();
    }
  }
});
