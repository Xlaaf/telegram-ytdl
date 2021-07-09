/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { bold } from "./util"

const strings = {
  start: (name: string) =>
    `Halo ${name}\nSilahkan Kirim Link ${bold("youtube")} link `,

  startDescription: () => `kirim pesan start lagi`,

  unsupported: () => `maaf, aku belum tahu cara mengunduhnya.`,

  formatSelection: (video?: string) =>
    `download${video ? " " + bold(video) : ""} Mau dijadikan mp3 atau MP4?`,

  downloading: (add?: string) => `Mendownload${add ? " " + add : ""}...`,

  error: (add?: string) => `sepertinya ada yang salah.` + (add ? "\n\n" + add : ""),

  overSize: (type: string, url: string) =>
    `sayangnya, bot telegram hanya dapat mengunggah file hingga 50 MB, dan ${type} Anda lebih besar dari itu.\n`,
}

export default strings
