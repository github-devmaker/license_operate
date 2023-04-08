from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import serial.tools.list_ports
import time
import threading
from django.template import context, loader
import json
import random
import requests
import datetime
lines = [1, 2, 3, 4, 5, 6, 7, 8]
all_menu = [{'id': 1, 'name': 'one'}, {'id': 1, 'name': 'one'}]
items = 0
tempText = ''
ser = serial.Serial()
headers = {'Content-type': 'application/json;charset=utf-8'}
baseUrlApi = 'http://localhost:5008/'
def getItems(request):
    global tempText
    global items
    return JsonResponse({"message": tempText, 'item': items}, status=200)


def thread_callback():
    while True:
        global items
        items = items + 1
        print('----------- ' + str(items))
        time.sleep(1)


def index(request):
    global items
    global lines
    context = {'menus': all_menu, 'item': items, 'lines': lines}
    return render(request, 'index.html', context)


def login(request):
    uname = request.method.GET['uname']
    pws = request.method.GET['pwd']
    return render(request, 'login.html', {'uname': uname, 'pwd': pws})


def about(request):
    return HttpResponse('<h1>About</1>')


def license(request):
    return render(request, 'license.html')
def license_main(request):
        return render(request,'license/main.html',{})

def station(request):
    context = {'name': 'Peerapong', 'render': 'old render'}
    return render(request, 'station.html', context)


def renderPage(request):
    context = {'name': 'Peerapong', 'render': 'old render  111'}
    return JsonResponse(context)


def addLicense(request):
    return JsonResponse(request)

def ajaxPost(url,json):
    r = requests.post(url = baseUrlApi + url,headers=headers,json = json)
    if(r.status_code == 200): 
        return r.json()
    return 

def manageUserOfLicense(request):
    return render(request,'')

def ModalManageUserOfLicense(request):
    return render(request,'modals/manage_user_of_license.html',{ 'effective' : str(datetime.date.today()),'expired':str(datetime.date.today())})

def ModelStationLicense(request):
    try:
        stCode = request.POST['stCode']
        r = ajaxPost('dict/get',{ 'Type': 'STATION', 'Code': stCode })
        rLicense = ajaxPost('dict/get',{'Type':'LICENSE'})
        if(r == None or len(r['data']) == 0):
            return render(request,'404.html',{})
        else:
            licenses = rLicense['data'] if len(rLicense['data']) else []
            return render(request,'modals/license_station.html',{ 'items' : r['data'][0],'licenses': licenses})
    except Exception as inst:
        print(inst)

def initItem(request):
    content = request.POST['items']
    content = json.loads(content)
    for item in content:
        for license in item['licenses']:
            license['expDate'] = license['expDate'][0:10] if license['expDate'] != None else 'DD-MM-YYYY'
            # license['expDate'] = datetime.datetime.strptime(str(license['expDate'])[0:10],'%Y-%m-%d').strftime('%m/%d/%y')
            # license['expDate'] = datetime.datetime.strptime("2013-1-25", '%Y-%m-%d').strftime('%m/%d/%y')
    return render(request, 'item.html', { 'items': content,'api':baseUrlApi})

# def setupReadCard(port='COM5',baudrate=9000):
#     global ser
#     port = 'COM5'
#     ports = serial.tools.list_ports.comports()
#     portList = []
#     for itemPort in ports:
#         portList.append(str(itemPort))
#         print(str(portList))

#     ser.baudrate = 9000
#     ser.port = str(port)
#     if not ser.isOpen():
#         ser.open()
#     else:
#         print('dis connect port !!!')


def readCard():
    # global ser
    global tempText
    ports = serial.tools.list_ports.comports()
    ser = serial.Serial()
    portList = []

    for itemPort in ports:
        portList.append(str(itemPort))
        print(str(portList))

    ser.baudrate = 9600
    ser.port = str('COM5')
    if not ser.isOpen():
        ser.open()
    while True:
        brf = bytearray(22)
        brf4 = bytearray(22)
        ArrBrf = bytearray(brf)
        delay = 0.3
        bf = bytearray(15)
        bf[0] = 0x01
        bf[1] = 0x30
        bf[2] = 0x30
        bf[3] = 0xBA
        bf[4] = 0x30
        bf[5] = 0x37
        bf[6] = 0x01
        bf[7] = 0x00
        bf[8] = 0xBC
        bf[9] = 0x03
        ser.write(bf)
        time.sleep(delay)
        brf = bytearray(ser.read_all())
        ArrBrf[0] = 0x04
        ser.write(ArrBrf)
        time.sleep(delay)
        brf2 = bytearray(ser.read_all())
        bf2 = bytearray(15)
        bf2[0] = 0x04
        bf2[1] = 0x04
        bf2[2] = 0x01
        bf2[3] = 0x30
        bf2[4] = 0x30
        bf2[5] = 0xB9
        bf2[6] = 0x02
        bf2[7] = 0x02
        bf2[8] = 0x01
        bf2[9] = 0x01
        bf2[10] = 0xB9
        bf2[11] = 0x03
        ser.write(bf2)
        time.sleep(delay)
        brf3 = bytearray(ser.read_all())

        ArrBrf[0] = 0x06
        aa = ser.write(ArrBrf)
        time.sleep(delay)
        brf4 = bytearray(ser.read_all())

        brf5 = bytearray(22)
        brf5 = bytearray(brf4)
        # print(len(list(brf5)))
        # print(brf5)
        # print(list(brf5))
        buffText = ''
        if len(list(brf5)) >= 7:
            # print(type(brf5[3]))
            if (int(brf5[3]) >= int(48) and int(brf5[3]) <= int(57)) or (
                    int(brf5[3]) >= int(73) and int(brf5[3]) <= int(90)):
                idx = 0
                for item in brf5:
                    if int(idx) >= int(3) and int(idx) <= int(7):
                        buffText += chr(item)
                    idx += 1
                tempText = buffText
            else:
                tempText = ''
        else:
            tempText = ''


def seleccion(request):
    context = {'menus': all_menu, 'item': items, 'lines': lines}
    return render(request, 'index.html', context)


# setupReadCard()
# readCard()
thr = threading.Thread(target=readCard)
# thr.start()