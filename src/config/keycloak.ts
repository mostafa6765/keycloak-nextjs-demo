export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
} as const;

// Validate the configuration
export const isKeycloakConfigValid = () => {
  return !!(keycloakConfig.url && keycloakConfig.realm && keycloakConfig.clientId);
};