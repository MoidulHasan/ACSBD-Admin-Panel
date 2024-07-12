<script setup lang="ts">
const { user, logoutUser, isAuthenticated } = useAuthStore();
const store = useStore();

const menu = ref();
const items = ref([
  {
    label: "Account",
    icon: "pi pi-user",
    command: handleMenuSelect,
  },
  {
    label: "Inbox",
    icon: "pi pi-envelope",
    command: handleMenuSelect,
  },
  {
    label: "Logout",
    icon: "pi pi-sign-out",
    command: handleMenuSelect,
  },
]);

const toggle = (event) => {
  menu.value.toggle(event);
};

async function handleMenuSelect(event) {
  if (event.item.label === "Logout") {
    store.loading = true;
    await logoutUser();
    store.loading = false;

    if (!isAuthenticated()) {
      await navigateTo("/login");
    }
  }
}
</script>

<template>
  <header class="header-container">
    <div
      class="header flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11"
    >
      <button>
        <img src="~/assets/images/icons/menu-close.png" alt="menu close" />
      </button>

      <div>
        <Avatar
          :image="user?.image ?? 'https://i.ibb.co/ZSLq2C6/admin.png'"
          class="profile-avatar"
          size="large"
          shape="circle"
          type="button"
          aria-haspopup="true"
          aria-controls="overlay_menu"
          :ripple="true"
          @click="toggle"
        />

        <Menu
          id="overlay_menu"
          ref="menu"
          :model="items"
          popup
          :ripple="true"
        />
      </div>
    </div>
  </header>
</template>

<style scoped lang="postcss">
.header-container {
  height: 70px;
  padding: 24px 19px;

  position: sticky;
  top: 0;
  right: 0;

  background: var(--primary-color-white);
  box-shadow: 0 4px 24px 0 rgba(20, 25, 38, 0.05);
  z-index: 19;
  transition: all 0.3s ease;

  .header {
    height: 32px;
    width: 100%;

    .profile-avatar {
      height: 100%;
      max-width: 32px;
    }
  }
}
</style>
