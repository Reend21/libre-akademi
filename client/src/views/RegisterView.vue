<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const captchaInput = ref('')
const num1 = ref(0)
const num2 = ref(0)

const generateCaptcha = () => {
  num1.value = Math.floor(Math.random() * 10) + 1
  num2.value = Math.floor(Math.random() * 10) + 1
}

onMounted(() => {
  generateCaptcha()
})

const handleRegister = () => {
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
  
  // Simulate registration/login
  authStore.login({ name: fullName.value, username: username.value, email: email.value })
  alert('Kayıt başarılı!')
  router.push('/')
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-wrapper glass">
      <!-- Left side: Icons & Info -->
      <div class="auth-side-info">
        <div class="info-content">
          <div class="branding-group">
            <i class="bi bi-mortarboard-fill brand-icon"></i>
            <h1>Libre Akademi</h1>
            <p>Öğrenmenin en özgür yolu.</p>
          </div>
          <div class="icon-grid">
            <div class="icon-item">
              <i class="bi bi-shield-check"></i>
              <span>Güvenli Eğitim</span>
            </div>
            <div class="icon-item">
              <i class="bi bi-people-fill"></i>
              <span>Geniş Topluluk</span>
            </div>
            <div class="icon-item">
              <i class="bi bi-journal-code"></i>
              <span>Açık Kaynak</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Register Form -->
      <div class="auth-form-area">
        <div class="form-header">
          <h2>Kayıt Ol</h2>
          <p>Yeni bir hesap oluşturun ve aramıza katılın.</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="input-row">
            <div class="input-group">
              <label><i class="bi bi-person-fill"></i> Ad Soyad</label>
              <input type="text" v-model="fullName" required placeholder="Can Yılmaz" />
            </div>
            <div class="input-group">
              <label><i class="bi bi-at"></i> Kullanıcı Adı</label>
              <input type="text" v-model="username" required placeholder="canyilmaz" />
            </div>
          </div>

          <div class="input-group">
            <label><i class="bi bi-envelope-fill"></i> E-posta</label>
            <input type="email" v-model="email" required placeholder="can@akademi.org" />
          </div>

          <div class="input-row">
            <div class="input-group">
              <label><i class="bi bi-lock-fill"></i> Şifre</label>
              <input type="password" v-model="password" required placeholder="••••••••" />
            </div>
            <div class="input-group">
              <label><i class="bi bi-lock-fill"></i> Şifre (Tekrar)</label>
              <input type="password" v-model="passwordConfirm" required placeholder="••••••••" />
            </div>
          </div>

          <div class="input-group captcha-group">
            <label><i class="bi bi-shield-lock-fill"></i> Doğrulama: {{ num1 }} + {{ num2 }} = ?</label>
            <input type="number" v-model="captchaInput" required placeholder="İşlem sonucunu yazınız" />
          </div>

          <button type="submit" class="submit-btn">
            <i class="bi bi-person-plus-fill"></i> Kayıt Ol
          </button>
        </form>

        <div class="form-footer">
          <p>Zaten hesabınız var mı? <RouterLink to="/login">E giriş yapın o zaman!</RouterLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-wrapper {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  width: 100%;
  max-width: 1100px;
  min-height: 700px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
}

.glass {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
}

.auth-side-info {
  background: linear-gradient(135deg, var(--accent) 0%, #b57614 100%);
  color: #fff;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .auth-side-info {
  background: linear-gradient(135deg, var(--accent) 0%, #d79921 100%);
  color: #282828;
}

.info-content {
  position: relative;
  z-index: 2;
}

.brand-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  display: block;
}

.branding-group h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-family: 'Hermit', monospace;
}

.branding-group p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease;
}

.icon-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.2);
}

.icon-item i {
  font-size: 2rem;
}

.icon-item span {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.auth-form-area {
  padding: 4rem;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 2.5rem;
}

.form-header h2 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-header p {
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group input {
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: 'Hermit', monospace;
  transition: all 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(215, 153, 33, 0.1);
}

.submit-btn {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--accent);
  color: #fff;
  transition: all 0.3s ease;
}

[data-theme="dark"] .submit-btn {
  color: #282828;
}

.submit-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.form-footer a {
  font-weight: 700;
  color: var(--accent);
}

@media (max-width: 992px) {
  .auth-wrapper {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  .auth-side-info {
    display: none;
  }
}
</style>
