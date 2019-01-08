// wishlist release notifications
const saveToSync = (k, v) =>
  new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set({ [k]: v }, result => {
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });

const getFromSync = k =>
  new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get([k], result => {
        resolve(result[k]);
      });
    } catch (e) {
      reject(e);
    }
  });

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const getNewNotifs = async notifs => {
  const list = await getFromSync('shownNotifications');
  if (!list) {
    return notifs;
  }
  return notifs.filter(i => !list.includes(i.id));
};

const saveShownNotif = async id => {
  const list = (await getFromSync('shownNotifications')) || [];
  await saveToSync('shownNotifications', list.concat([id]));
};

const checkReleased = async () => {
  const settings = (await getFromSync('settings')) || {};
  if (!settings.releaseNotify) {
    return;
  }
  try {
    const token = await getFromSync('token');
    if (!token) {
      console.log('could not get token');
      return;
    }

    const resp = await fetch(
      'https://api.rawg.io/api/feed/notifications?page_size=40&page=1',
      {
        headers: {
          token,
          'User-Agent': 'RGTK'
        }
      }
    );
    if (!resp.ok) {
      return;
    }
    const json = await resp.json();
    const gameReleases = json.results.filter(
      i => i.action === 'game_is_released'
    );
    const newNotifs = await getNewNotifs(gameReleases);

    for (const game of newNotifs) {
      chrome.notifications.create({
        type: 'list',
        iconUrl: game.games.results[0].background_image,
        title: 'The game from your wishlist is out now!',
        message: 'Check them out:',
        items: game.games.results.map(g => ({
          title: g.name,
          message: `Out on ${g.platforms.map(p => p.platform.name).join(', ')}`
        }))
      });
      await saveShownNotif(game.id);
      await sleep(15000);
    }
  } catch (e) {
    console.error(e);
    return;
  }
};

const openNotificationsList = () => {
  chrome.tabs.create({ url: 'https://rawg.io/community/notifications' });
};

chrome.notifications.onClicked.addListener(openNotificationsList);

chrome.notifications.onButtonClicked.addListener(openNotificationsList);

checkReleased();
setInterval(checkReleased, 10 * 1000 * 60);

// Navigation trigger
chrome.webNavigation.onHistoryStateUpdated.addListener(data => {
  if (data.url.includes('rawg.io')) {
    const filtered = data.url.substr(data.url.indexOf('rawg.io') + 7);
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'locationChange',
        url: filtered
      });
    });
  }
});

const randomList = [];
let randomResetTimeout = null;

const getIndex = () => {
const getIndex = (list) => {
  let index = 0;
  for (let i = 0; i < 1000000; i++) {
    index = Math.floor(Math.random() * randomList.length);
    if (index !== 0) {
      break;
    }
  }
  return index;
};

const defaultSettings = {
  randomGames: true,
  releaseNotify: true,
  cleanup: true,
  combo: true,
}

// Pseudo-random logic
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab.url) {
    return;
  }
  switch (message.type) {
    case 'getRandomGame':
      // clean randomness thing after 10 minutes of inactivity
      if (randomResetTimeout) {
        clearTimeout(randomResetTimeout);
      }
      randomResetTimeout = setTimeout(() => {
        randomList.splice(0, randomList.length);
        randomResetTimeout = null;
      }, 10 * 1000 * 60);

      // fetch games
      if (randomList.length === 0) {
        const resp = fetch('https://api.rawg.io/api/games?limit=1', {
          headers: {
            'User-Agent': 'RGTK'
          }
        })
          .then(resp => {
            if (resp.ok) {
              return resp.json();
            }
          })
          .then(json => {
            for (let i = 1; i <= json.count; i++) {
              randomList.push(i);
            }
            const index = getIndex();
            const gameId = randomList[index];
            randomList.splice(index, 1);
            sendResponse({ type: 'randomGame', index: gameId });
          });
        return true;
      } else {
        // duplicated logic due to chrome messaging quirks
        const index = getIndex();
        const gameId = randomList[index];
        randomList.splice(index, 1);
        sendResponse({ type: 'randomGame', index: gameId });
      }
      break;
    case 'getSettings':
      getFromSync('settings').then(settings => {
        const filledSettings = settings ? settings : defaultSettings;
        sendResponse({ type: 'settings', settings: filledSettings });
      });
      return true;
    case 'setSettings':
      saveToSync('settings', message.data).then(settings => {
        sendResponse({ type: 'settings', settings });
      });
      return true;
    default:
      return;
  }
});
