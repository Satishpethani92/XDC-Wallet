<template>
  <div>
    <disclaimer-modal />
    <home-landing />
    <home-socials />
  </div>
</template>

<script>
export default {
  name: 'TheHomeLayout',
  components: {
    DisclaimerModal: () => import('../../core/components/DisclaimerModal.vue'),
    HomeLanding: () => import('../components-default/HomeLanding'),
    HomeSocials: () => import('../components-default/HomeSocials.vue')
  }
};
</script>
