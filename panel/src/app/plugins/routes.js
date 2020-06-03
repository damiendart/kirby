import auth from "./auth.js";

/* Routes */
export default (Vue, store) => {

  const authenticate = auth(Vue, store);

  return [
    {
      path: "/",
      name: "Home",
      redirect: "/site",
    },
    {
      path: "/login",
      component: Vue.component("k-login-route"),
    },
    {
      path: "/settings",
      name: "Settings",
      component: Vue.component("k-settings-route"),
      beforeEnter: authenticate,
    },
    {
      path: "/site",
      name: "Site",
      component: Vue.component("k-site-route"),
      beforeEnter: authenticate,
    },
    {
      path: "/users",
      name: "Users",
      component: Vue.component("k-users-route"),
      beforeEnter: authenticate,
    },
    {
      path: "/users/role/:role",
      name: "UsersByRole",
      component: Vue.component("k-users-route"),
      props: (route) => ({
        role: route.params.role,
      }),
      beforeEnter: authenticate,
    },
    {
      path: "/users/:id",
      name: "User",
      component: Vue.component("k-user-route"),
      props: (route) => ({
        id: route.params.id,
      }),
      beforeEnter: authenticate,
    },
    {
      path: "*",
      name: "NotFound",
      beforeEnter: (to, from, next) => {
        next("/");
      },
    },
  ];
};