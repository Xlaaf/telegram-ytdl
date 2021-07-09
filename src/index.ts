import type { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types"
import type { ExtendedContext } from "../types"

import debug from "debug"
import { Telegraf } from "telegraf"
import got from "got"

import setup from "./setup"
import { AUDIO_VIDEO_KEYBOARD, YOUTUBE_REGEX } from "./constants"
import strings from "./strings"
import Downloader from "./downloader"
import actionHandler from "./actionHandler"
import { filenameify, removeHashtags } from "./util"
import Notifier from "./notify"

!(async () => {
  const log = debug("telegram-ytdl")
  const BOT_TOKEN = await setup()

  const bot = new Telegraf<ExtendedContext>(BOT_TOKEN)
  const downloader = new Downloader(log)
  const notifier = new Notifier(bot)

  //? initial filter and provide the name to the ctx
  bot.use(async (ctx, next) => {
    if (ctx.from?.is_bot) return

    const name = `@${ctx.from?.username}` || `${ctx.from?.first_name} ${ctx.from?.last_name}`
    ctx.name = name

    next()
  })

  //? handle the initial /start command
  bot.command("start", ctx => {
    ctx.replyWithHTML(strings.start(ctx.name))
  })
  bot.telegram.setMyCommands([{ command: "start", description: strings.startDescription() }])

  //? extend the context
  bot.on("text", async (ctx, next) => {
    const text = ctx.message?.text
    const messageLog = `[${ctx.name}](${ctx.message?.message_id}) ${text}`
    log(messageLog)

    const youtube = YOUTUBE_REGEX.exec(text)?.[1] || ""
    if (youtube) {
      ctx.youtube = text
      return next()
    }

    if (ctx.chat.type !== "private") return

    notifier.unsupported(messageLog)
    return ctx.replyWithHTML(strings.unsupported())
  })

  //? initial reply
  bot.on("text", async ctx => {
    if (ctx.youtube) {
      const extra: ExtraReplyMessage & ExtraEditMessageText = {
        reply_markup: AUDIO_VIDEO_KEYBOARD,
      }

      ctx.replyWithHTML(strings.formatSelection(), {
        ...extra,
        reply_to_message_id: ctx.message.message_id,
      })
      try {
        await downloader.youtube(ctx.youtube)
      } catch (error) {
        log(error)
        notifier.error(error)
        ctx.reply(strings.error(), { disable_web_page_preview: true })
      }
    }

  actionHandler(bot, downloader, log.extend("actionHandler"))

  await bot.launch()
  console.log("bot launched")
})()
