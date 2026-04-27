from fastapi import FastAPI

app = FastAPI()

@app.get("/test")
async def index():
    return {"message": "Hello FastAPI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)