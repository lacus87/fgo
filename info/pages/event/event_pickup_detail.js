// pages/event/event.js
var curAccId = 1;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curPickup: {},
    servantList: [],
    model: app.globalData.model,
    width:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var eventList = prevPage.data.eventList;
    var servantList = [];
    var curPickup = {};
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].show == 1){
        curPickup = eventList[i];
        var detail = eventList[i].detail;
        Object.keys(detail).forEach(function(key){
          servantList.push(detail[key+'']);
        });
      }
    }
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          width: res.windowWidth,
          curPickup: curPickup,
          servantList: servantList,
          model: app.globalData.model
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.changeOwnFlag();
  },

  changeOwnFlag: function() {
    var upList = this.data.servantList;
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (item == undefined || item == '') {
      item = [];
    }
    for (var i = 0; i < upList.length; i++) {
      var servantList = upList[i];
      servantList.forEach(function(curUp) {
        if (item.indexOf(curUp.servantId + '') >= 0) {
          curUp.ownFlag = '1';
        }else{
          curUp.ownFlag = '0';
        }
      })
    }
    this.setData({
      servantList: upList
    })
  },

  showServantDetail: function (e) {
    //servant_detail?id={{item.id}}
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if(prevPage.data.servant){
      return;
    }
    var id = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "../servant/servant_detail?id=" + id
    });
  },

  changeView: function(e){
    var id = parseInt(e.currentTarget.dataset.index);
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var eventList = prevPage.data.eventList;
    var servantList = [];
    var curPickup = {};
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].show == 1) {
        var index = i + id;
        if(index > eventList.length-1){
          wx.showToast({
            title: '已到最后一个',
            image: '/images/warning.png',
            icon: 'success',
            duration: 1000
          });
          return;
        }else if (index < 0) {
          wx.showToast({
            title: '已到第一个',
            image: '/images/warning.png',
            icon: 'success',
            duration: 1000
          });
          return;
        }
        eventList[i].show = 0;
        eventList[index].show = 1;
        curPickup = eventList[index];
        if (curPickup.status == 0 && prevPage.data.showPast != 1){
          wx.showToast({
            title: '已到第一个',
            image: '/images/warning.png',
            icon: 'success',
            duration: 1000
          });
          return;
        }
        var detail = eventList[index].detail;
        Object.keys(detail).forEach(function (key) {
          servantList.push(detail[key + '']);
        });
        break;
      }
    }
    this.setData({
      curPickup: curPickup,
      servantList: servantList
    });
    this.onShow();
  }

})