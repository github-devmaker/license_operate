from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    name = "peerapong"
    age = 28
    return render(request, 'index.html', {"name": name,"age":age})


def about(request):
    return HttpResponse('<h1>About</1>')
