components[`${prefix}_load_random`] = () => {
  const interval = setInterval(() => {
    if (!Vue) {
      return;
    }
    if (Vue) {
      coolLog('Injecting RANDOM components');
      new Vue({
        el: `#${prefix}_random`,
        template: `
          <div id="${prefix}_random">
            ...or pick a random one 🎲
          </div>
        `
      });

      clearInterval(interval);
    }
  }, 200);
};
