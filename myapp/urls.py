from django.urls import path
from myapp import views

urlpatterns = [
    path('', views.index), 
    path('about', views.about),
    path('login',views.login),
    path('getItems',views.getItems,name='getItems'),
    path('renderPage',views.renderPage,name='renderPage'),
    path('station',views.station),
    path('license',views.license),
    path('license/main',views.license_main),
    path('addLicense',views.addLicense,name='addLicense'),
    path('initItem',views.initItem,name='initItem'),
    path('ModelStationLicense',views.ModelStationLicense,name='ModelStationLicense'),
    path('ModalManageUserOfLicense',views.ModalManageUserOfLicense,name='ModalManageUserOfLicense'),
    ]
