<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md w-full">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Login</h2>
      <form @submit.prevent="login" class="space-y-4">
        <div class="flex flex-col">
          <FloatLabel>
            <InputText id="username" v-model="username" class="w-full" />
            <label for="username">Username</label>
          </FloatLabel>
        </div>
        <div class="flex flex-col">
          <FloatLabel>
            <Password
              id="password"
              v-model="password"
              :pt="{
                root: {
                  class: 'w-full',
                },
              }"
              toggleMask
            />
            <label for="password">Password</label>
          </FloatLabel>
        </div>
        <Button type="submit" label="Primary" rounded class="w-full">
          Login
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup>
import Password from "primevue/password";
import { ref } from "vue";

const username = ref("");
const password = ref("");

const login = () => {
  // Add your login logic here
};
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
