from django.urls import path
from myapp import views

urlpatterns = [
    path('', views.index), 
    path('about', views.about),
    path('login',views.login),
    path('getItems',views.getItems,name='getItems'),
    path('renderPage',views.renderPage,name='renderPage'),
    path('license_manage',views.license_manage),
    path('addLicense',views.addLicense,name='addLicense'),
    ]
