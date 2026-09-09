import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { DocumentsService } from "./documents.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";

@ApiTags("documents")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("documents")
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @RequirePermissions("documents.manage")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("documents.manage")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }))
  @Post()
  async upload(
    @Body("title") title: string,
    @Body("category") category: string,
    @Body("classification") classification: string | undefined,
    @Body("payableId") payableId: string | undefined,
    @Body("receivableId") receivableId: string | undefined,
    @Body("documentRole") documentRole: string | undefined,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "Arquivo não enviado (campo 'file')." });
    }
    if (!title || !category) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "title e category são obrigatórios." });
    }
    return this.service.upload(
      {
        title,
        category,
        classification: classification as never,
        file,
        linkTo: payableId || receivableId ? { payableId, receivableId, role: documentRole ?? "OTHER" } : undefined,
      },
      user.id,
    );
  }

  @RequirePermissions("documents.manage")
  @Get(":id/download")
  async download(@Param("id") id: string, @Res() res: Response) {
    const { buffer, fileName, mimeType } = await this.service.download(id);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(buffer);
  }
}
