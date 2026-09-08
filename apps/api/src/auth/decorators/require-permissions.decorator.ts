import { SetMetadata } from "@nestjs/common";
import { PermissionKey } from "@aritech/shared";

export const PERMISSIONS_KEY = "permissions";

/**
 * Exige uma ou mais permissões para acessar a rota — ADR-004 §17.
 * A verificação real acontece sempre no backend (PermissionsGuard).
 */
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
