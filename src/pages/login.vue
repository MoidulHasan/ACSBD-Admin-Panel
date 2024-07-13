<script setup>
import * as yup from "yup";
import { useToast } from "primevue/usetoast";

useHead({
  title: "Login",
});

definePageMeta({
  name: "login",
  layout: "empty",
});

const toast = useToast();
const store = useStore();
const { authenticateUser, isAuthenticated } = useAuthStore();

const validationSchema = yup.object({
  email: yup
    .string()
    .required("Email is Required")
    .email("Enter valid email address"),
  password: yup.string().required("Password is Required"),
});

const { handleSubmit, errors, meta } = useForm({ validationSchema });

const { value: email } = useField("email");
const { value: password } = useField("password");

const onSubmit = handleSubmit(async (values) => {
  store.loading = true;
  const response = await authenticateUser({
    email: values.email,
    password: values.password,
  });
  store.loading = false;

  if (isAuthenticated()) {
    await navigateTo({ name: "dashboard" });
    return;
  }

  toast.add({
    severity: "error",
    summary: "Login Failed",
    detail: response.statusMessage,
    life: 3000,
  });
});
</script>

<template>
  <div class="page-content">
    <div class="form-container">
      <h2 class="title">Sign In</h2>
      <p class="subtitle mb-8">Login to your an account</p>

      <form @submit.prevent="onSubmit">
        <CommonFormInput
          id="email"
          label="Email Address"
          required
          :error="errors.email"
        >
          <InputText
            id="email"
            v-model="email"
            placeholder="Enter your email address"
            :invalid="!!errors.email"
          />
        </CommonFormInput>

        <CommonFormInput
          id="password"
          label="Password"
          required
          :error="errors.password"
          class="mt-3"
        >
          <Password
            id="password"
            v-model="password"
            placeholder="Enter your password"
            :invalid="!!errors.password"
            toggle-mask
            :feedback="false"
          />
        </CommonFormInput>

        <div class="flex justify-between align-items-center mt-3">
          <div class="checkbox-container flex align-items-center">
            <Checkbox disabled input-id="rememberme" binary />
            <label for="rememberme" class="ml-2 subtitle">
              Keep me signed in
            </label>
          </div>

          <NuxtLink class="subtitle" to="/reset-password">
            <span class="text-primary-color-envitect-sam-blue">
              Forgot Password?
            </span>
          </NuxtLink>
        </div>

        <div class="mt-8">
          <Button
            class="form-submit-button w-full"
            :disabled="!meta.valid || !meta.dirty"
            :loading="store.loading"
            type="submit"
          >
            Login
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.page-content {
  background: #f2f7fb;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .form-container {
    width: 100%;
    max-width: 540px;
    background: var(--primary-color-white);

    height: 100%;
    border-radius: 12px;
    padding: 24px 40px;

    .title {
      width: 280px;
      height: 48px;

      font-style: normal;
      font-weight: 600;
      font-size: 32px;
      line-height: 48px;

      display: flex;
      align-items: center;

      color: #3e3e3e;
    }

    .subtitle {
      color: #575864;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
    }
  }
}
</style>

<style>
.checkbox-container {
  .p-checkbox {
    height: 20px;
    width: 20px;

    .p-checkbox-box {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
