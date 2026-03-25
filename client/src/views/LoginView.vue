<template>
  <div class="auth-view flex items-center justify-center">
    <div class="auth-card">
      <h2>Giriş Yap</h2>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4 mt-8">
        <label>
          E-posta
          <input type="email" required placeholder="ornek@email.com" />
        </label>
        <label>
          Şifre
          <input type="password" required placeholder="••••••••" />
        </label>
        <button type="submit" class="btn">Giriş Yap</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-view { min-height: 70vh; }
.auth-card {
  background: var(--bg-card);
  padding: 2.5rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border-color);
}
h2 { text-align: center; color: var(--accent); }
label { display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-secondary); }
input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.btn { margin-top: 1rem; width: 100%; font-size: 1.1rem; }
</style>
