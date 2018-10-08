var wxCharts = require('../style/wxcharts-min.js');
var time = 0;
var touchDot = 0; //触摸时的原点
var touchDotH = 0; //触摸时的原点y轴
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
var lineChart = null;
Page({
  data: {
    id: 0,
    name: '',
    pageWidth: 300,
    model: app.globalData.model,
    pageHeight: 400,
    servantAtks: {},
    x: 0,
    y: 0,
    hidden: true,
    percent: 0
  },

  onLoad: function(options) {
    var that = this;
    this.setData({
      id: options.id,
      name: options.name
    })
    wx.setNavigationBarTitle({
      title: options.name //页面标题为路由参数
    });
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          pageWidth: res.windowWidth,
          pageHeight: res.windowHeight,
          model: app.globalData.model
        });
      }
    });
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: app.globalData.url + '/servant/getServantAtkDesc.do?servantId=' + options.id,
      method: 'GET',
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '服务器无响应',
          image: '/images/warning.png',
          icon: 'success',
          duration: 5000
        });
      },
      success: function(res) {
        wx.hideLoading();
        that.setData({
          servantAtks: res.data.data
        }, function() {
          that.drawServant();
        })
      }
    });
  },

  drawServant: function() {
    var width = this.data.pageWidth;
    var servantAtks = this.data.servantAtks;
    var xCat = [];
    for (var i = 0; i < servantAtks.atkList.length; i++) {
      if(i>0){
        xCat.push(i);
      }else{
        xCat.push('');
      }
    }
    lineChart = new wxCharts({
      animation: true,
      canvasId: 'servantInfo',
      type: 'line',
      categories: xCat,
      background: app.globalData.model == 1 ? '#7B7B7B' : '#ffffff',
      series: [{
        name: 'HP',
        data: servantAtks.hpList,
        format: function(val, name) {
          return val;
        }
      }, {
        name: 'ATK',
        data: servantAtks.atkList,
        format: function(val, name) {
          return val;
        }
      }],
      xAxis: {
        disableGrid: true,
        fontColor: app.globalData.model == 1 ? '#FFFFFF' : '#000000'
      },
      yAxis: {
        title: '',
        fontColor: app.globalData.model == 1 ? '#FFFFFF' : '#000000',
        format: function(val) {
          return val.toFixed(0);
        },
        min: 0
      },
      width: width,
      height: width,
      dataLabel: false,
      dataPointShape: false,
      extra: {
        lineStyle: 'curve',
        legendTextColor: app.globalData.model == 1 ? '#FFFFFF' : '#000000'
      }
    });
  },
  touchHandler: function(e) {
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function(item, category) {
        return '等级：【' + (category + 1) + '】 ' + item.name + ':' + item.data
      }
    });
  },
});