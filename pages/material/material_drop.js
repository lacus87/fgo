// pages/material/material_info.js
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    flag: 1,
    dropList: [],
    servantList: [],
    pageHeight: 400,
    model:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var id = options.id;
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var dropModel = wx.getStorageSync("dropModel_" + curAccId);
    if (dropModel == undefined || dropModel == ''){
      dropModel = 1;
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight,
          model: wx.getStorageSync("model")
        });
      }
    });
    wx.request({
      url: app.globalData.url +'/fgo/material/getMaterialDrop.do?materialId=' + id+'&model='+dropModel,
      method: 'GET',
      success: function (res) {
        that.setData({
          dropList: res.data.data.drops
        });
        wx.setNavigationBarTitle({
          title: res.data.data.name//页面标题为路由参数
        });
      }
    });


  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
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