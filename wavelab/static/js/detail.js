var $ = mdui.JQ;
$('#main').css('height', window.innerHeight - 64 + 'px');
var user = Z.cookie.get('loginname') ? Z.cookie.get('loginname') : '';
var stockCode = Z.getUrlParam().stockcode;
var hash = window.location.hash;
var yearCount = Z.getUrlParam().yearcount ? Z.getUrlParam().yearcount: 1;
var stockData = localStorage.getItem(stockCode) ? JSON.parse(localStorage.getItem(stockCode)) : {};
var favorite = localStorage.getItem(user + 'favoriteData') ? JSON.parse(localStorage.getItem(user + 'favoriteData')).favorite : {};
var yestoday = Z.timeFormat('yyyy/MM/dd', -1);
var today = Z.timeFormat('yyyy/MM/dd');
var infomenu = new mdui.Menu('#infobtn', '#infomenu', {
    position: 'bottom'
});
var addtrade = new mdui.Dialog('#addtrade');
//******************************
//Does stockData need to be updated?
//******************************
if (!stockData.code || hash == '#refresh' || stockData.yearcount < yearCount || (Z.getTime('inweek') < 6 && Z.getTime('hour') >= 15 && stockData.update != today) || (Z.getTime('inweek') < 6 && Z.getTime('hour') < 15 && stockData.update != yestoday)) {
    getStockData(initPage);
} else {
    initPage({
        stockdata: stockData,
        dataamount: (yearCount * 250)
    });
}
//******************************
//init addFavorite dialog
//******************************
if(favorite[0]){
    var htmlstr = '<form id="addFavoriteForm">';
    for(var i = 0; i < favorite.length; i ++ ){
        htmlstr += '<div class="mdui-col-md-4"><label class="mdui-radio mdui-text-truncate"><input type="radio" name = "group" value="' + favorite[i].name + '" /><i class="mdui-radio-icon"></i>' + favorite[i].name + '</label></div>';
    }
    htmlstr += '</form>';
    $('#addFavorite .mdui-row').html(htmlstr);
    var addFavorite = new mdui.Dialog('#addFavorite', {history:false,modal:true,closeOnEsc:false});
}
//******************************
//load the script from sinajs dynamic.
//******************************
/*
document.body.onload = function () {
    let a = document.createElement('script');
    a.id = 'sinaData';
    a.src = 'https://hq.sinajs.cn/list=' + stockCode;
    document.head.appendChild(a);
    let b = setInterval(function(){
        if (document.getElementById('sinaData') && window['hq_str_' + stockCode]) {
                console.log(window['hq_str_' + stockCode]);
            }
        }, 3000);
};
*/
$('#favoriteCheckbox').on('click',
function() {
    if (document.getElementById('favoriteCheckbox').checked) {
        if(user){
            addFavorite.open();
        }else{
            mdui.alert('请登录后再进行此操作。', '提示', 
            function() {
            },
            {
                confirmText: '确定'
            });
            $('#favoriteCheckbox').prop('checked', false);
        }
    } else {
        mdui.alert('由于一支股票可能收藏于多个分组，为避免误删，请在个人中心  >  自选股页面进行删除操作。', '提示',
        function() {
        },
        {
            confirmText: '确定'
        });
        $('#favoriteCheckbox').prop('checked', true);
    }
});
$('#addtradebtn').on('click', function(){
            if(user){
                addtrade.open();
            }else{
                mdui.alert('请登录后再进行此操作。', '提示', 
                function() {
                },
                {
                    confirmText: '确定'
                });
            }
            });
