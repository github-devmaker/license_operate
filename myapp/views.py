from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import serial.tools.list_ports
import time
import threading
lines = [1,2,3,4,5,6,7,8]
all_menu = [{'id': 1, 'name': 'one'}, {'id': 1, 'name': 'one'}]
items = 0
tempText = ''
ser = serial.Serial()
def getItems(request):
    global tempText
    global items
    return JsonResponse({"message":tempText,'item':items},status=200)

def thread_callback():
        while True:
            global items
            items = items + 1
            print( '----------- ' + str(items))
            time.sleep(1)

def index(request):
    global items
    global lines
    context = {'menus': all_menu,'item':items,'lines':lines}
    return render(request, 'index.html', context)

def login(request):
    uname = request.method.GET['uname']
    pws = request.method.GET['pwd']
    return render(request, 'login.html', {'uname': uname, 'pwd': pws})

def about(request):
    return HttpResponse('<h1>About</1>')
def license_manage(request):
    context = { 'name':'Peerapong','render':'old render'}
    return render(request,'license_manage.html',context)
def renderPage(request):
    context = { 'name':'Peerapong','render':'old render  111'}
    return JsonResponse(context)
def addLicense(request):
    return JsonResponse(request)
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
            if (int(brf5[3]) >= int(48) and int(brf5[3]) <= int(57)) or (int(brf5[3]) >= int(73) and int(brf5[3]) <= int(90)):
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
    context = {'menus': all_menu,'item':items,'lines':lines}
    return render(request,'index.html',context)
# setupReadCard()
# readCard()
thr = threading.Thread(target=readCard)
# thr.start()