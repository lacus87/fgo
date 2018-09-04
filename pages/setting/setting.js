// pages/setting/setting.js
var sliderWidth = 150; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var curAccId = 1;
var accountChange = false;
var app = getApp();
var util = require('../../utils/util.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight: 400,
    model: 0,
    url: "",
    dropModel: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var servantList = getApp().globalData.servantList;
    that.setData({
      url: app.globalData.url
    });
  },
  onShow: function () {
    var that = this;
    var account = wx.getStorageSync('account');
    if (account == undefined || account == '') {
      account = [];
      account.push({ id: '1', name: '默认账号', status: 1 });
      account.push({ id: '2', name: '账号2', status: 0 });
      account.push({ id: '3', name: '账号3', status: 0 });
      account.push({ id: '4', name: '账号4', status: 0 });
      account.push({ id: '5', name: '账号5', status: 0 });
    }
    wx.setStorageSync('account', account);
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var dropModel = wx.getStorageSync("dropModel_" + curAccId);
    if (dropModel == undefined || dropModel == '') {
      dropModel = 1;
    }
    this.setData({
      model: wx.getStorageSync("model"),
      accountList: account,
      dropModel: dropModel
    });
    setTimeout(function () {
      wx.getSystemInfo({
        success: function (res) {
          wx.getSystemInfo({
            success: function (res) {
              that.setData({
                pageHeight: res.windowHeight
              });
            }
          });
        }
      });
    }, 200);
  },

  changeAccount: function () {
    var account = wx.getStorageSync('account');
    var msgArray = [];
    for (var i = 0; i < account.length; i++) {
      msgArray.push(account[i].name);
    }
    var that = this;
    wx.showActionSheet({
      itemList: msgArray,
      success: function (res) {
        if (!res.cancel) {
          var id = res.tapIndex + 1;
          for (var i = 0; i < account.length; i++) {
            if (id == account[i].id) {
              account[i].status = 1;
            } else {
              account[i].status = 0;
            }
          }
          wx.setStorageSync('account', account);
          that.onShow();
        }
      }
    })
  },
  changeAccName: function (e) {
    var name = e.detail.value;
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        account[i].name = name;
      }
    }
    wx.setStorageSync('account', account);
  },
  gotoReward: function (e) {
    wx.navigateTo({
      url: "setting_reward"
    });
  },
  changeModel: function () {
    var model = wx.getStorageSync("model");
    model = model == 1 ? 0 : 1;
    wx.setStorageSync("model", model);
    app.globalData.model = model;
    this.setData({
      model: model
    })
    if(model == 0){
      wx.setTabBarStyle({
        "color": "#8a8a8a",
        "selectedColor": "#2aa515",
        "borderStyle": "white",
        "backgroundColor": "#E0E0E0"
      });
    }else if(model == 1){
      wx.setTabBarStyle({
        "color": "#FFFFFF",
        "selectedColor": "#90EE90",
        "borderStyle": "black",
        "backgroundColor": "#000000"
      });
    }
  },

  showHelp: function (e) {
    wx.navigateTo({
      url: "../setting/setting_help"
    });
  },
  showLogs: function (e) {
    wx.navigateTo({
      url: "../setting/setting_logs"
    });
  },
  aboutUs: function (e) {
    wx.navigateTo({
      url: "../setting/setting_us"
    });
  },

  dropModelChange: function (e) {
    this.setData({
      dropModel: e.detail.value
    })
    var key = "dropModel_" + curAccId;
    wx.setStorageSync(key, e.detail.value);
  }
})