import { createStore } from "pulsy";

export const AUTH_STORE_NAME = "auth";

createStore(
  AUTH_STORE_NAME,
  {
    user: null
  },
  { persist: true }
);
