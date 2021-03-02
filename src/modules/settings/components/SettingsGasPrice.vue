<template>
  <div class="pb-4 pb-sm-0">
    <div>Please select a default gas price for your transaction fee</div>
    <!--
    =====================================================================================
      Economic / Regular / Fast
    =====================================================================================
    -->
    <v-sheet color="transparent" max-width="500px" class="mx-auto">
      <v-row class="mt-6">
        <v-col v-for="(b, key) in buttons" :key="key" cols="12" sm="4">
          <div
            class="text-center group-button pb-5 pt-2"
            :class="selected === key + 1 ? 'active' : ''"
            @click="selected = key + 1"
          >
            <mew-icon :icon-name="b.icon" :img-height="80" />
            <h5 class="font-weight-bold mb-2">{{ b.title }}</h5>
            <div class="font-weight-bold mb-2">{{ b.gas }}</div>
            <div>{{ b.usd }} ({{ b.time }})</div>
          </div>
        </v-col>
      </v-row>
      <!--
      =====================================================================================
        Divider
      =====================================================================================
      -->
      <v-row align="center" class="pt-3 pb-9 px-3">
        <v-divider />
        <p class="mb-0 mx-4 basicOutlineActive--text font-weight-bold">OR</p>
        <v-divider />
      </v-row>
      <!--
      =====================================================================================
       Custom Gas
      =====================================================================================
      -->
      <v-row align="start" class="px-3">
        <mew-input
          label="Customize"
          placeholder=" "
          right-label="$0.00 (- min)"
          class="mr-3"
        />
        <mew-button title="Confirm" btn-size="xlarge" class="my-1" />
      </v-row>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: 'SettingsGasPrice',
  props: {},
  data() {
    return {
      selected: 1,
      buttons: [
        {
          icon: 'bicycle',
          title: 'Economic',
          gas: '1 Gwei',
          usd: '$0.004',
          time: '< 30 min'
        },
        {
          icon: 'car',
          title: 'Regular',
          gas: '2 Gwei',
          usd: '$0.008',
          time: '< 10 min'
        },
        {
          icon: 'rocket',
          title: 'Fast',
          gas: '3 Gwei',
          usd: '$0.012',
          time: '< 5 min'
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.group-button {
  padding: 10px;
  border-radius: 10px;
  background-color: #d0f4f8;
  opacity: 0.5;
  cursor: pointer;
  user-select: none;
  width: 100%;
  border: 1px solid transparent;

  &.active {
    border: 1px solid var(--v-primary-base);
    background-color: #f2fafa;
    opacity: 1;
  }
}
</style>