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
  const list = await getFromSync('shownNotifications');
  await saveToSync('shownNotifications', [].concat(list, [id]));
};

const checkReleased = async () => {
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
          token
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

    newNotifs.forEach(async game => {
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
    });
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
