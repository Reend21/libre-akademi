<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const captchaInput = ref('')
const num1 = ref(0)
const num2 = ref(0)

const router = useRouter()

const generateCaptcha = () => {
  num1.value = Math.floor(Math.random() * 10) + 1
  num2.value = Math.floor(Math.random() * 10) + 1
}

onMounted(() => {
  generateCaptcha()
})

const handleLogin = () => {
  if (parseInt(captchaInput.value) !== num1.value + num2.value) {
    alert('Captcha hatalı, lütfen tekrar deneyin.')
    generateCaptcha()
    captchaInput.value = ''
    return
  }
  if (password.value !== passwordConfirm.value) {
    alert('Şifreler eşleşmiyor.')
    return
  }
  // Simulate login
  alert('Giriş başarılı!')
  router.push('/')
}
</script>

<template>
  <div class="auth-view flex items-center justify-center">
    <div class="auth-card">
      <h2><i class="bi bi-box-arrow-in-right"></i> Giriş Yap</h2>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4 mt-8">
        <label>
          <span><i class="bi bi-envelope-fill"></i> E-posta</span>
          <input type="email" v-model="email" required placeholder="ornek@email.com" />
        </label>
        <label>
          <span><i class="bi bi-lock-fill"></i> Şifre</span>
          <input type="password" v-model="password" required placeholder="••••••••" />
        </label>
        <label>
          <span><i class="bi bi-lock-fill"></i> Yine Şifre</span>
          <input type="password" v-model="passwordConfirm" required placeholder="••••••••" />
        </label>
        <label>
          <span><i class="bi bi-shield-lock-fill"></i> Doğrulama: {{ num1 }} + {{ num2 }} = ?</span>
          <input type="number" v-model="captchaInput" required placeholder="Sonucu giriniz" />
        </label>
        <button type="submit" class="btn"><i class="bi bi-box-arrow-in-right"></i> Giriş Yap</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-view { min-height: 70vh;   display: flex;
  justify-content: center;
  align-items: center; }
.auth-card {
  background: var(--bg-primary);
  padding: 2.5rem;
  border-radius: 16px;
  width: 800px;
  height: 600px;
  max-width: 800px;
  max-height: 800px;
  border: 1px solid var(--border-color);
}
h2 { text-align: center; color: var(--accent); }
label { display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-secondary); }
label span { font-family: 'Hermit', monospace; font-weight: normal; }
input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Hermit', monospace;
}
input::placeholder {
  font-family: 'Hermit', monospace;
  opacity: 0.8;
}
.btn { margin-top: 1rem; width: 100%; font-size: 1.1rem; }
</style>
