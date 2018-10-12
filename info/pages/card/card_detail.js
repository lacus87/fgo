// pages/servant/servant_detail.js
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0; //触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight: 600,
    pageWidth: 400,
    cardInfo: {},
    model: app.globalData.model,
    showImg: 0,
    curId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      curId: options.id
    });
    this.loadCardInfo();
    var that = this;
    setTimeout(function() {
      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            pageHeight: res.windowHeight,
            model: app.globalData.model,
            pageWidth: res.windowWidth,
          });
        }
      });
    }, 300);
  },

  loadCardInfo: function() {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: app.globalData.url + '/servant/getCardInfo.do?cardId=' + that.data.curId,
      method: 'GET',
      success: function(res) {
        var cardInfo = res.data.data;
        cardInfo.intro = cardInfo.intro.split("\n");
        that.setData({
          cardInfo: res.data.data
        }, function() {
          wx.hideLoading();
        });
      }
    });
  },

  showImg: function() {
    var url = this.data.cardInfo.pic1;
    wx.previewImage({
      urls: [url],
    })
  },

  redirectLast: function(e) {
    var id = parseInt(e.currentTarget.dataset.index);
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var cardList = prevPage.data.cardList;
    var curId = parseInt(this.data.curId);
    var curIndex = 0;
    for (var i = 0; i < cardList.length; i++) {
      if (cardList[i].id == curId) {
        curIndex = i + id;
        if (curIndex > cardList.length - 1) {
          wx.showToast({
            title: '已到最后一个',
            image: '/images/warning.png',
            icon: 'success',
            duration: 1000
          });
          return;
        } else if (curIndex < 0) {
          wx.showToast({
            title: '已到第一个',
            image: '/images/warning.png',
            icon: 'success',
            duration: 1000
          });
          return;
        }
        break;
      }
    }
    this.setData({
      curId: cardList[curIndex].id
    });
    this.loadCardInfo();
  }
})