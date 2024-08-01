import json
from aiohttp import ClientSession
import os

secret = os.environ['RECAPTCHA_SECRET']
chaptcha = os.getenv('NO_CAPTCHA', '0') != '1'

async def validate(recaptcha_response: str) -> bool:
    if not chaptcha:
        return True
    content = {'secret': secret, 'response': recaptcha_response}
    async with ClientSession(headers={'Content-type': 'application/x-www-form-urlencoded'}) as session:
        async with session.post(
            f'https://www.google.com/recaptcha/api/siteverify?secret={secret}&response={recaptcha_response}'
            ) as resp:
            resp = await resp.json()
            return resp['success']