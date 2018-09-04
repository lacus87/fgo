// pages/setting/setting_reward.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    model: 0,
    questions: [
      '打赏作者'
    ],
    width:300,
    url: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: "打赏"//页面标题为路由参数
    });
    this.setData({
      model: wx.getStorageSync("model"),
      url: app.globalData.url
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          width: res.windowWidth
        });
      }
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
  
  },

  previewImage: function (e) {
    var url = this.data.url;
    wx.previewImage({
      current: url+"/images/reward.png", // 当前显示图片的http链接   
      urls: [url+ "/images/reward.png"] // 需要预览的图片http链接列表   
    })
  },  
})