$('#addtrade').on('opened.mdui.dialog',
function() {
    $('#tradeStockCode').val(stockData.code);
    $('#tradeDate').val(today);
});
$('#addtrade').on('confirm.mdui.dialog',
function() {
    var code=$('#tradeStockCode').val();
    var date=$('#tradeDate').val();
    var price=$('#tradePrice').val();
    var volume=$('#tradeVolume').val();
    var type=$('#tradeType').prop('checked') ? 'buy' : 'sell';
    if(code && date && price && volume && type){
        addTradeData(code,date,price,volume,type);
    }
});
$('#addFavorite').on('confirm.mdui.dialog',
function() {
    var grouplist = $('#addFavoriteForm').serializeArray();
    if(grouplist.length == 0){
        $('#favoriteCheckbox').prop('checked', false);
    } else {
        $.ajax({
            url:'/ajax', 
            method:'POST', 
            data:{"action":"addfavoritestock", "group":grouplist[0].value, "stockcode":stockData.code, "stockname":stockData.name}, 
            success:function(data){
                if(data == 1){
                    var favoriteData = JSON.parse(localStorage.getItem(user + 'favoriteData'));
                    var favorite = favoriteData.favorite;
                    for(var i = 0; i < favorite.length; i ++ ){
                        if(favorite[i].name == grouplist[0].value){
                            favorite[i].stock.push([stockData.code, stockData.name]);
                            break;
                        }
                    }
                    localStorage.setItem(user + 'favoriteData', JSON.stringify(favoriteData));
                    mdui.snackbar({
                        message: '添加成功',
                        timeout: 800,
                        position: 'top'
                    });
                } else {
                    mdui.snackbar({
                        message: '操作失败',
                        timeout: 800,
                        position: 'top'
                    });
                }
            }
            });
    }
});
$('#addFavorite').on('cancel.mdui.dialog',
function() {
    $('#favoriteCheckbox').prop('checked', false);
});
$('#searchbox').on('keyup',
function(event) {
    if (event.key == "Enter") {
        stock.transCode($('#searchbox').val()) ? window.location.href = '/detail/?stockcode=' + stock.transCode($('#searchbox').val()) : mdui.snackbar({
            message: '股票代码格式不正确',
            position: 'top',
            timeout: 800
        });;
    }
});
function display(pagedata) {
    var option = {
        title: [{
            text: '分时图',
            left: '2%',
            top: 5,
            link: 'http://gu.qq.com/' + pagedata.stockdata.code + '/gp',
            target: 'blank',
            textStyle: {
                fontSize: 14
            }
        },
        {
            text: '一年',
            left: '5%',
            top: 5,
            link: '/detail/?stockcode=' + pagedata.stockdata.code + '&yearcount=1',
            target: 'self',
            textStyle: {
                fontSize: 14
            }
        },
        {
            text: '两年',
            left: '7%',
            top: 5,
            link: '/detail/?stockcode=' + pagedata.stockdata.code + '&yearcount=2',
            target: 'self',
            textStyle: {
                fontSize: 14
            }
        },
        {
            text: '三年',
            left: '9%',
            top: 5,
            link: '/detail/?stockcode=' + pagedata.stockdata.code + '&yearcount=3',
            target: 'self',
            textStyle: {
                fontSize: 14
            }
        },
        {
            text: '五年',
            left: '11%',
            top: 5,
            link: '/detail/?stockcode=' + pagedata.stockdata.code + '&yearcount=5',
            target: 'self',
            textStyle: {
                fontSize: 14
            }
        },
        {
            text: '十年',
            left: '13%',
            top: 5,
            link: '/detail/?stockcode=' + pagedata.stockdata.code + '&yearcount=10',
            target: 'self',
            textStyle: {
                fontSize: 14
            }
        }],
        tooltip: {
            trigger: 'axis',
            position: ['3%', '4%'],
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: '',
            textStyle: {
                color: '#000'
            },
            formatter: function(params) {
                //console.log(params);
                if (params[0].seriesType == 'candlestick') {
                    str = params[0].axisValue + ', 开盘:' + params[0].data[1] + ', 收盘:' + params[0].data[2] + ', 最高:' + params[0].data[4] + ', 最低:' + params[0].data[3];
                    for (i = 1; i < params.length; i++) {
                        str += ', ' + params[i].marker + params[i].seriesName + ':' + params[i].value;
                    }
                } else {
                    str = params[3].axisValue + ', 开盘:' + params[3].data[1] + ', 收盘:' + params[3].data[2] + ', 最高:' + params[3].data[4] + ', 最低:' + params[3].data[3];
                    for (i = 4; i < params.length; i++) {
                        str += ', ' + params[i].marker + params[i].seriesName + ':' + params[i].value;
                    }
                    for (i = 0; i < 3; i++) {
                        str += ', ' + params[i].marker + params[i].seriesName + ':' + params[i].value;
                    }
                }
                return str;
            }
        },
        axisPointer: {
            link: {
                xAxisIndex: 'all'
            },
            label: {
                show: true,
                backgroundColor: '#777'
            }
        },
        legend: [{
            right: 5,
            top: 5,
            data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30', 'MA60'],
            selected: {
                '日K': true,
                'MA5': false,
                'MA10': false,
                'MA20': false,
                'MA30': true,
                'MA60': false
            }
        }],
        grid: [{
            top: '5%',
            left: '3%',
            right: 5,
            height: '50%'
        },
        {
            left: '3%',
            right: 5,
            top: '55%',
            height: '40%'
        }],
        xAxis: [{
            type: 'category',
            gridIndex: 0,
            data: pagedata.stockdata.date.slice( - (pagedata.dataamount)),
            scale: true,
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            splitLine: {
                show: false
            },
            splitNumber: 20,
            max: 'dataMax',
            axisPointer: {
                label: {
                    show: false
                },
                snap: true
            }
        },
        {
            type: 'category',
            gridIndex: 1,
            data: pagedata.stockdata.date.slice( - (pagedata.dataamount)),
            scale: true,
            boundaryGap: false,
            axisLine: {
                onZero: true,
                show: true
            },
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            },
            splitNumber: 20,
            axisPointer: {
                snap: true
            },
            max: 'dataMax'
        }],
        yAxis: [{
            gridIndex: 0,
            scale: true,
            splitLine: {
                show: false
            },
            splitArea: {
                show: true
            }
        },
        {
            gridIndex: 1,
            axisLine: {
                onZero: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            },
            splitArea: {
                show: true
            },
            axisLabel: {
                show: true
            }
        }],
        dataZoom: [{
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 0,
            end: 100
        },
        {
            show: true,
            type: 'slider',
            xAxisIndex: [0, 1],
            start: 0,
            end: 100
        },
        {
            show: false,
            xAxisIndex: [0, 1],
            type: 'slider',
            start: 0,
            end: 100
        }],
        series: [{
            name: '日K',
            type: 'candlestick',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: pagedata.stockdata.value.slice( - (pagedata.dataamount)),
            itemStyle: {
                normal: {
                    color: '#ec0000',
                    color0: '#00da3c',
                    borderColor: '#8A0000',
                    borderColor0: '#008F28'
                }
            },
            markPoint: {
                label: {
                    normal: {
                        formatter: '{b}',
                    }
                },
                data: pagedata.stockdata.trade
            }
        },
        {
            name: 'MA5',
            type: 'line',
            data: pagedata.stockdata.ma5.slice( - (pagedata.dataamount)),
            smooth: true,
            lineStyle: {
                normal: {
                    opacity: 0.5
                }
            }
        },
        {
            name: 'MA10',
            type: 'line',
            data: pagedata.stockdata.ma10.slice( - (pagedata.dataamount)),
            smooth: true,
            lineStyle: {
                normal: {
                    opacity: 0.5
                }
            }
        },
        {
            name: 'MA20',
            type: 'line',
            data: pagedata.stockdata.ma20.slice( - (pagedata.dataamount)),
            smooth: true,
            lineStyle: {
                normal: {
                    opacity: 0.5
                }
            }
        },
        {
            name: 'MA30',
            type: 'line',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: pagedata.stockdata.ma30.slice( - (pagedata.dataamount)),
            smooth: true,
            lineStyle: {
                normal: {
                    opacity: 0.5
                }
            }
        },
        {
            name: 'MA60',
            type: 'line',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: pagedata.stockdata.ma60.slice( - (pagedata.dataamount)),
            smooth: true,
            lineStyle: {
                normal: {
                    opacity: 0.5
                }
            }
        },
        {
            name: 'MACD',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: pagedata.stockdata.bar.slice( - (pagedata.dataamount)),
            itemStyle: {
                normal: {
                    color: function(params) {
                        var colorList;
                        if (params.data >= 0) {
                            colorList = '#ef232a';
                        } else {
                            colorList = '#14b143';
                        }
                        return colorList;
                    }
                }
            }
        },
        {
            name: 'DIF',
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: pagedata.stockdata.dif.slice( - (pagedata.dataamount))
        },
        {
            name: 'DEA',
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: pagedata.stockdata.dea.slice( - (pagedata.dataamount))
        }]
    };
    pagedata.chart.setOption(option);
}
function addTradeData(code, date, price, volume, type) {
    $.ajax({
        url:'/ajax',
        method:'POST',
        data:{"action":"addtrade","code":code,"date":date,"price":price,"volume":volume,"type":type},
        success:function(data){
            if(data==1){
                mdui.snackbar({
                    message: '添加成功',
                    timeout: 800,
                    position: 'top'
                });
            }else{
                mdui.snackbar({
                    message: '操作失败',
                    timeout: 800,
                    position: 'top'
                });
            }
        }
    });
}
function initPage(option) {
    stockData = option.stockdata;
    var upordown = 100 * (stockData.value[stockData.value.length - 1][1] - stockData.value[stockData.value.length - 2][1])/stockData.value[stockData.value.length - 1][0];
    var closeprice = stockData.value[stockData.value.length - 1][1];
    localStorage.setItem(stockData.code, JSON.stringify(stockData));
    $('title').text(stockData.name + stockData.code + ' - WAVE LAB');
    $('#title').text(stockData.name + stockData.code);
    $('#closeprice').text(closeprice);
    $('#upordown').text(upordown.toFixed(2) + '%');
    if(upordown > 0){$('#priceinfo').addClass('mdui-text-color-red');}
    else if(upordown < 0){$('#priceinfo').addClass('mdui-text-color-green');$('#priceinfo i').eq(0).text('arrow_downward');}
    $('#tonghuashun').prop('href', 'http://stockpage.10jqka.com.cn/' + stockData.code.substr(2) + '/');
    $('#dongfangcaifu').prop('href', 'http://quote.eastmoney.com/'+stockData.code+'.html');
    $('#hexun').prop('href', 'http://stockdata.stock.hexun.com/'+stockData.code.substr(2)+'.shtml');
    $('#jinrongjie').prop('href', 'http://stock.jrj.com.cn/share,'+stockData.code.substr(2)+'.shtml');
    $('#sina').prop('href', 'http://finance.sina.com.cn/realstock/company/'+stockData.code+'/nc.shtml');
    $('#tencent').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp');
    $('#ifeng').prop('href', 'http://finance.ifeng.com/app/hq/stock/'+stockData.code+'/index.shtml');
    $('#xueqiu').prop('href', 'https://xueqiu.com/s/'+stockData.code);
    $('#gaf10').prop('href', 'http://www.gaf10.com/shareDetails.html?code=' + stockData.code.substr(2));
    $('#gsjj').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/jbzl');
    $('#ggxw').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/news');
    $('#hyxw').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/hyxw');
    $('#gggg').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/notice');
    $('#zdsx').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/zdsx');
    $('#jbnb').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/jbnb');
    $('#yjbg').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/yjbg');
    $('#gbgd').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/gbgd');
    $('#fhsp').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/fhsp');
    $('#cwbb').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/cwbb');
    $('#cwzb').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/cwzb');
    $('#cwfx').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/cwfx');
    $('#yjyg').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/yjyg');
    $('#tzts').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/tzts');
    $('#jgyc').prop('href', 'http://gu.qq.com/'+stockData.code+'/gp/jgyc');
    if (user != '') {
        var favoritestr = JSON.stringify(JSON.parse(localStorage.getItem(user + 'favoriteData')).favorite)
        document.getElementById('favoriteCheckbox').checked = !(favoritestr.indexOf(stockData.code) == -1);
    }
    updateRecentStock(stockData.code, stockData.name);
    recentStockDisplay();
    if (!!user) {
        $.ajax({
            url: '/ajax',
            method: 'POST',
            data: {
                action: 'getsingletrade',
                stockcode: stockData.code
            },
            dataType: 'json',
            success: function(data) {
                stockData['trade'] = data;
                var myChart = echarts.init(document.getElementById('main'));
                myChart.showLoading();
                display({
                    stockdata: stockData,
                    chart: myChart,
                    dataamount: option.dataamount
                });
                myChart.hideLoading();
            }
        });
    } else {
        var myChart = echarts.init(document.getElementById('main'));
        myChart.showLoading();
        display({
            stockdata: stockData,
            chart: myChart,
            dataamount: option.dataamount
        });
        myChart.hideLoading();
    }
}
function getStockData(callback) {
    $.ajax({
        url: '/ajax',
        method: 'POST',
        dataType: 'json',
        data: {
            action: 'getstockdata',
            stockcode: stockCode,
            yearcount: yearCount
        },
        success: function(data) {
            if ( !! data.code) {
                callback({
                    stockdata: data,
                    dataamount: (yearCount * 250)
                });
            } else {
                $('#left-drawer').remove();
                $('body').removeClass('mdui-drawer-body-left');
                $('#main').html('<div class="mdui-typo-display-2-opacity" style="text-align:center">无相关数据!</div>');
            }
        }
    });
}
function updateRecentStock(stockcode, stockname) {
    if (Z.check.localStorageSupport() && localStorage.getItem(user + 'recentStock')) {
        var recentObj = JSON.parse(localStorage.getItem(user + 'recentStock'));
        var len = recentObj.length;
        var index = -1;
        for (e in recentObj) {
            if (recentObj[e][0] == stockcode) {
                index = e;
                recentObj.splice(e, 1);
                recentObj.unshift([stockcode, stockname]);
                break;
            }
        }
        if (index == -1) {
            if (len < 15) {
                recentObj.unshift([stockcode, stockname]);
            } else {
                recentObj.pop();
                recentObj.unshift([stockcode, stockname]);
            }
        }
        localStorage.setItem(user + 'recentStock', JSON.stringify(recentObj));
    } else {
        Z.check.localStorageSupport() && localStorage.setItem(user + 'recentStock', JSON.stringify([[stockcode, stockname]]));
    }
}
function recentStockDisplay() {
    recentObj = JSON.parse(localStorage.getItem(user + 'recentStock'));
    htmlStr = '';
    for (i in recentObj) {
        htmlStr += '<a href="/detail/?stockcode=' + recentObj[i][0] + '"><li class="mdui-list-item">' + recentObj[i][1] + '</li></a>';
    }
    $('#recentStock').html(htmlStr);
}
function isTrading() {
    let inweek = Z.getTime('inweek');
    let hour = Z.getTime('hour');
    let minute = Z.getTime('minute');
    if (inweek >= 1 && inweek <= 5) {
        if (hour > 9 && hour < 15) {
            return true;
        } else if (hour = 9) {
            if (minute >= 20) {
                return true;
            }
        }
    } else {
        return false;
    }
}
