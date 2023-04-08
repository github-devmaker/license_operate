var baseUrlApi = 'http://localhost:5008';
var rDict = {};
var rFac = [];
var rLine = [];
var modal = null;
var titleBar = '';
var tabCard = false;
var cardNo = '';
var appjson = 'application/json;charset=utf-8';
let selectedLine = null;
$(document).ready(function () {
    setInterval(function () {
        if (tabCard) {
            if (cardNo == '') {
                setDetailTabCard();
                return false;
            }
            $.get(baseUrlApi + '/HRM/employee/' + cardNo,
                function (data) {
                    if (data != null && data != '' && Object.keys(data).length) {
                        data = data[0];
                        setDetailTabCard(data);
                    }
                }
            );
        }
        // getCount();
    }, 1000);
    Dict();
    $('#modalLocation').on('shown.bs.modal', function () {
        modal = $(this);
        modal.find('select#fac').append($.map(rDict, function (el, index) {
            return '<option value = "' + el.code + '">' + el.desc + ' (' + el.code + ')</option>';
        }));
        setLine(modal.find('#line'));
    });
    $('#modalTabCard').on("shown.bs.modal", function () {
        cardNo = '';
        setDetailTabCard();
    });
    $('#modalTabCard').on("hidden.bs.modal", function () {
        cardNo = '';
        $('.grid-container .item').filter(function () {
            $(this).removeClass('click')
        })
    });
});

function setDetailTabCard(data = null) {
    var form = $('#formTabCard');
    form.find('#img').attr('src', data == null ? '' : ('http://dcidmc.dci.daikin.co.jp/PICTURE/' + data.code + '.JPG'));
    form.find('#name').html(data == null ? '' : (data.name + ' ' + data.surn));
}



$(document).on('click', '#conCard', function () {
    cardNumber = $('#cardNumber').val();
    if (cardNo != cardNumber) {
        cardNo = cardNumber;
        tabCard = true;
        $('#checkinout').prop('disabled', false);
    } else {
        tabCard = false;
    }
});

