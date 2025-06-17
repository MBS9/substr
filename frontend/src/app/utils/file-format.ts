import { DisplayResultState } from "frontend/app/types"

export async function exportToFile(data: DisplayResultState) {
  const jsonStream = new ReadableStream({
    start(controller) {
      const json = JSON.stringify(data)
      controller.enqueue(new TextEncoder().encode(json))
      controller.close()
    },
  })
  const compressionStream = new CompressionStream("gzip")
  const compressedStream = jsonStream.pipeThrough(compressionStream)
  const compressed = await new Response(compressedStream).blob()
  const file = new File([compressed], "project.tile", { type: "application/octet-stream" })
  return file
}

export async function importFromFile(file: File) {
  const decompressionStream = new DecompressionStream("gzip")
  const decompressedStream = file.stream().pipeThrough(decompressionStream)
  const decompressed = await new Response(decompressedStream).text()
  return JSON.parse(decompressed) as DisplayResultState
}