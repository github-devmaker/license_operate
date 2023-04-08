
var tbLicense = null;
var tbLicOfSt = null;
var listLicense = [];
$(document).ready(function () {
    $(this).setSettingRouter();
    $(this).setTbLicense();
    $.post({
        url: 'http://localhost:5008/dict/get',
        data: JSON.stringify({ Type: 'FAC' }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        if (typeof (data.data) != 'undefined' && Object.keys(data.data).length) {
            getLine(data.data[0].code);
            data.data.forEach(el => {
                $('#modalSettingRouter #fac').append('<option value = "' + el.code + '">' + el.desc + ' (' + el.code + ')</option>');
            });
        }
    });
    $('#modalLicOfSt').on('shown.bs.modal', function () {
        var modal = $(this);
        var stCode = modal.find('#stCode').val();
        $.post({ url: baseUrlApi + '/dict/get', data: JSON.stringify({ Type: 'STATION', Code: stCode }), contentType: 'application/json;charset=utf-8' }).done(function (data) {
            data = data.data;
            modal.find('#code').val(data[0].code);
            modal.find('#desc').val(data[0].desc);
            $.post({ url: baseUrlApi + '/dict/get/', data: JSON.stringify({ Type: 'LICENSE' }), contentType: 'application/json' }).done(function (data) {
                if (!Object.keys(listLicense).length) {
                    listLicense = data.data;
                }
                if (data != '' && data != null && typeof data.data != 'undefined') {
                    $('select#listLicense').empty();
                    $.each(data.data, function (indexInArray, valueOfElement) {
                        $('select#listLicense').append('<option value = "' + valueOfElement.code + '">' + valueOfElement.desc + ' (' + valueOfElement.code + ')' + '</option>');
                    });
                }
            });
            $(this).setTbStationSetting(stCode);
        });
        // $.ajax({
        //     method: 'POST',
        //     url: '/ModelStationLicense',
        //     headers: { "X-CSRFToken": $('[name=csrfmiddlewaretoken]').val() },
        //     data: {'stCode':stCode},
        //     success: function (data) {
        //        console.log(data);
        //        modal.find('form').html(data)
        //     }
        // });
    });
    $('#modalLicOfSt').on('hidden.bs.modal', function () {
        var modal = $(this);
        modal.find('form').emp
    })
});

$.fn.addLicToSt = function () {
    var el = $(this);
    var modal = el.closest('.modal');
    var stCode = $('#stCode').val();
    var licenseCode = modal.find('#listLicense option:selected').val();
    if (licenseCode != '' && typeof(licenseCode) != 'undefined') {
        $.post({ url: baseUrlApi + '/dict/add/', data: JSON.stringify({ type: 'STATION_LICENSE', code: stCode, refCode: licenseCode, desc: '' }), contentType: 'application/json;charset=utf-8' }).done(function (data) {
            if (typeof data.status != 'undefined' && data.status) {
                $('select#listLicense option[value="' + + '"]')
                tbLicOfSt.ajax.reload();
            }
        })
    }
}

$(document).on('click', '#delLicOfSt', function () {
    var tr = $(this).closest('tr');
    let dictId = tr.attr('dictId');
    $.get({ url: baseUrlApi + '/dict/delete/' + dictId }).done(function (data) {
        if (data.status != 'undefined' && data.status) {
            $.growl.notice({ title: "Message", message: "Remove License success !" });
            $('select#listLicense').empty();
            $.each(listLicense, function (indexInArray, valueOfElement) {
                $('select#listLicense').append('<option value = "' + valueOfElement.code + '">' + valueOfElement.desc + ' (' + valueOfElement.code + ')' + '</option>');
            });
            tbLicOfSt.ajax.reload();
        }
    })
});

$.fn.setTbStationSetting = function (stCode) {
    if (tbLicOfSt != null) {
        tbLicOfSt.destroy();
    }
    tbLicOfSt = $('#tbStationSetting').DataTable({
        ajax: {
            type: 'POST',
            url: baseUrlApi + '/dict/licenseofstation/',
            contentType: appjson,
            data: function (d) {
                return JSON.stringify({ Type: 'STATION_LICENSE', code: stCode });
            },
            dataSrc: function (json) {
                $.each(json, function (index, val) {
                    val['tool'] = '<button class = "btn btn-danger" id = "delLicOfSt" type = "button"><i class="fa-solid fa-trash"></i></button>';
                });
                var data = { data: json }
                $.each(json, function (indexInArray, valueOfElement) {
                    $('#listLicense').find('option[value="' + valueOfElement.refCode + '"]').remove();
                });
                return data.data;
            }
        },
        createdRow: function (row, data, dataIndex) {
            $(row).attr('dictId', data.dictId);
        },
        columns: [
            { data: 'refCode' },
            { data: 'desc' },
            { data: 'tool', width: '5%' }
        ],
        searching: false,
        info: false,
        paging: false,
        ordering: false,
        language: {
            emptyTable: "No data available in table",
        },
        fnDrawCallback: function (oSettings) {
            // $(oSettings.nTHead).hide();
        },
        initComplete: function (settings, json) {
        }
    });
}

$.fn.setTbLicense = function () {
    if (tbLicense == null) {
        tbLicense = $('#tbLicense').DataTable({
            ajax: {
                type: 'POST',
                url: baseUrlApi + '/dict/get/',
                "contentType": "application/json",
                data: function (d) {
                    return JSON.stringify({ 'Type': 'LICENSE', 'a': '1' });
                },
                dataSrc: function (json) {
                    json.data.forEach(element => {
                        console.log(element)
                        element['code'] = '<span class = "c-primary c-bold">' + element['code'] + '</span>';
                        element['tool'] = '<div class = "d-flex gap-2"><a class = "btn btn-primary" id = "manageUserOfLicense"><i class="fa-solid fa-user-group"></i></a><a class = "btn btn-primary"><i class="fa-solid fa-search"></i></a><button class = "btn btn-danger" onclick = "$(this).delDict()" tableReload = "license" text = "' + element.desc + '"><i class="fa-solid fa-trash"></i></button></div>';
                    });
                    return json.data;
                }
            },
            createdRow: function (row, data, dataIndex) {
                $(row).attr('dictId', data.dictId);
            },
            columns: [
                { data: 'code' },
                { data: 'desc' },
                { data: 'tool' }
            ],
            searching: false,
            info: false,
            paging: false,
            ordering: false,
            processing: true,
            serverSide: true,
            language: {
                emptyTable: "No data available in table",
                processing: "Loading..."
            },
            fnDrawCallback: function (oSettings) {
                // $(oSettings.nTHead).hide();
            },
            initComplete: function (settings, json) {
                // console.log(json);
            }
        });
    } else {
        tbLicense.ajax.reload();
    }
}

$.fn.setRouterOperate = function (rDict) {
    var tbStation = $('#tbStation');
    var bdTbStation = tbStation.find('tbody');
    bdTbStation.empty();
    if (!Object.keys(rDict).length) {
        bdTbStation.append('<tr><td>No Operate Setting Data !</td></tr>')
    }
    for (var itemFac in rDict) {
        vF = rDict[itemFac];
        bdTbStation.append('<tr ><th class = "' + (Object.keys(vF.child).length ? '' : '') + '">' + itemFac + ' (' + vF.desc + ')</th><th></th></tr>');
        for (var item in vF.child) {
            item = vF.child[item];
            let haveStation = !Object.keys(item.child).length ? '&nbsp;<span class="badge bg-danger">Empty</span>' : '';
            bdTbStation.append('<tr> <td style="padding-left: 10%;"><li>' + item.code + ' (' + item.desc + ') ' + haveStation + '</li></td><td></td></tr>');
            for (var itemStation in item.child) {
                itemStation = item.child[itemStation];
                bdTbStation.append('<tr><td><div class="d-flex justify-content-between align-items-center"><li style= "list-style-type: square;">' + itemStation.desc + ' (' + itemStation.code + ')</li></div></td><td><div class = "d-flex gap-2"><button class = "btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalLicOfSt" stCode = "' + itemStation.code + '" onclick = "$(this).modalLicOfSt()"><i class="fa fa-gear"></i></button><button class = "btn btn-danger"><i class="fa fa-trash"></i></button></div></td></tr>')
            }
        }
    };
}

$.fn.modalLicOfSt = function () {
    var el = $(this);
    var stCode = el.attr('stCode');
    $('#modalLicOfSt').find('#stCode').val(stCode);
}

function getLine(fac) {
    if (fac == '') {
        return false;
    }
    $.post({
        url: 'http://localhost:5008/dict/get',
        data: JSON.stringify({ Type: 'LINE', RefCode: fac }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        data = data.data;
        $('#modalSettingRouter #line').empty();
        if (Object.keys(data).length) {
            getStation(data[0].code);
            $('#btnAddSt').removeClass('disabled')
            $.each(data, function (indexInArray, el) {
                console.log(el)
                $('#modalSettingRouter #line').append('<option value = "' + el.code + '">' + el.desc + ' (' + el.code + ')</option>');
            });
        } else {
            getStation('');
            $('#btnAddSt').addClass($('#btnAddSt').hasClass('disabled') ? '' : 'disabled');
            $('#modalSettingRouter #line').append('<option>Not Found Line !</option>');
        }
    });
}


$.fn.delDict = function () {
    var el = $(this);
    var tableReload = el.attr('tableReload');
    var tr = el.closest('tr');
    var text = el.attr('text')
    var dictId = tr.attr('dictId');
    $.confirm({
        title: 'Are you sure ?',
        content: 'Do you want to delete "<span class = "c-red number">' + text + '</span>"',
        buttons: {
            confirm: {
                text: 'Confirm',
                btnClass: 'btn-blue',
                action: function () {
                    $.get({ url: baseUrlApi + '/dict/delete/' + dictId }).done(function (data) {
                        if (typeof (data.status) == 'undefined' || !data.status) {
                            alert("Remove Not Success !")
                            return false;
                        }
                        $.growl.notice({ title: "Message", message: "Remove Success !" });
                        if(tableReload == 'license'){
                            tbLicense.ajax.reload();
                        }else{
                            tr.remove();
                        }
                    })
                }
            },
            cancel: {
                text: 'Cancel',
                action: function () {

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
            url: baseUrlApi + '/dict/add/station',
            data: JSON.stringify({
                type: 'STATION',
                desc: stName.val(),
                refCode: line
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
    } else {
        stName.focus();
    }
}

function getStation(line = '') {
    var tbody = $('table#tbRouterStation tbody');
    tbody.empty();
    if (line == '') {
        return false;
    }
    $.post({
        url: 'http://localhost:5008/dict/get',
        data: JSON.stringify({ Type: 'STATION', RefCode: line }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (data) {
        data = data.data;
        if (Object.keys(data).length) {
            $.each(data, function (indexInArray, el) {
                tbody.append('<tr dictId = "' + el.dictId + '"><td>' + el.desc + ' (' + el.code + ')</td><td> <a href="javascript:void(0)" onclick = "$(this).delDict()" text = "' + el.desc + ' (' + el.code + ')' + '"><i class="fa-solid fa-trash"></i></a></td></tr>');
            });
        } else {
            tbody.append('<tr><td colspan = "2" class = "c-red">Not Found Data !</td></tr>');
        }
    });
}

$.fn.addLicense = function () {
    var el = $(this);
    var modal = el.closest('.modal');
    var licenseName = modal.find('#licenseName')
    if (licenseName.val().trim().length == 0) {
        licenseName.closest('form').addClass('was-validated')
        return false;
    }
    $.ajax({
        type: 'POST',
        url: baseUrlApi + '/dict/add/license',
        contentType: 'application/json',
        data: JSON.stringify({ type: 'LICENSE', desc: licenseName.val() }),
        success: function (data) {
            console.log(data);
            try {
                tbLicense.ajax.reload();
                modal.modal('toggle')
                $.growl.notice({ title: "Message", message: "Create License Success " });
            } catch (error) {
                alert(error)
            }
        }
    },);
}


function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

$(document).on('click', '#manageUserOfLicense', function () {
    var tr = $(this).closest('tr');
    var dictId = tr.attr('dictId')    
    $.confirm({
        title: 'License Setting',
        content:function(){
            var self = this;
            return $.ajax({
                url: 'ModalManageUserOfLicense',
                headers: { "X-CSRFToken": $('[name=csrfmiddlewaretoken]').val() },
                method: 'POST'
            }).done(function (response) {
                self.setContent(response);
            }).fail(function(){
                self.setContent('Something went wrong.');
            });
        },
        boxWidth: '60%',
        closeIcon: true,
        useBootstrap: false,
        buttons: {
            formSubmit: {
                text: 'ADD',
                btnClass: 'btn btn-primary',
                action: function () {
                    var licenseCode = this.$content.find('#licenseCode').val();
                    var emCode = this.$content.find('#emCode').val();
                    var effective = this.$content.find('#effective').val();
                    var expired = this.$content.find('#expired').val();
                    if($('#user-can-use').hasClass('hidden')){
                        alert('123')
                        return false;
                    }
                    $.post({ url : baseUrlApi + '/training/add',data:JSON.stringify({
                        EmId:emCode,DictCode:licenseCode,EffectiveDate:effective,ExpiredDate:expired
                    }),contentType:appjson}).done(function(res){
                        console.log(res);
                    })
                    return false;
                }
            },
            cancel: function () {

            },
        },
        onContentReady: function () {
            var self = this;
            self.$content.find('#emCode').focus();
            $.post({ url: baseUrlApi + '/dict/get', contentType: appjson, data: JSON.stringify({ 'DictId': dictId }) }).done(function (data) {
                self.$content.find('#licenseCode').val(data.code);
                self.$content.find('#licenseDetail').text(data.desc + ' (' + data.code + ')');
            })
        },
        columnClass: 'medium'
    });
});

