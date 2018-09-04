// pages/setting/setting_details.js
var util = require('../../utils/util.js');
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var materialId = 0;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    flag: 1,
    tabs: ["素材列表", "不要点我"],
    materialData: new Object(),
    mapList:[],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    model: getApp().globalData.model,
    sort:1,
    modelArray:[],
    showModalStatus: false,
    reqCount:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var that = this;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var materialData = prevPage.data.materialData;
    var materialList = materialData.material;
    var material = wx.getStorageSync('material' + "_" + curAccId);
    if (material == undefined || material == ''){
      material = new Object();
    }
    var eventMaterial = wx.getStorageSync('envmat' + "_" + curAccId);
    if (eventMaterial == undefined || eventMaterial == '') {
      eventMaterial = new Object();
    }
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
      materialList[i].color = '#8E8E8E';
      if (this.data.model == 1) {
        materialList[i].color = '#CCC';
      }
      if (ownCount < parseInt(materialList[i].count)) {
        desc += "/缺" + (materialList[i].count - ownCount);
        if (this.data.model == 1) {
          materialList[i].color = '#FF7575';
        } else {
          materialList[i].color = 'RED';
        }
      }
      materialList[i].desc = desc;
    }
    this.setData({
      materialData: prevPage.data.materialData,
      mapList: prevPage.data.materialData.drops.mapList
    })
    var qpOwn = material['1000'];
    if (qpOwn == undefined || qpOwn == null) {
      qpOwn = 0;
    }
    var qpRequest = this.data.materialData.qp;
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
      qpFlag: qpFlag
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight - 11,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          model: getApp().globalData.model
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  switchCare: function () {
    var flag = this.data.flag == 0 ? 1 : 0;
    var color = flag == 0 ? '#CCC' : 'GREENYELLOW';
    this.setData({
      flag: flag,
      color: color
    })
  },
  sort: function(e){
    var type =  e.currentTarget.dataset.index;
    var mapList = this.data.materialData.drops.mapList;
    if(type == 2){
      mapList = this.data.mapList;
      mapList.sort(this.sortById);
    }
    this.setData({
      sort:type,
      mapList:mapList
    })
  },
  sortById: function(a,b){
    return a.id < b.id?-1:1;
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    if (currentStatu == "open"){
      var id = e.currentTarget.dataset.index + '';
      var reqCount = e.currentTarget.dataset.count;
      var array = this.data.materialData.servantReqList[id];
      this.setData({
        reqCount: reqCount,
        modelArray: array
      })
    }
    util.show(currentStatu,this);
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

  }

})