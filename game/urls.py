from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('save_score/', views.save_score, name='save_score'),
]