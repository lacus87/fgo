// pages/servant/servant_material.js
var util = require('../../utils/util.js');
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
    material: '',
    pageHeight: 0,
    model: 0,
    qpDesc: '',
    qpColor: '1',
    clothFlag: 0,
    imgPath:[],
    servantImg:'',
    rank:'',
    skill:[],
    url:'',
    id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight - 135,
          model: wx.getStorageSync("model")
        });
      }
    });
    this.setData({
      servantImg: app.globalData.url + "/fgo/images/servant/" + options.id.substring(1, 4) + ".jpg",
      imgPath: options.imgPath.split(","),
      rank: options.rank.replace("_", "→"),
      skill: options.skill.replace(/_/g, "→").split(","),
      url: app.globalData.url+"/fgo",
      id: options.id
    })
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    wx.request({
      url: app.globalData.url + '/fgo/servant/getServantMaterialWithGodCloth.do?servantId=' + options.id + "&rank=" + options.rank + "&skill=" + options.skill + "&clothFlag=" + options.clothFlag,
      method: 'GET',
      success: function (res) {
        var materialInfo = res.data.data;
        var materialList = materialInfo.material;
        var material = wx.getStorageSync('material' + "_" + curAccId);
        var eventMaterial = wx.getStorageSync('envmat' + "_" + curAccId);
        for (var i = 0; i < materialList.length; i++) {
          var id = materialList[i].id + '';
          var ownCount = material[id];
          if (ownCount == undefined || ownCount == null) {
            ownCount = 0;
          }
          var desc = "拥有" + ownCount;
          var eventCount = eventMaterial[id];
          if (eventCount == undefined || eventCount == null) {
            eventCount = 0;
          }
          if (eventCount > 0) {
            desc += "(活动" + eventCount + ")";
          }
          // materialList[i].color = '#8E8E8E';
          // if (ownCount < parseInt(materialList[i].count)) {
          //   desc += "/缺" + (materialList[i].count - ownCount)
          //   materialList[i].color = 'RED';
          // }
          materialList[i].color = '#8E8E8E';
          if (that.data.model == 1) {
            materialList[i].color = '#CCC';
          }
          if (ownCount < parseInt(materialList[i].count)) {
            desc += "/缺" + (materialList[i].count - ownCount);
            if (that.data.model == 1) {
              materialList[i].color = '#FF7575';
            } else {
              materialList[i].color = 'RED';
            }
          }
          materialList[i].desc = desc;
        }
        that.setData({
          material: materialInfo
        });
        wx.setNavigationBarTitle({
          title: that.data.material.name//页面标题为路由参数
        });
        var qpOwn = material['1000'];
        if (qpOwn == undefined || qpOwn == null) {
          qpOwn = 0;
        }
        var qpRequest = materialInfo.qp;
        var qpD = parseInt(qpOwn) - parseInt(qpRequest);
        var desc = "拥有" + qpOwn + "(" + util.convertCount(qpOwn) + ")";
        var qpFlag = 1;
        if (qpD < 0) {
          qpD = qpD * -1;
          desc = "缺" + qpD + "(" + util.convertCount(qpD) + ")";
          qpFlag = 0
        }
        that.setData({
          qpDesc: desc,
          qpFlag: qpFlag,
          clothFlag: options.clothFlag
        })
      }
    });
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
  },
  reduceMaterial: function () {
    var that = this;
    var materialList = this.data.material.material;
    var qpRequest = this.data.material.qp;
    var flag = true;
    var material = wx.getStorageSync('material' + "_" + curAccId);
    for (var i = 0; i < materialList.length; i++) {
      var id = materialList[i].id + '';
      var ownCount = material[id];
      if (ownCount == undefined || ownCount == '') {
        ownCount = 0;
      }
      if (ownCount < parseInt(materialList[i].count)) {
        flag = false;
      }
    }
    if (this.data.qpFlag != 1) {
      wx.showToast({
        title: 'QP不足',
        image: '/images/warning.png',
        icon: 'success',
        duration: 1000
      });
    } else if (!flag) {
      wx.showToast({
        title: '素材不足',
        image: '/images/warning.png',
        icon: 'success',
        duration: 1000
      });
    } else {
      wx.showModal({
        title: '警告',
        content: '升级英灵技能，会从拥有素材中扣除升级的部分，且无法还原',
        success: function (res) {
          if (res.confirm) {
            //本地记录更新
            var materialList = that.data.material.material;
            for (var i = 0; i < materialList.length; i++) {
              var id = materialList[i].id + '';
              var ownCount = material[id];
              ownCount = ownCount - parseInt(materialList[i].count);
              material[id] = ownCount;
            }
            var qpOwn = material['1000'];
            if (qpOwn == undefined || qpOwn == null) {
              qpOwn = 0;
            }
            var qpD = parseInt(qpOwn) - parseInt(qpRequest);
            if (qpD < 0) {
              wx.showToast({
                title: 'QP不足',
                image: '/images/warning.png',
                icon: 'success',
                duration: 1000
              });
              return;
            }
            material['1000'] = qpD;
            wx.setStorageSync('material' + "_" + curAccId, material);
            //父级页面更新
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            prevPage.setStatus();
            wx.navigateBack();
          }
        }
      });
    }
  }
})