<template>
  <div class="auth-callback-container">
    <div class="glass callback-box">
      <div class="loader"></div>
      <h2>Giriş Yapılıyor...</h2>
      <p>Lütfen bekleyin, yönlendiriliyorsunuz.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../api/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token;
  
  if (token) {
    try {
      const userData = await authApi.getMe(token);
      
      if (userData) {
        // Complete login process
        authStore.login({ ...userData, token });
        router.push('/profile');
      } else {
        router.push('/login?error=auth_failed');
      }
    } catch (error) {
      console.error('OAuth login failed:', error);
      router.push('/login?error=auth_failed');
    }
  } else {
    router.push('/login?error=no_token');
  }
});
</script>

<style scoped>
.auth-callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.callback-box {
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

h2 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

p {
  color: var(--text-color-muted);
}
</style>
