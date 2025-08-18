// context/KeycloakContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Keycloak, { KeycloakTokenParsed } from "keycloak-js";

interface KeycloakContextProps {
  keycloak: Keycloak | null;
  authenticated: boolean;
  initialized: boolean;
  token?: string;
  tokenParsed?: KeycloakTokenParsed;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  refreshToken: () => Promise<void>;
}

const KeycloakContext = createContext<KeycloakContextProps | undefined>(
  undefined
);

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
});

export const KeycloakProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string>();
  const [tokenParsed, setTokenParsed] = useState<KeycloakTokenParsed>();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    keycloak
      .init({
        onLoad: "check-sso", // or "login-required"
        pkceMethod: "S256",
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      })
      .then((auth) => {
        setAuthenticated(auth);
        setToken(keycloak.token);
        setTokenParsed(keycloak.tokenParsed || undefined);
        setInitialized(true);

        interval = setInterval(() => {
          keycloak
            .updateToken(60)
            .then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token);
                setTokenParsed(keycloak.tokenParsed || undefined);
              }
            })
            .catch(() => {
              console.error("Failed to refresh token, logging out");
              keycloak.logout();
            });
        }, 20000);
      })
      .catch((err) => {
        console.error("Keycloak init failed:", err);
        setInitialized(true);
      });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const login = useCallback(() => {
    keycloak.login();
  }, []);

  const logout = useCallback(() => {
    keycloak.logout();
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshed = await keycloak.updateToken(60);
      if (refreshed) {
        setToken(keycloak.token);
        setTokenParsed(keycloak.tokenParsed || undefined);
      }
    } catch (err) {
      console.error("Manual token refresh failed:", err);
    }
  }, []);

  const hasRole = useCallback(
    (role: string) => {
      return keycloak.realmAccess?.roles?.includes(role) ?? false;
    },
    []
  );

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        authenticated,
        initialized,
        token,
        tokenParsed,
        login,
        logout,
        hasRole,
        refreshToken,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};

// ✅ Custom Hook
export function useKeycloakAuth() {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error("useKeycloakAuth must be used within a KeycloakProvider");
  }
  return context;
}
