from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from .models import HighScore
import json
from django.views.decorators.csrf import csrf_protect
import logging

logger = logging.getLogger(__name__)

@login_required
def index(request):
    user_score = 0
    try:
        if request.user.is_authenticated:
            hs, created = HighScore.objects.get_or_create(user=request.user)
            user_score = hs.score
            logger.info(f"User {request.user.username} high score: {user_score}")
        else:
            logger.warning("User not authenticated, setting user_score to 0")
    except Exception as e:
        logger.error(f"Error retrieving high score: {str(e)}")
    return render(request, "game.html", {"user_score": user_score})

def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            logger.info(f"New user registered: {user.username}")
            return redirect("index")
    else:
        form = UserCreationForm()
    return render(request, "registration/register.html", {"form": form})

def logged_out(request):
    logger.info("User accessed logged_out page")
    return render(request, "registration/logged_out.html")

@csrf_protect
@login_required
def save_score(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            score = int(data.get("score", 0))
            high_score, _ = HighScore.objects.get_or_create(user=request.user)
            if score > high_score.score:
                high_score.score = score
                high_score.save()
                logger.info(f"Saved high score {score} for user {request.user.username}")
            return JsonResponse({"status": "ok"})
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Error saving score: {str(e)}")
            return JsonResponse({"status": "error", "message": "Invalid data"}, status=400)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=400)