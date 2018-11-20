components[`${prefix}_load_options`] = () => {
  const name = 'options';
  const lprefix = `${prefix}_${name}`;

  const interval = setInterval(() => {
    if (!Vue) {
      return;
    }
    if (Vue) {
      const eventBus = new Vue();

      coolLog('Injecting OPTIONS components');
      new Vue({
        el: `#${lprefix}`,
        template: `<li><div class="header-menu-content__settings-link" @click="launch">Toolkit Options</div></li>`,
        methods: {
          launch() {
            eventBus.$emit('launch');
          }
        }
      });

      new Vue({
        el: `#${lprefix}_overlay`,
        template: `
          <div class="${lprefix}_overlay" v-if="shown">
            <div class="${lprefix}_close" @click="close">ⅹ</div>
            <div class="${lprefix}_container">
              <div
                v-for="option in options"
                :key="option.key"
                :class="['${lprefix}_item', option.enabled && 'active']"
                @click="option.enabled = !option.enabled"
              >
                <div class="checkbox__input">
                  <span class="SVGInline" v-show="option.enabled">
                    <svg class="SVGInline-svg" width="18" height="13" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 6.238l4.97 4.97M16.714 1L6.225 11.49" stroke-width="2" stroke="#13C948" fill="none" stroke-linecap="round" />
                    </svg>
                  </span>
                </div>
                {{option.label}}
              </div>
            </div>
          </div>
        `,
        data: () => ({
          shown: false,
          options: [
            {
              label: 'Enable combo-mode',
              key: 'combo',
              enabled: false
            },
            {
              label: 'Enable release notifications',
              key: 'releaseNotify',
              enabled: false
            },
            {
              label: 'Enable random games',
              key: 'randomGames',
              enabled: false
            }
          ]
        }),
        methods: {
          launch() {
            document.body.setAttribute('style', 'overflow: hidden');
            window.scrollTo(0, 0);
            this.shown = true;
          },
          close() {
            this.shown = false;
            document.body.setAttribute('style', 'overflow: visible');
          }
        },
        mounted() {
          eventBus.$on('launch', this.launch);
        }
      });

      clearInterval(interval);
    }
  }, 200);
};
