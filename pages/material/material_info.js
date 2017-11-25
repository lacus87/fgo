// pages/material/material_info.js
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var materialId = 0;
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    flag: 1,
    tabs: ["掉落", "英灵"],
    dropList: [],
    servantList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    color: '#2aa515',
    initFlag: 1,
    model:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    materialId = options.id;
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight - 11,
          model: wx.getStorageSync("model"),
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    wx.request({
      url: app.globalData.url +'/fgo/material/getMaterialDrop.do?materialId=' + materialId,
      method: 'GET',
      success: function (res) {
        var servantList = res.data.data.servant;
        // var item = wx.getStorageSync('srv_list' + "_" + curAccId);
        // if (item == undefined || item == '') {
        //   item = [];
        //   wx.setStorageSync('srv_list' + "_" + curAccId, item);
        // }
        // for (var i = 0; i < servantList.length; i++) {
        //   servantList[i].flag = 0;
        //   if (item.indexOf(servantList[i].id) >= 0) {
        //     servantList[i].flag = 1;
        //   }
        // }
        that.setData({
          dropList: res.data.data.drops,
          servantList: servantList
        });
        
        var title = res.data.data.name + '*' + options.count;
        wx.setNavigationBarTitle({
          title: title//页面标题为路由参数
        });
        that.setServantStatus();
      }
    });


  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.initFlag == 0){
      this.setServantStatus();
    }
    this.setData({
      initFlag: 0
    })
  },
  setServantStatus: function () {
    var that = this;
    var servantList = this.data.servantList;
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (item == undefined || item == '') {
      item = [];
      wx.setStorageSync('srv_list' + "_" + curAccId, item);
    }
    var infoArray = [];
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    for (var i = 0; i < servantList.length; i++) {
      servantList[i].flag = 0;
      if (item.indexOf(servantList[i].id) >= 0) {
        servantList[i].flag = 1;
        var curSkillLevel = allSkillInfo[servantList[i].id + ''];
        if (curSkillLevel == undefined || curSkillLevel == null) {
          curSkillLevel = [0, 1, 1, 1];
        }
        curSkillLevel.push(0);
        var servant = new Object;
        servant.servantId = servantList[i].id;
        servant.rank = curSkillLevel[0] + "_4";
        servant.skill1 = curSkillLevel[1] + "_10";
        servant.skill2 = curSkillLevel[2] + "_10";
        servant.skill3 = curSkillLevel[3] + "_10";
        servant.clothFlag = (curSkillLevel[4] == 1?'N':'Y');
        infoArray.push(servant);
      }
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 3000,
      mask: true
    })
    wx.request({
      url: app.globalData.url +"/fgo/material/countServantMaterial.do?materialId=" + materialId,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: infoArray,
      complete: function (res) {
        wx.hideToast();
      },
      success: function (res) {
        var dropInfo = res.data.data;
        for (var i = 0; i < servantList.length; i++) {
          var id = servantList[i].id;
          var drops = dropInfo[id];
          if(drops != undefined && drops != null){
            servantList[i].total = drops.total;
            servantList[i].skill = drops.skill;
            servantList[i].rank = drops.rank;
            servantList[i].cloth = drops.cloth;
          }
        }
        that.setData({
          servantList: servantList
        })
      }
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
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
  switchCare: function () {
    var flag = this.data.flag == 0 ? 1 : 0;
    var color = flag == 0 ? '#CCC' : '#2aa515';
    this.setData({
      flag: flag,
      color: color
    })
  }
})