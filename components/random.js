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
            <div class="${lprefix}_dice">🎲</div>
          </div>
        `,
        data: () => ({
          total: 0
        }),
        async mounted() {
          const resp = await fetch('https://api.rawg.io/api/games?limit=1');
          if (!resp.ok) {
            return;
          }
          const json = await resp.json();
          this.total = json.count;
        },
        methods: {
          loadRandom() {
            let index = Math.floor(Math.random() * this.total);
            if (index === 0) {
              index = 1;
            }
            window.location.assign(`https://rawg.io/games/${index}`);
          }
        }
      });

      clearInterval(interval);
    }
  }, 200);
};
