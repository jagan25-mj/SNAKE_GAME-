from django.contrib import admin
from django.urls import path, include
from game.views import register, logged_out

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('game.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/logged_out/', logged_out, name='logged_out'),
    path('register/', register, name='register'),
]