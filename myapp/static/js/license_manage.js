var baseUrlApi = 'http://localhost:5008';
var rDict = {};
var rFac = [];
var rLine = [];
$(document).ready(function () {
    setSettingRouter()
    $.post({
        url: 'http://localhost:5008/dict/get',
        data: JSON.stringify({ Type: 'FAC' }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        getLine(data[0].code);
        data.forEach(el => {
            $('#modalSettingRouter #fac').append('<option value = "' + el.code + '">' + el.desc + ' (' + el.code + ')</option>');
        });
    });
});
function setRouterOperate(rDict) {
    var tbSetting = $('#tbSetting');
    var bdTbSetting = tbSetting.find('tbody');
    bdTbSetting.empty();
    if (!Object.keys(rDict).length) {
        bdTbSetting.append('<tr><td>No Operate Setting Data !</td></tr>')
    }
    for (var itemFac in rDict) {
        vF = rDict[itemFac];
        bdTbSetting.append('<tr ><th class = "' + (Object.keys(vF.child).length ? '' : '') + '">' + itemFac + ' (' + vF.desc + ')</th></tr>');
        for (var item in vF.child) {
            item = vF.child[item];
            let haveStation = !Object.keys(item.child).length ? '&nbsp;<span class="badge bg-danger">Empty</span>' : '';
            bdTbSetting.append('<tr> <td style="padding-left: 10%;"><li>' + item.code + ' (' + item.desc + ') ' + haveStation + '</li></td></tr>');
            for (var itemStation in item.child) {
                itemStation = item.child[itemStation];
                bdTbSetting.append('<tr><td><div class="d-flex justify-content-between align-items-center"><li style= "list-style-type: square;">' + itemStation.desc + ' (' + itemStation.code + ')</li></div></td></tr>')
            }
        }
    };
}

function setSettingRouter() {
    $.post({
        url: baseUrlApi + '/dict/all',
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        console.log(data)
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
        setRouterOperate(rDict);
    });
}
function getLine(fac) {
    $.post({
        url: 'http://localhost:5008/dict/get',
        data: JSON.stringify({ Type: 'LINE', RefCode: fac }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        $('#modalSettingRouter #line').empty();
        if (Object.keys(data).length) {
            getStation(data[0].code);
            $('#btnAddSt').removeClass('disabled')
            data.forEach(el => {
                $('#modalSettingRouter #line').append('<option value = "' + el.code + '">' + el.desc + ' (' + el.code + ')</option>');
            });
        }else{
            getStation('');
            $('#btnAddSt').addClass($('#btnAddSt').hasClass('disabled') ? '' : 'disabled');
            $('#modalSettingRouter #line').append('<option>Not Found Line !</option>');
        }
    });
}

$.fn.delStation = function () {
    var tr = this.closest('tr');
    var text = tr.find('td:first-child').text();
    console.log();
    var code = tr.attr('code');
    $.confirm({
        title: 'Are you sure ?',
        content:'Do you want to delete "<span class = "c-red number">' + text + '</span>"',
        buttons: {
            confirm:{
                text: 'Confirm',
                btnClass: 'btn-blue',
                action:function(){
                    $.get({
                        url: 'http://localhost:5008/dict/delete',
                        data: JSON.stringify({ Type: 'STATION', RefCode: line }),
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (data) {
                        console.log(data)
                    });
                    $.get('http://localhost:5008/dict/delete/' + code,
                        function (data) {
                            if(!data.status){
                                alert("Remove Staion Not Success !")
                                return false;
                            }   
                            $.growl.notice({ title: "Message", message: "Remove Station Success !" });
                            tr.remove();
                        }
                    );
                }
            },
            cancel: {
                text: 'Cancel',
                action:function(){
                    
                }
            }
        }
    });
   
   
}

$.fn.addStation = function () {
    var el = $(this);
    var form = el.closest('form');
    var line = form.find('#line').val()
    var stName = form.find('#stName');
    if (stName.val().trim() != '') {
        $.post({
            url: baseUrlApi + '/dict/add',
            data: JSON.stringify({
                type: 'STATION',
                station: stName.val(),
                line: line
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (data) {
            if (!data.status) {
                alert('Can not Add new station !');
                return false;
            }
            getStation(line);
            $.growl.notice({ title: "Message", message: "New Station Success " });
        });
        stName.val('');
    }else{
        stName.focus();
    }
}

function getStation(line = '') {
    $.post({
        url: 'http://localhost:5008/dict/get',
        data: JSON.stringify({ Type: 'STATION', RefCode: line }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        var tbody = $('#tbStation tbody ');
        tbody.empty();
        if (Object.keys(data).length) {
            data.forEach(el => {
                tbody.append('<tr code = "' + el.code + '"><td>' + el.desc + ' (' + el.code + ')</td><td> <a href="javascript:void(0)" onclick = "$(this).delStation()"><i class="fa-solid fa-trash"></i></a></td></tr>');
            });
        } else {
            tbody.append('<tr><td colspan = "2" class = "c-red">Not Found Data !</td></tr>');
        }
    });
}

function addLicense() {
    var licenseName = $('[name=inpLicenseName]')
    if (licenseName.val().trim().length == 0) {
        licenseName.closest('form').addClass('was-validated')
        return false;
    }
    $.ajax({
        type: 'POST',
        url: baseUrlApi + '/licenseMstr/add',
        contentType: 'application/json',
        data: JSON.stringify({ LicenseName: licenseName.val() }),
        success: function (data) {
            try {
                if (!data.status) {
                    alert('ไม่สามารถเพิ่ม License  ได้ ');
                    return false;
                }
                $('#modalAddLicense').modal('toggle')
            } catch (error) {
                alert(error)
            }
        }
    },);
}


