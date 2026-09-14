import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../common/prisma/prisma.service";

export interface JwtPayload {
  sub: string;
  email: string;
}

function extractFromCookie(req: Request): string | null {
  return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.client.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      // ADR-004 §10 — usuários inativos/bloqueados não podem acessar a plataforma.
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, name: user.name, mustChangePassword: user.mustChangePassword };
  }
}
