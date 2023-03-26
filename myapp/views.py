from django.shortcuts import render
from django.http import HttpResponse

all_menu = [{'id': 1, 'name': 'one'}, {'id': 1, 'name': 'one'}]


def login(request):
    return render(request, 'login.html', {})


def index(request):
    context = {'menus': all_menu}
    return render(request, 'index.html', context )


def about(request):
    return HttpResponse('<h1>About</1>')
