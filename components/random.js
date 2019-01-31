components[`${prefix}_load_random`] = () => {
  const name = 'random';
  const lprefix = `${prefix}_${name}`;

  const interval = setInterval(() => {
    if (!Vue) {
      return;
    }
    if (Vue) {
      coolLog('Injecting RANDOM components');
      new Vue({
        el: `#${lprefix}`,
        template: `
          <div id="${lprefix}" @click="loadRandom">
            <div class="${lprefix}_text">...or pick a random one</div>
          </div>
        `,
        methods: {
          loadRandom() {
            chrome.runtime.sendMessage({ type: 'getRandomGame' }, response => {
              window.location.href = `/games/${response.index}`;
            });
          }
        }
      });

      clearInterval(interval);
    }
  }, 200);
};

components[`${prefix}_load_randomInDb`] = () => {
  const name = 'randomInDb';
  const lprefix = `${prefix}_${name}`;

  const interval = setInterval(() => {
    if (!Vue) {
      return;
    }
    if (Vue) {
      coolLog('Injecting RANDOM_IN_DB components');
      new Vue({
        el: `#${lprefix}`,
        template: `
          <div id="${lprefix}" @click="loadRandom">
            <div class="${lprefix}_text">go to a random game</div>
          </div>
        `,
        created() {
          document
            .querySelector('.breadcrumbs')
            .setAttribute('style', 'display: flex;');
        },
        methods: {
          loadRandom() {
            chrome.runtime.sendMessage({ type: 'getRandomGame' }, response => {
              window.location.href = `/games/${response.index}`;
            });
          }
        }
      });

      clearInterval(interval);
    }
  }, 200);
};
