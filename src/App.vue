<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
</script>

<template>
  <header>
    <nav>
      <ul>
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/orders">Order Entry</RouterLink></li>
      </ul>
      <h4>Welcome to Bill Digitize</h4>
      <ul>
        <li><RouterLink to="/login">Login</RouterLink></li>
        <li v-if="proxyIsLoggedIn">
          <a href="#" @click.prevent="logout" class="contrast">Logout</a>
        </li>
      </ul>
    </nav>
  </header>
  <main></main>
  <footer>
    <div>
      <small>Made with 💛 by <big>Gourab</big></small>
    </div>
  </footer>
</template>

<style scoped>
nav {
  border-bottom: solid 1px var(--secondary);
  display: flex;
  flex-direction: column;
}
</style>
