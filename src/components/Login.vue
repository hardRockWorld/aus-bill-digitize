<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md w-full">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Login</h2>
      <form
        @submit.prevent="login(loginRequest.email, loginRequest.password)"
        class="space-y-4"
      >
        <div class="flex flex-col">
          <FloatLabel>
            <InputText
              v-if="null != loginRequest.error"
              v-model="loginRequest.email"
              :aria-invalid="null != loginRequest.error"
              id="email"
              name="email"
              placeholder="Email"
              class="w-full"
              required
            />
            <InputText
              v-if="null == loginRequest.error"
              v-model="loginRequest.email"
              id="email"
              name="email"
              placeholder="Email"
              class="w-full"
              required
            />
            <label for="email">Email</label>
          </FloatLabel>
        </div>
        <div class="flex flex-col">
          <FloatLabel>
            <Password
              v-if="null != loginRequest.error"
              v-model="loginRequest.password"
              :aria-invalid="null != loginRequest.error"
              id="password"
              name="password"
              placeholder="Password"
              :pt="{
                root: {
                  class: 'w-full',
                },
              }"
              toggleMask
              required
            />
            <Password
              v-if="null == loginRequest.error"
              v-model="loginRequest.password"
              id="password"
              name="password"
              placeholder="Password"
              :pt="{
                root: {
                  class: 'w-full',
                },
              }"
              toggleMask
              required
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "../stores/user";
import pb from "../pocketbase";

const router = useRouter();
const { setUser } = useSessionStore();
const errorMessage = ref("");

const emptyLoginRequest = {
  email: "",
  password: "",
};

const loginRequest = ref({ ...emptyLoginRequest, error: null });

const login = async (email, password) => {
  try {
    // Authenticate the user
    const user = await pb.collection("users").authWithPassword(email, password);

    console.log("user is logged in: ", user);
    setUser(user, email, true, new Date().getTime());

    // Navigate to dashboard
    router.push("/");
  } catch (error) {
    console.error(error);
    switch (error.message) {
      case "Failed to authenticate":
        errorMessage.value = "Email/password is wrong.";
        break;
      default:
        errorMessage.value = "An error occurred.";
    }
  }
};
</script>
<style scoped>
.full-width {
  width: 100%;
}
</style>
