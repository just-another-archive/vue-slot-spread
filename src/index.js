export default config => ({
  beforeCreate() {
    const _render = this._render;

    this._render = function() {
      // there's no need if default slot is not here or empty
      if (this.$slots.default && !!this.$slots.default.length)
        Object.keys(config).forEach(tag => {
          // this makes sense as we empty the slot at each iteration
          if (!this.$slots.default || !this.$slots.default.length)
            return;

          // convenient
          const name = config[tag];

          const components = this.$slots.default
              .filter(component => !!component.tag) // exclude text nodes
              .filter(component => component.tag.indexOf(tag) !== -1); // get the matching components

          // if it's worth doing
          if (!!components.length) {
            // initialize the slot if necessary
            if (!this.$slots[name])
              this.$slots[name] = []

              // add the new components
              this.$slots[name] = this.$slots[name].concat(components);

              // filter out the other components
              this.$slots.default = this.$slots.default.filter(component =>
                !component.tag || component.tag.indexOf(tag) === -1
              );
          }
        });

      // finally, be transparent
      return _render.apply(this, arguments);
    }
  }
});
