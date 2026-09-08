import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Marca uma rota como pública (não exige autenticação) — ex.: login. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
