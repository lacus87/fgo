// pages/servant/servant_images.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight: 600,
    pageWidth: 400,
    images: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var id = options.id+'';
    id = id.substring(1,4);
    var name = options.name;
    var images = [];
    images.push(app.globalData.url +"/fgo/images/servant/detail/" + id + "A.jpg");
    images.push(app.globalData.url +"/fgo/images/servant/detail/" + id + "B.jpg");
    images.push(app.globalData.url +"/fgo/images/servant/detail/" + id + "C.jpg");
    images.push(app.globalData.url +"/fgo/images/servant/detail/" + id + "D.jpg");
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowWidth*724/512,
          pageWidth: res.windowWidth,
          images: images
        });
      }
    });
    wx.setNavigationBarTitle({
      title: name//页面标题为路由参数
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})