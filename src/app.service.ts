import { Injectable } from '@nestjs/common';
import {Context} from "./context.interface";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AppService {
  private adminId: number
  constructor(private configService: ConfigService) {
    this.adminId = +this.configService.get<number>('TG_ADMIN_ID')
  }

  isAdmin = (id: number): boolean => {
    return id === this.adminId
  }

  validateAdmin = (ctx: Context): boolean => {
    const admin: boolean = this.isAdmin(ctx.message.from.id)

    admin ? ctx.session.role = "admin" : ctx.session.role = "user"

    return admin
  }
}
