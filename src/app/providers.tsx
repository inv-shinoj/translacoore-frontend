"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { registerAuthHandlers } from "@/lib/api";
import { restoreSession, logout } from "@/store/slices/authSlice";

function AuthBootstrap() {
  useEffect(() => {
    registerAuthHandlers(
      async () => {
        const action = await store.dispatch(restoreSession());
        return action.payload?.access ?? null;
      },
      () => {
        store.dispatch(logout());
      }
    );
  }, []);

  return null;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <Provider store={store}>
        <AuthBootstrap />
        {children}
      </Provider>
    </GoogleOAuthProvider>
  );
}
