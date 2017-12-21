var $ = mdui.JQ;
var favoriteData = null;
var editGroup = new mdui.Dialog('#editgroup', {
    closeOnCancel: true,
    modal: true
});
var newGroup = new mdui.Dialog('#newgroup', {
    closeOnCancel: true,
    modal: true
});
var renameGroupObj = null;
var oldname = '';
var newname = '';
$('#acount').css('display', 'block');
$.ajax({
    url: '/ajax',
    method: 'POST',
    dataType: 'json',
    data: {
        action: 'getfavorite'
    },
    success: function(data) {
        Z.check.localStorageSupport ? localStorage.setItem("favoriteData", JSON.stringify(data)) : console.log("Your browser is not support localStorage!");
        initFavorite(data.favorite, document.getElementById('favoritegrouplist'));
        favoriteData = data;
    }
});
$(document).on('click', '#logoutbtn',
function() {
    Z.cookie.remove('loginname');
    Z.cookie.remove('token');
    window.location.href = '/';
});
$(document).on('click', '.mdui-collapse-item',
function() {
    var list = $('.mdui-row');
    if (index != 1) {
    var index = $(this).index();
        list.css('display', 'none');
        list[index].style.display = 'block';
        if (index == 2){
            $.ajax({
                url:'/ajax',
                method:'POST',
                dataType:'json',
                data:{action:'gettrade'},
                success:function(data){
                    var list = Object.keys(data).sort();
                    var htmlstr = '';
                    for (var i in data){
                        for (var j=0;j<data[i].length;j++){
                            htmlstr += '<tr>';
                            htmlstr += '<th>' + data[i][j].date + '</th>';
                            htmlstr += '<th>' + i + '</th>';
                            htmlstr += '<th>' + '' + '</th>';
                            htmlstr += '<th>' + data[i][j].type + '</th>';
                            htmlstr += '<th>' + data[i][j].price + '</th>';
                            htmlstr += '<th>' + data[i][j].volume + '</th>';
                            htmlstr += '<th>' + data[i][j].price * data[i][j].volume + '</th>';
                            htmlstr += '</tr>';
                        }
                    }
                    $('#trade-table-body').html(htmlstr);
                }
                });
        }
    }
});
$(document).on('click', '.favoritegroup',
function() {
    $('.mdui-row').css('display', 'none');
    $('#favorite').css('display', 'block');
});
$(document).on('click', '.favoritegroup span',
function() {
    var stocklist = favoriteData.favorite[$(this).parent().index()].stock;
    var stockData = favoriteData.stockdata;
    var str = '';
    stocklist.forEach(function(e) {
        str += '<div class="mdui-col-md-3"><div class="mdui-card height-150 gradient-45deg-light-blue-cyan gradient-shadow"><div class="chart"></div></div></div>';
    });
    $('#favorite').html(str);
    list = document.querySelectorAll('.chart');
    list.forEach(function(e, i) {
        var chart = echarts.init(e);
        option.title.text = stocklist[i][1];
        option.title.link = '/detail/?stockcode=' + stocklist[i][0];
        option.xAxis.data = stockData[stocklist[i][0]]['date'];
        option.series[0].data = stockData[stocklist[i][0]]['value'];
        chart.setOption(option);
    });
});
$(document).on('mouseover', '.favoritegroup',
function() {
    $(this).children('.edit').css('display', 'inline');
});
$(document).on('mouseout', '.favoritegroup',
function() {
    $(this).children('.edit').css('display', 'none');
});
$(document).on('click', '.edit',
function() {
    renameGroupObj = $(this).parent().children('span');
    oldname = $(this).parent().children('span').text();
    $('#groupname').val(oldname);
    editGroup.open();
});
$(document).on('confirm.mdui.dialog', '#editgroup',
function() {
    newname = $('#groupname').val();
    if (oldname == newname) {
        console.log('The oldname is equal to newname.');
    } else {
        $.ajax({
            url: '/ajax',
            method: 'POST',
            data: {
                "action": "renamegroup",
                "oldname": oldname,
                "newname": newname
            },
            success: function(data) {
                data == 1 && mdui.snackbar({
                    message: "重命名成功",
                    timeout: "2000",
                    position: "top"
                });
                renameGroupObj.text(newname);
            }
        });
    }
});
$(document).on('click', '#addgroup',
function() {
    newGroup.open();
});
function initFavorite(favorite, element) {
    htmlstr = '';
    for (i in favorite) {
        htmlstr += '<li class="mdui-list-item mdui-ripple favoritegroup"><span>' + favorite[i].name + '</span><i class="mdui-list-item-icon mdui-icon material-icons edit">edit</i></li>';
    }
    htmlstr += '<li id="addgroup" class="mdui-list-item mdui-ripple favoritegroup"><i class="mdui-list-item-icon mdui-icon material-icons">add</i>添加分组</li>';
    element.innerHTML = htmlstr;
}
option = {
    title: {
        text: '1',
        link: '',
        target: 'black',
        textStyle: {
            color: '#eee',
        }
    },
    tooltip: {
        trigger: 'axis',
        position: ['1%', '10%'],
        backgroundColor: ''
    },
    grid: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [],
        axisLine: {
            show: false
        },
        axisTick: {
            show: false
        },
        axisLabel: {
            show: false
        }
    },
    yAxis: {
        type: 'value',
        min: 'dataMin',
        max: 'dataMax',
        axisLine: {
            show: false
        },
        axisTick: {
            show: false
        },
        axisLabel: {
            show: false
        },
        boundaryGap: [0, '100%']
    },
    series: [{
        name: '收盘',
        type: 'line',
        smooth: false,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
            normal: {
                color: 'rgb(204, 255, 51)'
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(255, 255, 255, 0.2)'
                },
                {
                    offset: 1,
                    color: 'rgba(255, 255, 255, 0.5)'
                }])
            }
        },
        data: [],
    }]
};
