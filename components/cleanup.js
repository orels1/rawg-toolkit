components[`${prefix}_load_cleanup`] = () => {
  const name = 'cleanup';
  const lprefix = `${prefix}_${name}`;
  const interval = setInterval(() => {
    if (!Vue) {
      return;
    }
    if (Vue) {
      Vue.component(`${lprefix}-launch-btn`, {
        template: `<button class="${lprefix}_btn" @click="launch">Quick Cleanup! 🚀</button>`,
        methods: {
          launch() {
            document.body.setAttribute('style', 'overflow: hidden');
            window.scrollTo(0, 0);
            this.$emit('click');
          }
        }
      });

      Vue.component(`${lprefix}-overlay`, {
        template: `
          <div class="${lprefix}_overlay" @click="$refs.catcher.focus()">
            <div class="${lprefix}_close" @click="close">×</div>
            <input
              type="text"
              class="${lprefix}_catcher"
              ref="catcher"
              autofocus
              @keydown.p="setStatus('P')"
              @keydown.c="setStatus('C')"
              @keydown.a="setStatus('A')"
              @keydown.y="setStatus('Y')"
              @keydown.49="setStatus('P')"
              @keydown.50="setStatus('C')"
              @keydown.51="setStatus('A')"
              @keydown.52="setStatus('Y')"
              @keydown.h="setStatus('P')"
              @keydown.j="setStatus('C')"
              @keydown.k="setStatus('A')"
              @keydown.l="setStatus('Y')"
              @keydown.left="prev"
              @keydown.right="next"
              @keydown.up="comboUp"
            />
            <div class="${lprefix}_loading" v-show="loading">
              <div class="${lprefix}_row ${lprefix}_loading__counter">
                <div>Loading your games...</div>
                <div>{{this.total - this.loaded}} left</div>
              </div>
              <div class="${lprefix}_loading__container">
                <div class="${lprefix}_loading__progress" :style="loadingProgressStyle" />
              </div>
            </div>
            <div class="${lprefix}_item" v-if="games.length > 0 && !loading">
              <div class="${lprefix}_item__info">
                <div />
                <div class="${lprefix}_item__counter">
                  {{total - currIndex}} games left
                </div>
              </div>
              <div class="${lprefix}_item__image" :style="{ backgroundImage: 'url(' + games[currIndex].background_image + ')' }">
                <div class="${lprefix}_item__arrows">
                  <div class="${lprefix}_item__arrow left" @click="prev">&lt;</div>
                  <div class="${lprefix}_item__arrow right" @click="next">&gt;</div>
                </div>
                <div class="${lprefix}_loading__container ${lprefix}_combo__bar" v-show="combo > 0">
                  <div :class="['${lprefix}_loading__progress', comboBarClass]" />
                </div>
              </div>
              <img v-if="currIndex < total -1" class="${lprefix}_prefetch" :src="games[currIndex + 1].background_image" />
              <div class="${lprefix}_item__info">
                <h4 class="${lprefix}_item__title">{{games[currIndex].name}}</h4>
                <div class="${lprefix}_item__actions">
                  <div
                    v-for="action in ['P', 'C', 'A', 'Y']"
                    :key="action"
                    @click="setStatus(action)"
                    :class="['${lprefix}_item__action', games[currIndex].status === statusMap[action] ? 'active' : '' ]"
                  >
                    {{action}}
                  </div>
                  <div v-show="combo > 0" class="${lprefix}_item__combo">
                    <i>x</i>
                    <b :class="['${lprefix}_item__combo_hax', comboClass]">{{combo}}</b>
                    <b class="${lprefix}_hidden">{{combo}}</b>
                    <b :class="['${lprefix}_item__combo_shadow', comboClass]">{{combo}}</b>
                  </div>
                </div>
              </div>
              <div class="${lprefix}_item__help">
                Keyboard shortcuts: 🤓
                <br />
                Use <b>P, C, A, Y</b> to assign the statuses <b>Playing, Completed, Abandoned, Yet To Play</b> respectively.
                <br />
                Use arrow keys to navigate.
                <br />
                You can also use <b>1, 2, 3, 4</b> or <b>H, J, K, L</b> to assign statues (same order as the above).
                <hr class="${lprefix}_separator" />
                You can toggle combo mode in the extension settings.
                <br />
                <b>Combo Mode is {{comboActive ? 'on! 👊' : 'off'}}</b>
              </div>
            </div>
          </div>
        `,
        data: () => ({
          games: [],
          total: 0,
          loaded: 0,
          currIndex: 0,
          token: null,
          statusMap: {
            P: 'playing',
            C: 'beaten',
            Y: 'yet',
            A: 'dropped'
          },
          combo: 0,
          comboClass: '',
          comboBarTimeout: null,
          comboBarClass: 'decay',
          comboTimeout: null,
          animation: null,
          comboActive: true
        }),
        computed: {
          username() {
            return window.location.pathname.substr(
              2,
              window.location.pathname.lastIndexOf('/') - 2
            );
          },
          loading() {
            return this.loaded !== this.total || this.total === 0;
          },
          loadingProgressStyle() {
            return {
              width: `${(this.loaded / this.total) * 100}%`
            };
          }
        },
        methods: {
          clearTimeouts() {
            if (this.comboTimeout) {
              clearTimeout(this.comboTimeout);
            }
            if (this.animation) {
              clearTimeout(this.animation);
            }
            if (this.comboBarTimeout) {
              clearTimeout(this.comboBarTimeout);
            }
          },
          comboUp() {
            if (!this.comboActive) return;
            this.clearTimeouts();
            if (this.currIndex === this.total - 1) {
              return;
            }
            this.combo += 1;
            this.comboClass = `${lprefix}_boom`;
            this.comboBarClass = '';
            this.comboBarTimeout = setTimeout(() => {
              this.comboBarClass = 'decay';
            }, 50);
            this.animation = setTimeout(() => {
              this.comboClass = '';
            }, 300);
            this.comboTimeout = setTimeout(() => {
              this.combo = 0;
            }, 7000);
          },
          async loadTotal() {
            const resp = await fetch(
              `https://api.rawg.io/api/users/${
                this.username
              }/games?ordering=-usergame__added&statuses=owned&page_size=1&page=1`
            );
            const json = await resp.json();
            this.total = json.count;
            // this.total = 40;
          },
          async loadPage(url) {
            const resp = await fetch(url);
            return resp.json();
          },
          prev() {
            this.currIndex > 0 ? (this.currIndex -= 1) : (this.currIndex = 0);
          },
          next() {
            this.currIndex < this.total - 1
              ? (this.currIndex += 1)
              : (this.currIndex = this.total - 1);
          },
          close() {
            document.body.setAttribute('style', '');
            this.$emit('close');
          },
          async setStatus(status) {
            const resp = await fetch(
              `https://api.rawg.io/api/users/current/games/${
                this.games[this.currIndex].id
              }`,
              {
                method: 'PATCH',
                headers: {
                  token: `Token ${this.token}`,
                  'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                  status: this.statusMap[status]
                })
              }
            );
            if (resp.ok) {
              this.games[this.currIndex].status = this.statusMap[status];
              this.next();
              this.comboUp();
            }
          },
          loadToken() {
            const tokenStart = document.cookie.substr(
              document.cookie.indexOf('token')
            );
            this.token = tokenStart.substr(6, tokenStart.indexOf(';') - 6);
          }
        },
        async activated() {
          await loadSettings();
          this.comboActive = settings.combo;
        },
        async mounted() {
          await loadSettings();
          this.comboActive = settings.combo;
          this.loadToken();
          if (!this.games.length) {
            await this.loadTotal();

            let next = `https://api.rawg.io/api/users/${
              this.username
            }/games?ordering=-usergame__added&statuses=owned&page_size=40&page=1`;
            while (this.loaded < this.total) {
              const json = await this.loadPage(next);
              this.games.push(...json.results);
              next = json.next;
              this.loaded += json.results.length;
            }

            this.$refs.catcher.focus();
          }
        }
      });

      coolLog('Injecting CLEANUP components');
      new Vue({
        el: `#${lprefix}`,
        template: `
          <div id="${lprefix}">
            <${lprefix}-launch-btn @click="show = true" />
            <keep-alive>
              <${lprefix}-overlay v-if="show" @close="show = false" />
            </keep-alive>
          </div>
        `,
        data: () => ({
          show: false
        })
      });

      clearInterval(interval);
    }
  }, 200);
};
