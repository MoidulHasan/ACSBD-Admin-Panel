export default defineNuxtRouteMiddleware((to) => {
  const { authorized, user } = storeToRefs(useAuthStore());
  const token = useCookie("token");
  const userCookie = useCookie("user");

  if (token.value && userCookie.value) {
    authorized.value = true;
    user.value = userCookie.value;
  }

  if (token.value && to?.name === "login") {
    return navigateTo("/");
  }

  if (!token.value && to?.name !== "login") {
    abortNavigation();
    return navigateTo("/login");
  }
});
