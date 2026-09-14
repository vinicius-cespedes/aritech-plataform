import { createHash, randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { DomainError } from "@aritech/shared";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { PrismaService } from "../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { parseDurationToMs } from "./duration.util";

export interface TokenPair {
  accessToken: string;
  accessTokenMaxAgeMs: number;
  refreshToken: string;
  refreshTokenMaxAgeMs: number;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.client.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return null;
    }
    const valid = await argon2Verify(user.passwordHash, password);
    if (!valid) {
      return null;
    }
    return user;
  }

  async issueTokenPair(userId: string, email: string, ip?: string): Promise<TokenPair> {
    const accessTtl = this.config.get<string>("JWT_ACCESS_TTL", "15m");
    const refreshTtl = this.config.get<string>("JWT_REFRESH_TTL", "7d");

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      { secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"), expiresIn: accessTtl },
    );

    const refreshToken = randomBytes(48).toString("hex");
    const refreshTokenMaxAgeMs = parseDurationToMs(refreshTtl);

    await this.prisma.client.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTokenMaxAgeMs),
        createdByIp: ip,
      },
    });

    return {
      accessToken,
      accessTokenMaxAgeMs: parseDurationToMs(accessTtl),
      refreshToken,
      refreshTokenMaxAgeMs,
    };
  }

  /** Rotaciona o refresh token — ADR-004 §12 ("permitir rotação", "impedir reutilização indevida"). */
  async rotateRefreshToken(rawToken: string, ip?: string): Promise<TokenPair> {
    const tokenHash = hashToken(rawToken);
    const existing = await this.prisma.client.refreshToken.findUnique({ where: { tokenHash } });

    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "Sessão inválida ou expirada." });
    }

    const user = await this.prisma.client.user.findUnique({ where: { id: existing.userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "Usuário inativo." });
    }

    const pair = await this.issueTokenPair(user.id, user.email, ip);

    await this.prisma.client.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });
    // Vincula o token antigo ao novo, para permitir detectar reuso indevido no futuro.
    const newHash = hashToken(pair.refreshToken);
    await this.prisma.client.refreshToken.updateMany({
      where: { tokenHash: newHash },
      data: { replacedByTokenId: existing.id },
    });

    return pair;
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await this.prisma.client.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return argon2Hash(password);
  }

  /**
   * Troca de senha — fecha a lacuna do `mustChangePassword` (setado no seed
   * do admin, mas até então nunca acionável: não existia nenhuma forma de
   * efetivamente trocar a senha). Exige a senha atual mesmo quando
   * `mustChangePassword` está marcado, para não abrir uma janela onde
   * qualquer requisição autenticada pudesse trocar a senha sem provar
   * conhecer a atual.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.client.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await argon2Verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new DomainError("AUTH_INVALID_CURRENT_PASSWORD", "Senha atual incorreta.");
    }

    const passwordHash = await this.hashPassword(newPassword);
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });

    // Revoga todas as sessões (refresh tokens) existentes — uma troca de
    // senha deve encerrar qualquer sessão obtida com a senha antiga.
    await this.prisma.client.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId: userId,
      module: "identity",
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: userId,
      source: "WEB",
      result: "SUCCESS",
    });
  }

  async recordLoginAudit(params: {
    result: "SUCCESS" | "FAILURE" | "DENIED";
    userId?: string;
    email: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId: params.userId,
      actorLabel: params.userId ? undefined : params.email,
      module: "identity",
      action: params.result === "SUCCESS" ? "LOGIN" : "LOGIN_DENIED",
      entityType: "User",
      entityId: params.userId,
      source: "WEB",
      result: params.result,
      ipAddress: params.ip,
      userAgent: params.userAgent,
    });
  }
}
