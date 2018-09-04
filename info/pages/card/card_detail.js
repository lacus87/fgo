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
    cardInfo:{},
    model: app.globalData.model,
    showImg:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    }); 
    setTimeout(function(){
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            pageHeight: res.windowHeight,
            model: app.globalData.model,
            pageWidth: res.windowWidth
          });
        }
      });
    },300);
    
    wx.request({
      url: app.globalData.url + '/servant/getCardInfo.do?cardId=' + options.id,
      method: 'GET',
      success: function(res) {
        var cardInfo = res.data.data;
        cardInfo.intro = cardInfo.intro.split("\n");
        that.setData({
          cardInfo: res.data.data
        }, function(){
          wx.hideLoading();
        });
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  showImg: function () {
    var url = this.data.cardInfo.pic1;
    wx.previewImage({
      urls: [url],
    })
  },
})