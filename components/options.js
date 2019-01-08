components[`${prefix}_load_options`] = () => {
  const name = "options";
  const lprefix = `${prefix}_${name}`;

  const interval = setInterval(() => {
    if (!Vue) {
      return;
    }
    if (Vue) {
      const eventBus = new Vue();

      coolLog("Injecting OPTIONS components");
      new Vue({
        el: `#${lprefix}`,
        template: `<a class="header-menu-content__settings-link" @click="launch">Toolkit Options</a>`,
        methods: {
          launch() {
            eventBus.$emit("launch");
          }
        }
      });

      new Vue({
        el: `#${lprefix}_overlay`,
        template: `
          <div class="${lprefix}_overlay" v-if="shown">
            <div class="${lprefix}_close" @click="close">×</div>
            <div class="${lprefix}_container">
              <div
                v-for="(section, sectionIndex) in options"
                :key="section.label"
                class="${lprefix}_section"
              >
                <div class="${lprefix}_label">{{section.label}}</div>
                <div
                  v-for="option in section.list"
                  :key="option.label"
                  :class="['${lprefix}_item', option.enabled && 'active']"
                  @click="toggleOption(sectionIndex, option)"
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
          </div>
        `,
        data: () => ({
          shown: false,
          options: [
            {
              label: "Modules",
              list: [
                {
                  label: "Game release notifications",
                  key: "releaseNotify",
                  enabled: false
                },
                {
                  label: "Random game buttons",
                  key: "randomGames",
                  enabled: false
                },
                {
                  label: "Library cleanup",
                  key: "cleanup",
                  enabled: false
                }
              ]
            },
            {
              label: 'Options',
              list: [
                {
                  label: 'Combo-mode in library cleanup',
                  key: 'combo',
                  enabled: false
                },
              ]
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
          },
          toggleOption(sectionIndex, option) {
            settings[option.key] = !option.enabled;
            chrome.runtime.sendMessage(
              { type: 'setSettings', data: settings },
              response => {
                loadSettings().then(settings => {
                  this.syncSettings();
                });
              }
            );
          },
          syncSettings() {
            this.options.forEach((section, sectionIndex) => {
              section.list.forEach((option, index) => {
                this.options[sectionIndex].list[index].enabled = settings[option.key];
              });
            });
          }
        },
        mounted() {
          eventBus.$on('launch', this.launch);
          this.syncSettings();
        }
      });

      clearInterval(interval);
    }
  }, 200);
};
