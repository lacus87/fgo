// pages/setting/setting_reward.js
var app = getApp();
var curAccId = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    model: app.globalData.model,
    width: 300,
    url: '',
    sercherStorage: [],
    inputValue: "",             //搜索框输入的值  
    inputValue2: "",             //搜索框输入的值2  
    StorageFlag: false,         //显示搜索记录标志位
    mcType:24,
    autoSync:0,
    showInfo:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      autoSync: wx.getStorageSync("autoSync"),
      model: wx.getStorageSync("model"),
      url: app.globalData.url
    })
    var account = wx.getStorageSync('account');
    if (account == undefined || account == '') {
      account = [];
      account.push({ id: '1', name: '默认账号', status: 1 });
      account.push({ id: '2', name: '账号2', status: 0 });
      account.push({ id: '3', name: '账号3', status: 0 });
      account.push({ id: '4', name: '账号4', status: 0 });
      account.push({ id: '5', name: '账号5', status: 0 });
    }
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var pyArray = wx.getStorageSync('pyCode' + "_" + curAccId);
    if (pyArray != undefined && pyArray != '' && pyArray.length == 2) {
      this.setData({
        inputValue: pyArray[0],
        mcType: pyArray[1],
        inputValue2: wx.getStorageSync('uid' + "_" + curAccId)
      })
    }
  },

  onShow: function(){
    this.setData({
      showInfo: wx.getStorageSync("showInfo"),
    })
  },

  checkboxChange: function(e){
    var autoSync = this.data.autoSync;
    if(autoSync == 1){
      autoSync = 0;
    }else{
      autoSync = 1;
    }
    wx.setStorageSync("autoSync", autoSync);
  },

  bindInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  bindInput2: function (e) {
    this.setData({
      inputValue2: e.detail.value
    })
  },

  mcTypeChange: function(e){
    this.setData({
      mcType: e.detail.value
    })
  },

  syncAccount: function(){
    var that = this;
    wx.showToast({
      title: '正在查询',
      icon: 'loading',
      duration: 30000,
      mask: true
    })
    wx.request({
      url: this.data.url + '/account/syncAccount.do?srvId=' + this.data.inputValue + "&mcType=" + this.data.mcType  + "&unionId=" + this.data.inputValue2,
      success: function (res) {
        if(res.data.code != 10000){
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            image: '/images/warning.png',
            duration: 1000
          });
        }else{
          wx.showToast({
            title: '正在同步',
            icon: 'loading',
            duration: 10000,
            mask: true
          })
          that.syncLocalInfo(res.data.data);
          wx.showToast({
            title: '同步完成',
            icon: 'success',
            duration: 1000,
            mask: true
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      },
      fail: function(){
        wx.showToast({
          title: "服务器未响应",
          icon: 'success',
          image: '/images/warning.png',
          duration: 1000
        });
      }
    })
  },

  syncLocalInfo: function (accountInfo) {
    wx.setStorageSync('material' + "_" + curAccId, accountInfo.material);
    var servantList = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (servantList == undefined || servantList == '') {
      servantList = [];
    }
    var servantSkill = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (servantSkill == undefined || servantSkill == '') {
      servantSkill = {};
    }
    var tarServantSkill = accountInfo.srvSkill;

    var tarServantList = accountInfo.srv_list;
    for(var i = 0; i< tarServantList.length ;i++){
      var id = tarServantList[i];
      servantSkill[id] = tarServantSkill[id];
      var flag = 0;
      for (var j = 0; j < servantList.length; j++) {
        if (id == servantList[j]) {
          flag = 1;
          break;
        }
      }
      if (flag == 0) {
        servantList.push(id);
      }
    }
    wx.setStorageSync('srv_list' + "_" + curAccId, servantList);
    wx.setStorageSync('srvSkill' + "_" + curAccId, servantSkill);
    var pyArray = [];
    pyArray.push(this.data.inputValue);
    pyArray.push(this.data.mcType);
    wx.setStorageSync('pyCode' + "_" + curAccId, pyArray);
    wx.setStorageSync('uid' + "_" + curAccId, this.data.inputValue2);
  }
})