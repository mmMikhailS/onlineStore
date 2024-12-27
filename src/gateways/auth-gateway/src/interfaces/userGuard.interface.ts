export interface UserGuardInterface {
  authApp: boolean;
  doubleGuardPass: boolean;
  doubleGuardPasswords: string[];
  secret2fa: string;
}
