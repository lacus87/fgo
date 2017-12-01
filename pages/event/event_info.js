// pages/event/event_info.js
var util = require('../../utils/util.js');
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var eventQp = { "1003": 4590000,"1007": 8700000,"1018":4470000};
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    material: [],
    eventId: 0,
    pageHeight: 400,
    historyCount: 0,
    count: 0,
    showCancel: 0,
    model:0,
    qpCount:0,
    qpOwn:0,
    qpTotal:0,
    qpTotalDesc:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var eventId = options.eventId;
    this.setData({
      qpCount: eventQp[eventId+'']
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight - 150,
          model: wx.getStorageSync("model")
        });
      }
    });
    wx.setNavigationBarTitle({
      title: options.name + "(无限池)"
    });
    wx.request({
      url: app.globalData.url +'/fgo/material/getEventMaterial2.do?eventId=' + eventId,
      method: 'GET',
      success: function (res) {
        that.setData({
          eventId: eventId,
          material: res.data.data
        })
        that.loadCount();
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  loadCount: function () {
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var historyCount = wx.getStorageSync('eventRep' + "_" + this.data.eventId + "_" + curAccId);
    if (historyCount == undefined || historyCount == '') {
      historyCount = 0;
    }
    var localMaterial = wx.getStorageSync('material' + "_" + curAccId);
    var localEvent = wx.getStorageSync('envmat' + "_" + curAccId);
    var count = this.data.count;
    var material = this.data.material;
    for (var j = 0; j < material.length; j++) {
      var id = material[j].id + '';
      if (localMaterial[id] == undefined || localMaterial[id] == null) {
        localMaterial[id] = 0;
      }
      if (localEvent[id] == undefined || localEvent[id] == null) {
        localEvent[id] = 0;
      }
      material[j].ownCount = parseInt(localMaterial[id]);
      material[j].eventCount = parseInt(localEvent[id]);
      material[j].totalCount = parseInt(material[j].ownCount) + parseInt(count) * parseInt(material[j].count);
    }
    var qp = localMaterial['1000'];
    if (qp == undefined || qp == null) {
      qp = 0;
    }
    var qpTotal = parseInt(qp) + parseInt(count) * parseInt(this.data.qpCount);
    // if(qpTotal > 999999999){
    //   qpTotal = 999999999
    // }
    material.sort(function(a,b){
      if (a.type == '2' && b.type != '2') return -1;
      if (b.type == '2' && a.type != '2') return 1;
      return a.id < b.id ? -1:1;
    })
    this.setData({
      material: material,
      historyCount: historyCount,
      qpOwn: qp,
      qpTotal: qpTotal,
      qpTotalDesc: util.convertCount(qpTotal)
    })
  },

  changeCount: function (e) {
    var count = parseInt(e.detail.value);
    if (isNaN(count) || count < 0) {
      count = 0;
    }
    var material = this.data.material;
    for (var j = 0; j < material.length; j++) {
      material[j].eventTarCount = parseInt(material[j].eventCount) + count * parseInt(material[j].count);
      material[j].totalCount = parseInt(material[j].ownCount) + count * parseInt(material[j].count);
    }
    var qpTotal = parseInt(this.data.qpOwn) + parseInt(count) * parseInt(this.data.qpCount);
    // if (qpTotal > 999999999) {
    //   qpTotal = 999999999
    // }
    this.setData({
      material: material,
      count: count,
      qpTotal: qpTotal,
      qpTotalDesc: util.convertCount(qpTotal)
    })
  },

  setCount: function (e) {
    var count = this.data.count;
    if (count == 0) {
      wx.showToast({
        title: '请先设置池数',
        image: '/images/warning.png',
        icon: 'success',
        duration: 1000
      });
      return;
    }
    var that = this;
    var content = '说到做到，自己的规划含着泪也要肝完';
    if (this.data.showCancel == 1){
      content = '少年，只有肝才可以变得更强';
    }
    wx.showModal({
      title: '确认规划',
      content: content,
      success: function (res) {
        if (res.confirm) {
          //本地记录更新
          var historyCount = wx.getStorageSync('eventRep' + "_" + that.data.eventId + "_" + curAccId);
          if (historyCount == undefined || historyCount == '') {
            historyCount = 0;
          }
          var localMaterial = wx.getStorageSync('material' + "_" + curAccId);
          var localEvent = wx.getStorageSync('envmat' + "_" + curAccId);
          historyCount += count;
          var material = that.data.material;
          for (var j = 0; j < material.length; j++) {
            var id = material[j].id + '';
            localMaterial[id] = material[j].totalCount;
            localEvent[id] = material[j].eventTarCount;
          }
          localMaterial['1000'] = that.data.qpTotal;
          wx.setStorageSync('material' + "_" + curAccId, localMaterial);
          wx.setStorageSync('envmat' + "_" + curAccId, localEvent);
          wx.setStorageSync('eventRep' + "_" + that.data.eventId + "_" + curAccId, historyCount);
          wx.navigateBack();
        }
      }
    })
  },
  showCancelView: function (e) {
    this.setData({
      showCancel: 1,
      count:0
    })
    this.onShow();
  },

  showAddView: function(e){
    this.setData({
      showCancel: 0,
      count: 0
    })
    this.onShow();
  },
  reduceCount: function (e) {
    var count = parseInt(e.detail.value);
    if (isNaN(count) || count < 0) {
      count = 0;
    }
    var historyCount = this.data.historyCount;
    if (historyCount < count) {
      wx.showToast({
        title: '最多取消' + historyCount + "池",
        image: '/images/warning.png',
        icon: 'success',
        duration: 1000
      });
      return;
    }
    count = count * -1;
    var qpTotal = parseInt(this.data.qpOwn) + parseInt(count) * parseInt(this.data.qpCount);
    if(qpTotal < 0){
      wx.showToast({
        title: 'QP不足',
        image: '/images/warning.png',
        icon: 'success',
        duration: 1000
      });
      return;
    }
    var material = this.data.material;
    for (var j = 0; j < material.length; j++) {
      var result = parseInt(material[j].ownCount) + count * parseInt(material[j].count);
      if (result < 0) {
        wx.showToast({
          title: material[j].name + '不足',
          image: '/images/warning.png',
          icon: 'success',
          duration: 1000
        });
        return;
      }
      material[j].eventTarCount = parseInt(material[j].eventCount) + count * parseInt(material[j].count);
      material[j].totalCount = parseInt(material[j].ownCount) + count * parseInt(material[j].count);
    }
    this.setData({
      historyCount: historyCount,
      material: material,
      count: count,
      qpTotal: qpTotal,
      qpTotalDesc: util.convertCount(qpTotal)
    })
  },
  // 触摸开始事件 
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点 
    // 使用js计时器记录时间  
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    var touchMove = e.changedTouches[0].pageX;
    // 向右滑动 
    if (touchMove - touchDot >= 40 && time < 10 && touchDot < 80) {
      wx.navigateBack();
    }
    clearInterval(interval); // 清除setInterval 
    time = 0;
  }
})