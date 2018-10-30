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

(() => {
  let app = null;
  const mount = () => {
    app = new Vue({
      el: '#rawg-cleanup',
      template: `
        <div id="rawg-cleanup">
          <launch-btn @click="show = true" />
          <keep-alive>
            <overlay v-if="show" @close="show = false" />
          </keep-alive>
        </div>
      `,
      data: () => ({
        show: false
      })
    });
  };

  const insert = () => {
    const root = document.querySelector('.category-container.available');
    const mountPoint = createElement('div', '', { id: 'rawg-cleanup' });
    root.prepend(mountPoint);
    mount();
  };

  const checkInsertion = () => {
    if (!document.querySelector('#rawg-cleanup')) {
      insert();
    }
  };
  setInterval(checkInsertion, 1000);
})();
