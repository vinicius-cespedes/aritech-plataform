import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionKey } from "@aritech/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";

/**
 * Autorização por permissão — ADR-004 §14/§15.
 * As permissões são recarregadas do banco a cada requisição (não confiamos em
 * um token de longa duração como fonte permanente de autorização), garantindo
 * que uma revogação de acesso tenha efeito imediato.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string } | undefined;
    if (!user) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "Usuário não autenticado." });
    }

    const roles = await this.prisma.client.userRole.findMany({
      where: { userId: user.id },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    const granted = new Set<string>();
    for (const userRole of roles) {
      for (const rolePermission of userRole.role.permissions) {
        granted.add(rolePermission.permission.key);
      }
    }

    const missing = required.filter((permission) => !granted.has(permission));
    if (missing.length > 0) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: `Permissão(ões) ausente(s): ${missing.join(", ")}.`,
      });
    }

    return true;
  }
}
