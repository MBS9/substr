from concurrent.futures import ThreadPoolExecutor
from os import path
from aiohttp import web
import asyncio
import jinja2
import analysis
import pathlib

pool = ThreadPoolExecutor(3)

templatesPath = pathlib.Path(__file__).parent / 'templates'

env = jinja2.Environment(loader=jinja2.FileSystemLoader(templatesPath.resolve()),
                         autoescape=jinja2.select_autoescape(default=True))

resp = env.get_template("resp.html")
form = env.get_template("form.html")

async def handle(request: web.Request):
    post = await request.post()
    text1 = post["textA"].file.read().decode('utf-8')
    text2 = post['textB'].file.read().decode('utf-8')
    minLen = int(post['minLen'])
    ratio = float(post['ratio'])
    loop = asyncio.get_running_loop()
    text = await loop.run_in_executor(pool, lambda: analysis.analyse_data(text1, text2, minLen, ratio))
    return web.Response(text=resp.render(results=text), content_type='text/html')


app = web.Application()
app.add_routes([web.post('/compare', handle),
                web.get('/', lambda req: web.Response(
                    text=form.render(),
                    content_type='text/html'))
                ])

if __name__ == '__main__':
    web.run_app(app, port=8080)
