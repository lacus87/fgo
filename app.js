//app.js
var util = require('/utils/util.js');
App({
  onLaunch: function () {
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
    var curAccId = account[0].id;
    for (var i = 0; i < account.length; i++) {
      //初始化素材信息
      var accountId = account[i].id;
      var material = wx.getStorageSync('material' + "_" + accountId);
      var eventMaterial = wx.getStorageSync('envmat' + "_" + accountId);
      var event = wx.getStorageSync('event' + "_" + accountId);
      if (material == undefined || material == '') {
        material = new Object;
        wx.setStorageSync('material' + "_" + accountId, material);
      }
      if (eventMaterial == undefined || eventMaterial == '') {
        eventMaterial = new Object;
        wx.setStorageSync('envmat' + "_" + accountId, eventMaterial);
      }
      if (event == undefined || event == '') {
        event = new Object;
        wx.setStorageSync('event' + "_" + accountId, event);
      }

      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var localMaterialCacheData = wx.getStorageSync('localMaterialCacheData');
    if (localMaterialCacheData == undefined || localMaterialCacheData == '') {
      localMaterialCacheData = [];
    }
    wx.request({
      url: that.globalData.url + '/material/getMaterialList.do?count='+localMaterialCacheData.length,
      method: 'GET',
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        var materialList = localMaterialCacheData;
        if(res.data.data){
          materialList = res.data.data;
          wx.setStorage({
            key: "localMaterialCacheData",
            data: res.data.data
          })
        }
        var material = wx.getStorageSync('material' + "_" + curAccId);
        for (var i = 0; i < materialList.length; i++) {
          var id = materialList[i].id + '';
          var ownCount = material[id];
          if (ownCount == undefined || ownCount == '') {
            ownCount = 0;
            material[id] = ownCount;
          }
          materialList[i].count = ownCount;
        }
        wx.setStorageSync('material' + "_" + curAccId, material);
        that.globalData.materialList = materialList;
      }
    });
    var localEventCacheData = wx.getStorageSync('localEventCacheData');
    if (localEventCacheData == undefined || localEventCacheData == '') {
      localEventCacheData = [];
    }
    wx.request({
      url: that.globalData.url + '/material/getEventList.do?count='+localEventCacheData.length,
      method: 'GET',
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        var eventList = localEventCacheData;
        if (res.data.data) {
          eventList = res.data.data;
          wx.setStorage({
            key: "localEventCacheData",
            data: res.data.data
          })
        }
        var allMaterial = [];
        var localEvent = wx.getStorageSync('event' + "_" + curAccId);
        if (localEvent == undefined || localEvent == '') {
          localEvent = new Object;
        }
        for (var i = 0; i < eventList.length; i++) {
          var id = eventList[i].id + '';
          var flag = localEvent[id];
          if (flag == undefined || flag == '') {
            flag = 0;
            localEvent[id] = flag;
          }
          eventList[i].flag = flag;
          var timestamp = Date.parse(new Date());
          if (timestamp > eventList[i].date) {
            eventList[i].exit = 1;
          } else {
            eventList[i].exit = 0;
          }
          eventList[i].show = 0;
        }
        wx.setStorageSync('event' + "_" + curAccId, localEvent);
        that.globalData.eventList = eventList;
        that.calculateEventMat(eventList, curAccId);
      }
    });
    wx.login({
      success: function (loginCode) {
        //调用request请求api转换登录凭证  
        wx.request({
          url: that.globalData.url + '/servant/getOpenId.do?code=' + loginCode.code,
          success: function (res) {
            that.globalData.openId = res.data.data;
          }
        })
      }
    })
  },

  onShow: function(){
    return;
    //util.syncAccount(this.globalData.url);
  },
  calculateEventMat: function (eventList, curAccId) {
    var that = this;
    var localEvent = {};
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].flag == 1) {
        var material = eventList[i].material;
        for (var j = 0; j < material.length; j++) {
          var id = material[j].id + '';
          if (localEvent[id] == undefined || localEvent[id] == null) {
            localEvent[id] = 0;
          }
          localEvent[id] += parseInt(material[j].count);
        }
      }
    }
    wx.setStorageSync('envmat' + "_" + curAccId, localEvent);
    //处理异步的数据
    var repEventList = [];
  	for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].type == 2) {
        var historyCount = wx.getStorageSync('eventRep' + "_" + eventList[i].id + "_" + curAccId);
        if (historyCount == undefined || historyCount == '') {
          historyCount = 0;
        }
        if (historyCount > 0) {
        	repEventList.push(eventList[i]);
      	}
      }
    }
    that.calculateEventMatRep(0,repEventList,curAccId);
  },
  calculateEventMatRep: function(index,eventList, curAccId){
    var that = this;
    if(index < eventList.length){
    	wx.request({
            url: that.globalData.url + '/material/getEventMaterial2.do?eventId=' + eventList[index].id,
            method: 'GET',
            success: function (res) {
              var material = res.data.data;
              var historyCount = wx.getStorageSync('eventRep' + "_" + eventList[index].id + "_" + curAccId);
              var localEventTemp = wx.getStorageSync('envmat' + "_" + curAccId);
              for (var j = 0; j < material.length; j++) {
                var id = material[j].id + '';
                if (localEventTemp[id] == undefined || localEventTemp[id] == null) {
                  localEventTemp[id] = 0;
                }
                localEventTemp[id] += parseInt(historyCount) * parseInt(material[j].count);
              }
              wx.setStorageSync('envmat' + "_" + curAccId, localEventTemp);
              that.calculateEventMatRep(index+1,eventList,curAccId);
            }
          });
     }
  },
  globalData: {
    cardList:[],
    servantList: [],
    eventList: [],
    materialList: [],
    lastTapTime: 0,
    openId:0,
    model: wx.getStorageSync("model"),
    // url: 'http://127.0.0.1/fgo'
    url: 'https://www.fgowiki.cn/fgo'
  }
})