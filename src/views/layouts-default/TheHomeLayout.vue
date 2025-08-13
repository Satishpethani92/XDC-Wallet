<template>
  <div>
    <home-landing />
    <home-socials />
  </div>
</template>

<script>
export default {
  name: 'TheHomeLayout',
  components: {
    HomeLanding: () => import('../components-default/HomeLanding'),
    HomeSocials: () => import('../components-default/HomeSocials.vue')
  }
};
</script>
