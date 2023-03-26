from django.urls import path
from myapp import views

urlpatterns = [
    path('', views.index), 
    path('about', views.about),
    path('login',views.login),
    path('license/<string:username>',views.license, name='license')
    ]
