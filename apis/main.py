from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
list={"item1": "value1", "item2": "value2"}
app = FastAPI()


class User(BaseModel):
    name: str
    age: int
    email: str

@app.get("/")
def root():
    return list
@app.post("/hello")
async def hello(user:User):
    await asyncio.sleep(5)  #
    return {"utilisateur":user}