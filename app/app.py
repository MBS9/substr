from concurrent.futures import ThreadPoolExecutor
from aiohttp import web
from asyncio import get_running_loop
import jinja2
import analysis

pool = ThreadPoolExecutor(3)

env = jinja2.Environment(loader=jinja2.FileSystemLoader('templates'),
                         autoescape=jinja2.select_autoescape(default=True))

resp = env.get_template("resp.html")

async def handle(request: web.Request):
    text1 = request.query.get('text1', "text1")
    text2 = request.query.get('text2', "text2")
    minLen = int(request.query.get('minLen', '3'))
    ratio = float(request.query.get('ratio', '1'))
    loop = get_running_loop()
    text = await loop.run_in_executor(pool, lambda: analysis.analyse_data()(text1, text2, minLen, ratio))
    return web.Response(text=resp.render(response=text), content_type='text/html')

async def wshandle(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == web.WSMsgType.text:
            await ws.send_str("Hello, {}".format(msg.data))
        elif msg.type == web.WSMsgType.binary:
            await ws.send_bytes(msg.data)
        elif msg.type == web.WSMsgType.close:
            break

    return ws


app = web.Application()
app.add_routes([web.get('/', handle),
                web.get('/echo', wshandle)
                ])

if __name__ == '__main__':
    web.run_app(app)