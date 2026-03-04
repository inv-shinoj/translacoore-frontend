"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store, persistor } from "@/store";
import { Toaster } from "sonner";
import { registerAuthHandlers } from "@/lib/api";
import { setAccessToken } from "@/lib/authToken";
import { restoreSession, logout } from "@/store/slices/authSlice";

function AuthBootstrap() {
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    // Sync the in-memory token from the persisted store on startup
    const persisted = store.getState().auth;
    if (persisted.accessToken) {
      setAccessToken(persisted.accessToken);
    }

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
        <PersistGate loading={null} persistor={persistor}>
          <AuthBootstrap />
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
}
