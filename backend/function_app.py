# function_app.py — Azure Functions から FastAPI を動かすための入口
# main.py の FastAPI アプリを、そのまま Functions の HTTP の入口につなぐ（main.py は変えない）
# ローカルの動かし方（uvicorn main:app --reload）は今までどおり
import azure.functions as func

from main import app as fastapi_app

app = func.AsgiFunctionApp(app=fastapi_app, http_auth_level=func.AuthLevel.ANONYMOUS)
