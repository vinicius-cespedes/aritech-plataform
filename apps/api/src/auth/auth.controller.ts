import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { loginSchema, LoginInput } from "@aritech/validation";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "./decorators/current-user.decorator";

const REFRESH_COOKIE = "refresh_token";
const ACCESS_COOKIE = "access_token";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private setAuthCookies(res: Response, pair: { accessToken: string; accessTokenMaxAgeMs: number; refreshToken: string; refreshTokenMaxAgeMs: number }) {
    const secure = this.config.get<string>("NODE_ENV") === "production";
    res.cookie(ACCESS_COOKIE, pair.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: pair.accessTokenMaxAgeMs,
      path: "/",
    });
    res.cookie(REFRESH_COOKIE, pair.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: pair.refreshTokenMaxAgeMs,
      path: "/api/auth",
    });
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateCredentials(body.email, body.password);
    if (!user) {
      await this.auth.recordLoginAudit({ result: "FAILURE", email: body.email, ip: req.ip, userAgent: req.headers["user-agent"] });
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "Credenciais inválidas." });
    }

    const pair = await this.auth.issueTokenPair(user.id, user.email, req.ip);
    this.setAuthCookies(res, pair);
    await this.auth.recordLoginAudit({ result: "SUCCESS", userId: user.id, email: user.email, ip: req.ip, userAgent: req.headers["user-agent"] });

    return {
      user: { id: user.id, email: user.email, name: user.name, mustChangePassword: user.mustChangePassword },
    };
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (!rawToken) {
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "Refresh token ausente." });
    }
    const pair = await this.auth.rotateRefreshToken(rawToken, req.ip);
    this.setAuthCookies(res, pair);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (rawToken) {
      await this.auth.revokeRefreshToken(rawToken);
    }
    res.clearCookie(ACCESS_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
