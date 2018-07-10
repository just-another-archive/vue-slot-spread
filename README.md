# vue-slot-spread
## what
a handy Vue.js mixin to spread components in slots

<br />

## TL;DR
1. `npm i -s vue-slot-spread`
2. `import spread from 'vue-slot-spread'`
3. `mixins: [ spread({ 'tag-name': 'slot-name' }) ]`

<br />

<br />

## why
### Consider the following use-case :
You're doing a `Card.vue` component with multiple slots, such as `header`, `body`, and `footer`.

All of its slots should be :
- [ ] customizable from userland with classes and attributes
- [ ] totally optional
- [ ] enforce minimal implementation (element type, and attributes).

<br />

### 1. A first implementation
```
<template>
  <div class="card">
    <div class="header">
      <slot name="header" />
    </div>

    <div class="body">
      <slot name="body" />
    </div>

    <div class="footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

#### - Cons of this implementation
- Containers are not customizable easily. You will probably end up adding something like `v:bind="headerAttrs"` and `:class="headerClass"` for each slot, which results in 2 properties per slot... and let's not talk about directives and event handlers.

- Containers will be there even if the slot is empty. You would write a computed property like `headerEmpty() { return this.$slots.header.length > 0 }` but as computed values are cached and slots update doesn't trigger recalculation, it would turn into a `methods` instead... which is kinda not the place you want it to be ([fiddle demo](http://jsfiddle.net/zb3xeogj/)).

#### - Implementation checklist
- [ ] customizable from userland with classes and attributes
- [ ] totally optional
- [x] enforce minimal implementation (element type, and attributes).

<br />

### 2. A second try
```
<template>
  <div class="card">
    <slot name="header" />
    <slot name="body" />
    <slot name="footer" />
  </div>
</template>
```

#### - This implementation solves
- [x] totally optional

#### - This implementation breaks
- [ ] enforce minimal implementation (element type, and attributes).

#### - Cons of this implementation :
- The element given as slot is not controlled by the component : if your `slot[name=header]` requires the slot to be a `div`, there is **no way** to enforce that.

- You could give properties to the slot, but then you cannot enforce their use as it requires `scope='props'` (or `$attrs`, _but not both_) to be coded, and `class` will be forgotten anyway.

#### - Implementation checklist :
- [x] customizable from userland with classes and attributes
- [x] totally optional
- [ ] enforce minimal implementation (element type, and attributes).

<br />

### 3. The ideal implementation
The ideal implementation is actually not far from the 2nd one. If you were willing to add multiple checks for the tag, it would be easy through `vnode.tag` but it would require a little bit more effort to describe classes, style and attributes ; at the same time, you need to consider that it means the conveniency of use of your component, which could be low if classes and attributes have to be written **every** time_.

To make it as convenient as possible, we could split into several components which already provide those requirements :

```html
<!-- Card.vue -->
<template>
  <div class="card">
    <slot name="header" />
    <slot name="body" />
    <slot name="footer" />
  </div>
</template>
```

```html
<!-- Header.vue -->
<template>
  <div class="header"><slot /></div>
</template>
```

```html
<!-- Body.vue -->
<template>
  <div class="body"><slot /></div>
</template>
```

```html
<!-- Footer.vue -->
<template>
  <div class="footer"><slot /></div>
</template>
```

#### This implementation solves
- [x] customizable with classes and attributes
- [x] _provide_ minimal requirements (element type, and attributes).

#### This implementation breaks
- [ ] _enforce_ minimal requirements (element type, and attributes).

#### Cons of this implementation
- By doing this, you're not actually 100% sure that your component will actually receive a `<header />` in the `<slot name="header">`... You're _hoping_ it will be the case.

### 4. The real implementation
The latest implementation is quite great, but needs a boost to make sure that only a limited/controlled set of components will be moved to the given slots... and that's where `vue-slot-spread` comes into action.

```html
<!-- Card.vue -->
<template>
  <div class="card">
    <slot name="header" />
    <slot name="body" />
    <slot name="footer" />
  </div>
</template>

<script>
import spread from 'vue-slot-spread';

export default {
  mixins: [spread({
    'card-header': 'header',
    'card-body'  : 'body',
    'card-footer': 'footer',
  })]

  ...
}
```

```html
<!-- CardHeader.vue -->
<template>
  <div class="header"><slot /></div>
</template>
```

```html
<!-- CardBody.vue -->
<template>
  <div class="body"><slot /></div>
</template>
```

```html
<!-- CardFooter.vue -->
<template>
  <div class="footer"><slot /></div>
</template>
```

#### This implementation breaks
- [x] _enforce_ minimal requirements (element type, and attributes).

#### Cons of this implementation
- Slot distribution is totally transparent in userland. Users of your component will not see the deconstruction happen has they will actually write their components in `<slot />`.

#### - Implementation checklist :
- [x] customizable from userland with classes and attributes
- [x] totally optional
- [x] enforce minimal implementation (element type, and attributes).


## How
Slots are basic arrays, and hopefully not reactive, so we can rearrange them the way we want. The idea is to use a mixin which will move some `tag` from `slot[name=default]` to `slot[name=]`.

I first wrote the `process` function (see source) based on this idea, and it works perfectly fine if you call it at `created()` hook. Sadly, there's no hook to manipulate slots before rendering, so I had to overwrite `_render` and insert the slot manipulation process just before rendering. It's nasty, I know... but it works.
