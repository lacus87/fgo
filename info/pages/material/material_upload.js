// pages/material/material_upload.js
var util = require('../../utils/util.js')
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    localSetting: [],
    remoteSetting: [],
    syncDate: '',
    keyId: app.globalData.openId,
    motto: '使用微信号关联本地配置(英灵、素材等)',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    localData: util.formatTime(new Date),
    width: 400,
    model: app.globalData.model,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          width: res.windowWidth - 10,
          model: wx.getStorageSync("model"),
        });
      }
    });    
    this.getRemoteSetting();
    var userInfo = app.globalData.userInfo;
    if (userInfo != null) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
    setTimeout(function(){
      that.getLocalSetting();
    },500)
  },

  getRemoteSetting: function () {
    var key = this.data.keyId;
    var that = this;
    wx.request({
      url: app.globalData.url + '/servant/syncLocalSetting.do?key=' + key,
      success: function (res) {
        if (res.data.data != null) {
          that.setData({
            remoteSetting: res.data.data
          })
        }
      }
    })
  },

  getLocalSetting: function () {
    var localSetting = [];
    for (var curAccId = 1; curAccId <= 5; curAccId++) {
      localSetting.push({
        "material": wx.getStorageSync('material' + "_" + curAccId),
        "envmat": wx.getStorageSync('envmat' + "_" + curAccId),
        "event": wx.getStorageSync('event' + "_" + curAccId),
        "srv_list": wx.getStorageSync('srv_list' + "_" + curAccId),
        "srvSkill": wx.getStorageSync('srvSkill' + "_" + curAccId),
        "programe": wx.getStorageSync('programe' + "_" + curAccId),
        "programe1": wx.getStorageSync('programe' + "_" + curAccId + "_1"),
        "programe2": wx.getStorageSync('programe' + "_" + curAccId + "_2")
      });
    }
    console.log(localSetting);
    this.setData({
      localSetting: localSetting
    })
  },

  syncLocalSetting: function () {
    var remoteSetting = this.data.remoteSetting.localSetting;
    var that = this;
    if (remoteSetting == undefined) {
      wx.showToast({
        title: '无服务端配置',
        image: '/images/warning.png',
        icon: 'success',
        duration: 1000
      });
    } else {
      wx.showModal({
        title: '数据同步',
        content: "使用服务端配置覆盖本地配置",
        success: function (res) {
          if (res.confirm) {
            wx.showToast({
              title: '正在更新',
              icon: 'loading',
              duration: 5000,
              mask: true
            })
            //本地记录更新
            for (var i = 0; i < remoteSetting.length; i++) {
              var curAccId = i + 1;
              wx.setStorageSync('material' + "_" + curAccId, remoteSetting[i].material);
              wx.setStorageSync('envmat' + "_" + curAccId, remoteSetting[i].envmat);
              wx.setStorageSync('event' + "_" + curAccId, remoteSetting[i].event);
              wx.setStorageSync('srv_list' + "_" + curAccId, remoteSetting[i].srv_list);
              wx.setStorageSync('srvSkill' + "_" + curAccId, remoteSetting[i].srvSkill);
              wx.setStorageSync('programe' + "_" + curAccId, remoteSetting[i].programe);
              wx.setStorageSync('programe' + "_" + curAccId + "_1", remoteSetting[i].programe1);
              wx.setStorageSync('programe' + "_" + curAccId + "_2", remoteSetting[i].programe2);
            }
            that.setData({
              localSetting: remoteSetting
            })
            wx.showToast({
              title: '配置更新完成',
              icon: 'success',
              duration: 1000
            });
          }
        }
      });
    }

  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    //this.uploadLocalSetting();
  },
  uploadLocalSetting: function () {
    var that = this;
    var settingInfo = this.data.localSetting;
    var remoteSetting = this.data.remoteSetting;
    var key = this.data.keyId;
    var msg = "确定上传本地配置？";
    if (remoteSetting.date != undefined) {
      msg = "本地配置英灵【" + settingInfo[0].srv_list.length + "】覆盖远程配置英灵【" + remoteSetting.localSetting[0].srv_list.length + "】？";
    }
    wx.showModal({
      title: '数据上传',
      content: msg,
      success: function (res) {
        if (res.confirm) {
          //本地记录更新
          wx.request({
            url: app.globalData.url + "/servant/uploadLocalSetting.do?key=" + key,
            method: "POST",
            header: {
              'content-type': 'application/json'
            },
            data: settingInfo,
            success: function (res) {
              if (res.data.code != '10000') {
                wx.showToast({
                  title: data.msg,
                  image: '/images/warning.png',
                  icon: 'success',
                  duration: 3000
                });
              } else {
                that.setData({
                  remoteSetting: res.data.data
                })
              }
            }
          })
        }
      }
    });
  }
})