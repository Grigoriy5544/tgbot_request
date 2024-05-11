import {AppService} from './app.service';
import {Telegraf} from "telegraf";
import {Ctx, Hears, InjectBot, Message, On, Start, Update} from "nestjs-telegraf";
import {actionButtons, requestButtons} from "./app.buttons";
import {Context} from "./context.interface";
import {ConfigService} from "@nestjs/config";

@Update()
export class AppUpdate {
    private TG_TOKEN: string
    private TG_TEXT_HELLO: string
    private TG_TEXT_INFORMATION: string
    private TG_ADMIN_ID: number
    constructor(private configService: ConfigService, @InjectBot() private readonly bot: Telegraf<Context>, private readonly appService: AppService) {
        this.TG_TOKEN = this.configService.get<string>('TG_TOKEN')
        this.TG_TEXT_HELLO = this.configService.get<string>('TG_TEXT_HELLO')
        this.TG_TEXT_INFORMATION = this.configService.get<string>('TG_TEXT_INFORMATION')
        this.TG_ADMIN_ID = this.configService.get<number>('TG_ADMIN_ID')
    }

    @Start()
    async startCommand(ctx: Context) {
        const isAdmin: boolean = this.appService.validateAdmin(ctx)
        isAdmin ?
            await ctx.reply("Привет администратор") :
            await ctx.replyWithHTML(this.TG_TEXT_HELLO, actionButtons())
        delete ctx.session.type
    }

    @Hears('💻 О нас')
    async information(ctx: Context) {
        await ctx.replyWithHTML(this.TG_TEXT_INFORMATION, actionButtons())
        delete ctx.session.type
    }

    @Hears('📃 Оставить заявку')
    async request(ctx: Context) {
        await ctx.replyWithHTML("Оставь заявку в формате:\n   1. Возраст:\n   2. Стек:\n   3. О себе:")
        ctx.session.type = "write_request"
    }


    @Hears('✅ Отправить')
    async doneTask(ctx: Context) {
        if (ctx.session.type === "send_request" && ctx.session.request !== undefined) {
            const res = ctx.session.request
            await ctx.telegram.sendMessage(
                String(this.TG_ADMIN_ID),
                `Заявка от: @${ctx.message.from.username} tg://user?id=${ctx.message.from.id}\n   1. ${res[0]}\n   2. ${res[1]}\n   3. ${res[2]}`
            )

            await ctx.deleteMessage()
            await ctx.reply('Успешно! Твою заявку рассмотрят модераторы', actionButtons())
            delete ctx.session.type
        }
    }

    @Hears('✏️ Изменить')
    async removeTask(ctx: Context) {
        if (ctx.session.type === "send_request" && ctx.session.request !== undefined) {
            await ctx.deleteMessage()
            delete ctx.session.request
            await this.request(ctx)
        }
    }


    @On('text')
    async getTask(@Message('text') message: string, @Ctx() ctx: Context) {
        if (!ctx.session.type) {
            await ctx.deleteMessage()
            await ctx.reply("Неизвестная команда", actionButtons())
            return
        }

        if (ctx.session.type === "write_request") {
            try {
                const regex = /(?<=\s|^)\d+\..*?(?=\s\d+\.|$)/g;
                const req = regex[Symbol.match](message)
                let res: string[] = [...req]

                res.map((el, i) => {
                    res[i] = String(res[i]).trim()
                    while (res[i].charAt(0) == "1" || res[i].charAt(0) == "2" || res[i].charAt(0) == "3") {
                        res[i] = res[i].slice(1).trim()

                        if (res[i].charAt(0) == ".") {
                            res[i] = res[i].slice(1).trim()
                            break
                        }
                    }
                })

                ctx.session.request = res
                await ctx.replyWithHTML(
                    `<b>Ваша заявка:</b>\n   <b>1. </b>${res[0]}\n   <b>2. </b>${res[1]}\n   <b>3. </b>${res[2]}`,
                    requestButtons()
                )
                ctx.session.type = "send_request"
            } catch (e) {
                delete ctx.session.type
                await ctx.replyWithHTML("<b>Ошибка</b>, попробуйте еще раз!", actionButtons())
            }
        }
    }
}