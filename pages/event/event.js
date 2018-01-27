// pages/event/event.js
var curAccId = 1;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventList: [],
    materialList: [],
    model:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '活动列表'
    });
    var eventList = getApp().globalData.eventList;
    this.setData({
      eventList: eventList
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var eventList = this.data.eventList;
    if(eventList.length == 0){
      eventList = getApp().globalData.eventList;
    }
	  var account = wx.getStorageSync('account');
	    for (var i = 0; i < account.length; i++) {
	    	if(account[i].status == 1){
	    			curAccId = account[i].id;
	    	}
	    }
    var localMaterial = wx.getStorageSync('material'+"_"+curAccId);
    var localEvent = wx.getStorageSync('envmat' + "_" + curAccId);
    var localEventFlag = wx.getStorageSync('event' + "_" + curAccId);
    for (var i = 0; i < eventList.length; i++) {
      var flag = localEventFlag[eventList[i].id+''];
      if (flag == undefined || flag == '') {
        flag = 0;
        localEventFlag[eventList[i].id + ''] = flag;
      }
      eventList[i].flag = flag;
      var material = eventList[i].material;
      for (var j = 0; j < material.length; j++) {
        var id = material[j].id + '';
        if (localMaterial[id] == undefined || localMaterial[id] == null){
          localMaterial[id] = 0;
        }
        if (localEvent[id] == undefined || localEvent[id] == null) {
          localEvent[id] = 0;
        }
        material[j].ownCount = localMaterial[id];
        material[j].eventCount = localEvent[id];
      }
    }
    wx.setStorageSync('material' + "_" + curAccId, localMaterial);
    wx.setStorageSync('envmat' + "_" + curAccId, localEvent);
    
    this.setData({
      eventList: eventList,
      model: wx.getStorageSync("model")
    });
  },
  showDetail: function (e) {
    var id = e.currentTarget.dataset.index;
    var eventList = this.data.eventList;
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].id == id) {
        eventList[i].show = eventList[i].show == 0 ? 1 : 0;
      } else {
        eventList[i].show = 0;
      }
    }
    this.setData({
      eventList: eventList
    });
  },
  showEventDetail: function(e){
    var id = e.currentTarget.dataset.index;
    var eventList = this.data.eventList;
    var name = "";
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].id == id) {
        name = eventList[i].name;
      }
    }
    wx.navigateTo({
      url: "event_info?eventId=" + id + "&name="+name
    });
  },
  switchChange: function (e) {
    var envId = e.currentTarget.dataset.index;
    var eventList = this.data.eventList;
    var event = '';
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].id == envId) {
        eventList[i].flag = eventList[i].flag == 0 ? 1 : 0;
        event = eventList[i];
        break;
      }
    }
    var stage = event.flag == 0 ? -1 : 1;
    var materialList = event.material;
    var localMaterial = wx.getStorageSync('material'+"_"+curAccId);
    var eventMaterial = wx.getStorageSync('envmat' + "_" + curAccId);
    for (var i = 0; i < materialList.length; i++){
      var id = materialList[i].id+'';
      var count = parseInt(localMaterial[id]) + parseInt(stage * materialList[i].count);
      var eventCount = parseInt(eventMaterial[id]) + parseInt(stage * materialList[i].count);
      if(eventCount < 0){
        eventCount = 0;
      }
      if(count < 0 ){
        wx.showToast({
          title: materialList[i].name+'不足',
          image: '/images/warning.png',
          icon: 'success',
          duration: 1000
        });
        event.flag = 1;
        this.setData({
          eventList: eventList
        });
        return;
      }
      localMaterial[id] = count;
      eventMaterial[id] = eventCount;
    }
    wx.setStorageSync('material'+"_"+curAccId, localMaterial);
    wx.setStorageSync('envmat' + "_" + curAccId, eventMaterial);
    this.setData({
      eventList: eventList
    });
    var localEvent = wx.getStorageSync('event'+"_"+curAccId);
    localEvent[envId + ''] = event.flag;
    wx.setStorageSync('event'+"_"+curAccId, localEvent);
    this.onShow();
  },
  clearEventInfo: function(e){
    var eventList = this.data.eventList;
    var that = this;
    wx.showModal({
      title: '还原活动设置',
      content: '初始化所有活动（含无限池）的数据，但不会修改素材数量',
      success: function (res) {
        if (res.confirm) {
          wx.setStorageSync('envmat' + "_" + curAccId, new Object());
          wx.setStorageSync('event' + "_" + curAccId, new Object());
          for (var i = 0; i < eventList.length; i++) {
            if (eventList[i].type == 2) {
              wx.setStorageSync('eventRep' + "_" + eventList[i].id + "_" + curAccId, 0);
            }
          }
          that.onShow();
        }
      }
    })
  }
})