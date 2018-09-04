// pages/material/material_vpnnote.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight:400,
    showButton:0
  },

  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight-80,
        });
      }
    });
  },

  confirmInfo: function(){
    wx.setStorageSync("showInfo",1);
    wx.navigateBack({
      delta: 1
    })
  },

  showButton: function(){
    this.setData({
      showButton:1
    })
  }

})