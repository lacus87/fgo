// pages/event/event.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventList: [],
    model: app.globalData.model,
    showPast:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '查询卡池...'
    })
    this.setData({
      model: app.globalData.model
    })
    wx.request({
      url: app.globalData.url + '/event/getPickupList.do',
      method: 'GET',
      fail: function () {
        wx.hideLoading();
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.data) {
          var servantList = app.globalData.servantList;
          var upList = res.data.data;
          for (var i = 0; i < upList.length; i++) {
            var servantMap = upList[i].detail;
            Object.keys(servantMap).forEach(function (key) {
              var list = servantMap[key + ''];
              list.forEach(function (curUp) {
                servantList.forEach(function (servant) {
                  if (servant.id == curUp.servantId) {
                    curUp.imgPath = servant.imgPath;
                    curUp.rarity = servant.rarity;
                    curUp.name = servant.name;
                  }
                })
              })
            });
          }
          that.setData({
            eventList: upList
          })
        }
      }
    });
  },

  showDetail: function (e) {
    var id = e.currentTarget.dataset.index;
    var eventList = this.data.eventList;
    for (var i = 0; i < eventList.length; i++) {
      eventList[i].show = 0;
      if (eventList[i].id == id) {
        eventList[i].show = 1;
      }
    }
    wx.navigateTo({
      url: 'event_pickup_detail',
    })
  },

  onPullDownRefresh: function(e){
    if(this.data.showPast == 1){
      wx.stopPullDownRefresh();
      return;
    }
    var that = this;
    wx.showModal({
      title: '显示历史卡池',
      content: "是否显示所有历史卡池?",
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.confirm) {
          that.setData({
            showPast: 1
          })
        }
      }
    })
    
  }
  
})