$(document).on('click', '#checkinout', function () {
    var el = $(this);
    var state = el.attr('state');
    var refCode = el.closest('.modal').find('#refCode').val();
    console.log(refCode)
    $.post({
        url: baseUrlApi + '/station/checkinout/',
        data: JSON.stringify({ state: 'in', code: cardNo, refCode: refCode }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        if (data.status) {
            hideModal('modalTabCard');
        } else {
            alert(data);
        }
    });
});

$(document).on('click', '#disCard', function () {
    cardNo = '';
});

$(document).on('click', '.item', function () {
    var form = $(this);
    var code = form.find('#code').val();
    var checkin = form.find('#checkin').val();
    $('.grid-container').find(".item").filter(function () {
        if ($(this).hasClass('click')) {
            $(this).removeClass('click');
        }
    })
    $(this).addClass('click');
    if (checkin == "None" || checkin == "") {
        $('#modalTabCard').find('#refCode').val(code);
        showModal('modalTabCard');
        tabCard = true;
    } else {
        $.confirm({
            title: 'Checkout',
            content: '<b class = "c-red">You are sure you want to Checkout !</b>',
            buttons: {
                confirm: {
                    text: 'CONFIRM',
                    btnClass: 'btn-blue',
                    keys: ['enter', 'shift'],
                    action: function () {
                        $.post({
                            url: baseUrlApi + '/station/checkinout/',
                            data: JSON.stringify({ state: 'out', code: checkin, refCode: code }),
                            contentType: 'application/json; charset=utf-8'
                        }).done(function (res) {
                            console.log(res);
                        });
                    }
                },
                cancel: function () {
                }
            }
        });
        tabCard = false;
    }
});


function setLine(el, fac = '') {
    if (fac == '') {
        fac = modal.find('#fac').val();
    }
    el.empty();
    for (let item in rDict[fac].child) {
        item = rDict[fac]['child'][item];
        el.append('<option value = "' + item.code + '">' + item.desc + ' (' + item.code + ')</option>');
    }
}

async function Dict() {
    var data = await doGetDict();
    data = await reFormatDict(data);
    titleBar = $('#titleLine').text();
    selectedLine = localStorage.getItem('selectedLine');
    console.log('set ' + selectedLine)
    if (selectedLine == "" || selectedLine === null) {
        $('#btnSelectLocation').trigger('click');
    }else{
        selectLocation(true);
    }
}

function reFormatDict(data) {
    data.forEach(element => {
        if (element.type == "FAC") {
            element['child'] = [];
            rDict[element.code] = element;
        }
    });
    $.each(data, function (index, val) {
        if (val.type == "LINE" && typeof rDict[val.refCode] !== 'undefined') {
            val['child'] = [];
            rDict[val.refCode]['child'][val.code] = val;
            $.each(data, function (indexInArray, valueOfElement) {
                if (valueOfElement.type == 'STATION' && valueOfElement.refCode == val.code) {
                    rDict[val.refCode]['child'][val.code]['child'][valueOfElement.code] = valueOfElement;
                }
            });
        }
    });
}

async function getStation(refCode = '') {
    return $.post({
        url: baseUrlApi + '/line/station/',
        data: JSON.stringify({ line: refCode }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        $.each(data, function (index, el) {
            if (typeof (el.user) != 'undefined' && Object.keys(el.user).length && el.checkinout == "in") {
                var a = moment(data[index]['user'][0]['join'], "YYYY-MM-DD");
                var b = moment();
                var diffMonth = b.diff(a, 'month');
                data[index]['wage'] = (diffMonth / 12 > 1 ? (diffMonth + ' Year') : diffMonth + ' Month');
                data[index]['pst'] = data[index]['user'][0]['posit'];
                data[index]['name'] = (data[index]['user'][0]['pren']).toUpperCase() + data[index]['user'][0]['name'] + ' ' + data[index]['user'][0]['surn'];
            } else {
                data[index]['user'] = [];
                data[index]['wage'] = '-';
                data[index]['pst'] = '-';
                data[index]['name'] = '-';
                data[index]['emcode'] = '';
            }
        });
    });
}
function doGetDict() {
    return $.ajax({
        url: baseUrlApi + '/dict/all',
        type: 'POST',
        contentType: 'application/json; charset=utf-8'
    });
}

$.fn.setSettingRouter = function () {
    $.post({
        url: baseUrlApi + '/dict/all',
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        data.forEach(element => {
            if (element.type == "FAC") {
                element['child'] = [];
                rDict[element.code] = element;
            }
        });
        $.each(data, function (index, val) {
            if (val.type == "LINE" && typeof rDict[val.refCode] !== 'undefined') {
                val['child'] = [];
                rDict[val.refCode]['child'][val.code] = val;
                $.each(data, function (indexInArray, valueOfElement) {
                    if (valueOfElement.type == 'STATION' && valueOfElement.refCode == val.code) {
                        rDict[val.refCode]['child'][val.code]['child'][valueOfElement.code] = valueOfElement;
                    }
                });
            }
        });
        console.log(rDict)
        $(this).setRouterOperate(rDict);
    });
}
function getCount() {
    $.get('/getItems', {}, function (data) {
        $('#count').html(data.message)
    });
}

async function selectLocation(auto = false) {
    var modal = $('#modalLocation');
    var line = modal.find('#line');
    titleBar = line.find('option:selected').text();
    $('#titleBar').text(titleBar);
    if (selectedLine != "" && selectedLine !== null) {
        hideModal('modalLocation');
        console.log('auto : ' ,auto , selectedLine)
        var result = await getStation(auto ? selectedLine : line.val());
        if (result) {
            localStorage.setItem("selectedLine",line.val())
            $.ajax({
                method: 'POST',
                url: '/initItem',
                headers: { "X-CSRFToken": $('[name=csrfmiddlewaretoken]').val() },
                data: { 'items': JSON.stringify(result) },
                success: function (data) {
                    $('.grid-container').append(data)
                }
            });
        }
    }
}

function hideModal(id) {
    const modal_el = document.querySelector('#' + id);
    const modal_obj = bootstrap.Modal.getInstance(modal_el);
    if (modal_obj == null) {
        return;
    }
    modal_obj.hide();
}

function showModal(id) {
    const modal_el = document.querySelector('#' + id);
    let modal_obj = bootstrap.Modal.getInstance(modal_el);

    if (modal_obj == null) {
        modal_obj = new bootstrap.Modal(modal_el, {
            backdrop: 'static'
        });
    }

    modal_obj.show();
}
