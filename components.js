(() => {
  const interval = setInterval(() => {
    if (!Vue) {
      return;
    }
    if (Vue) {
      console.log('registering components');
      Vue.component('launch-btn', {
        template: `<button class="cleanup_btn" @click="launch">Quick Cleanup! 🚀</button>`,
        methods: {
          launch() {
            document.body.setAttribute('style', 'overflow: hidden');
            this.$emit('click');
          }
        }
      });

      Vue.component('overlay', {
        template: `
          <div class="cleanup_overlay" @click="$refs.catcher.focus()">
            <div class="cleanup_close" @click="close">ⅹ</div>
            <input
              type="text"
              class="cleanup_catcher"
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
            />
            <h3 style="color: white;" v-show="loading">{{loading ? 'Loading' : 'Loaded'}} {{loaded}} / {{total}}</h3>
            <div class="cleanup_item" v-if="games.length > 0 && !loading">
              <div class="cleanup_item__info">
                <div />
                <div class="cleanup_item__counter">
                  {{total - currIndex}} games left
                </div>
              </div>
              <div class="cleanup_item__image" :style="{ backgroundImage: 'url(' + games[currIndex].background_image + ')' }">
                <div class="cleanup_item__arrows">
                  <div class="cleanup_item__arrow left" @click="prev">&lt;</div>
                  <div class="cleanup_item__arrow right" @click="next">&gt;</div>
                </div>
              </div>
              <img v-if="currIndex < total -1" class="cleanup_prefetch" :src="games[currIndex + 1].background_image" />
              <div class="cleanup_item__info">
                <h4 class="cleanup_item__title">{{games[currIndex].name}}</h4>
                <div class="cleanup_item__actions">
                  <div
                    v-for="action in ['P', 'C', 'A', 'Y']"
                    :key="action"
                    @click="setStatus(action)"
                    :class="['cleanup_item__action', games[currIndex].status === statusMap[action] ? 'active' : '' ]"
                  >
                    {{action}}
                  </div>
                </div>
              </div>
              <div class="cleanup_item__help">
                Keyboard shortcuts: 🤓
                <br />
                Use <b>P, C, A, Y</b> to assign the statuses <b>Playing, Completed, Abandoned, Yet To Play</b> respectively.
                <br />
                Use arrow keys to navigate.
                <br />
                You can also use <b>1, 2, 3, 4</b> or <b>H, J, K, L</b> to assign statues (same order as the above).
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
          }
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
          }
        },
        methods: {
          async loadTotal() {
            const resp = await fetch(
              `https://api.rawg.io/api/users/${
                this.username
              }/games?ordering=-usergame__added&statuses=owned&page_size=1&page=1`
            );
            const json = await resp.json();
            this.total = json.count;
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
            }
          },
          loadToken() {
            const tokenStart = document.cookie.substr(
              document.cookie.indexOf('token')
            );
            this.token = tokenStart.substr(6, tokenStart.indexOf(';') - 6);
          }
        },
        async mounted() {
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

      clearInterval(interval);
    }
  }, 200);
})();
