import dotenv
dotenv.load_dotenv()

from concurrent.futures import ThreadPoolExecutor
from aiohttp import web
import asyncio
import analysis
import logging

pool = ThreadPoolExecutor(9) ## I think we can serve 10 clients with 512MB of memory

@web.middleware
async def errorMiddleware(request, handler):
    try:
        return await handler(request)
    except Exception as e:
        logging.exception(e)
        return web.Response(text=f"Internal server error: {e}", status=500)

async def handle(request: web.Request):
    post = await request.post()
    text1 = post["a"].file.read().decode('utf-8')
    text2 = post['b'].file.read().decode('utf-8')
    minLen = int(post['min_len'])
    ratio = float(post['ratio'])
    loop = asyncio.get_running_loop()
    text = await loop.run_in_executor(pool, lambda: analysis.analyse_data(text1, text2, minLen, ratio))
    return web.Response(text=text, content_type='text/json', headers={'Access-Control-Allow-Origin': '*'})


app = web.Application(middlewares=[errorMiddleware])
app.add_routes([web.post('/compare', handle)])

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    web.run_app(app, port=8080)
