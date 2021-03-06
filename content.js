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

let settings = {};

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
    urlFilter: url => url.includes('@'),
    setting: 'cleanup'
  },
  random: {
    selector: '.input-search-main',
    urlFilter: url => url === '/',
    setting: 'randomGames'
  },
  randomInDb: {
    selector: '.breadcrumbs',
    urlFilter: url => url.includes('/games') && !url.includes('@'),
    method: 'append'
  },
  options: {
    selector: '.header-menu__content-area',
    urlFilter: () => true,
    method: 'append',
    watch: true,
    watchSelector: '#portals'
  },
  options_overlay: {
    pure: true,
    selector: 'body',
    urlFilter: () => true,
    method: 'append',
    watch: true,
    watchSelector: '#portals'
  }
};

const watched = [];

const watch = (component, options) => {
  if (options.watch && !watched.includes(component)) {
    watched.push(component);
    return true;
  } else {
    return false;
  }
};

const insertSingle = ({ component, options }) => {
  // check if module is disabled
  if (options.setting && !settings[options.setting]) {
    return;
  }
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
    // add to watchlist before exiting
    if (watch(component, options)) {
      return true;
    }
    return false;
  }

  // add to watchlist even if the root is there
  watch(component, options);
  const mountEl = createElement('div', '', {
    id: `${prefix}_${component}`
  });
  root[options.method || 'prepend'](mountEl);
  // pure components just add mount points for misc use
  if (options.pure) {
    return true;
  }
  // call the load method
  components[`${prefix}_load_${component}`]();
  return true;
};

// watches if the watched selector was triggered and inserts
const mutationObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    watched.forEach(component => {
      if (
        (mutation.target.className ===
          mountPoints[component].watchSelector.substr(1) ||
          mutation.target.id ===
            mountPoints[component].watchSelector.substr(1)) &&
        mutation.addedNodes.length
      ) {
        insertSingle({ component, options: mountPoints[component] });
      }
    });
  });
});

const insert = () => {
  let failed = false;
  let retryCount = 0;
  const interval = setInterval(() => {
    failed = false;
    Object.entries(mountPoints).forEach(([component, options]) => {
      failed = !insertSingle({ component, options });
    });
    if (!failed) {
      clearInterval(interval);
      // inserting watchers after everything else was mounted
      watched.forEach(name => {
        mutationObserver.observe(
          document.querySelector(mountPoints[name].watchSelector),
          {
            childList: true,
            subtree: true
          }
        );
      });
    } else {
      retryCount += 1;
    }

    // it's dead, Bob ¯\_(ツ)_/¯
    if (retryCount === 10) {
      clearInterval(interval);
    }
  }, 300);
};

// load settings global method
const loadSettings = () =>
  new Promise(resolve => {
    chrome.runtime.sendMessage(
      { type: 'getSettings' },
      ({ settings: loadedSettings }) => {
        settings = loadedSettings || {};
        resolve(settings);
      }
    );
  });

// load settings before mounting anything
chrome.runtime.sendMessage(
  { type: 'getSettings' },
  ({ settings: loadedSettings }) => {
    settings = loadedSettings || {};

    // check that all components were registered
    const registerInterval = setInterval(() => {
      if (
        Object.keys(components).length ===
        Object.keys(mountPoints).filter(k => !mountPoints[k].pure).length
      ) {
        insert();
        clearInterval(registerInterval);
      }
    }, 200);
  }
);

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
