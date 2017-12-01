// pages/material/material.js
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
    tabs: ["素材", "技能石", "棋子"],
    materialList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    model:0,
    qpCount:0,
    qpDesc:'零',
    material:{},
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: '素材列表'
    });
    var materialList = getApp().globalData.materialList;
    that.setData({
      materialList: materialList
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  onShow: function () {
  	var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
    	if(account[i].status == 1){
    			curAccId = account[i].id;
    	}
    }
    var materialList = this.data.materialList;
    var material = wx.getStorageSync('material'+"_"+curAccId);
    var localEvent = wx.getStorageSync('envmat' + "_" + curAccId);
    for (var i = 0; i < materialList.length; i++) {
      var id = materialList[i].id + '';
      if (localEvent[id] == undefined || localEvent[id] == null){
        localEvent[id] = 0;
      }
      if (material[id] == undefined || material[id] == null){
        material[id] = 0;
      }
      materialList[i].count = material[id];
      materialList[i].eventCount = localEvent[id];
    }
    wx.setStorageSync('material' + "_" + curAccId, material);
    wx.setStorageSync('envmat' + "_" + curAccId, localEvent);
    var qp = material['1000'];
    if(qp == undefined || qp == null){
      qp = 0;
    }
    var qpDesc = util.convertCount(qp);
    this.setData({
      material:material,
      materialList: materialList,
      model: wx.getStorageSync("model"),
      qpCount:qp,
      qpDesc: qpDesc
    });
  },
  setNumToMaterial: function (id, num) {
    var material = this.data.material;
    var materialList = this.data.materialList;
    for (var i = 0; i < materialList.length; i++) {
      var index = materialList[i].id;
      if (id == index) {
        materialList[i].count = num;
        material[id] = materialList[i].count;
      }
    }
    wx.setStorageSync('material' + "_" + curAccId, material);
    this.setData({
      materialList: materialList,
      material:material
    });
  },
  bindNumDelete: function (e) {
    var id = e.currentTarget.dataset.index+'';
    var material = this.data.material;
    var count = material[id];
    if (count > 0) {
      count--;
      this.setNumToMaterial(id, count);
    }
  },
  bindNumChange: function (e) {
    var id = e.currentTarget.dataset.index;
    var count = e.detail.value;
    if(isNaN(count)){
      return;
    }
    count = parseInt(count);
    if(count > 9999){
      count = 9999;
    }
    var localEvent = wx.getStorageSync('envmat' + "_" + curAccId);
    count = count + localEvent[id];
    this.setNumToMaterial(id, count);
  },
  bindQPChange:function(e){
    var id = e.currentTarget.dataset.index;
    var count = e.detail.value;
    if (isNaN(count)) {
      return;
    }
    count = parseInt(count);
    // if (count > 999999999){
    //   count = 999999999;
    // }
    if(count < 0 ){
      count = 0;
    }
    var material = wx.getStorageSync('material' + "_" + curAccId);
    material[id] = count;
    wx.setStorageSync('material' + "_" + curAccId, material);
    var qpDesc = util.convertCount(count);
    this.setData({
      qpCount: count,
      qpDesc: qpDesc
    });
  },

  bindNumAdd: function (e) {
    var id = e.currentTarget.dataset.index;
    var material = this.data.material;
    var count = material[id];
    if (count < 9999) {
      count++;
      this.setNumToMaterial(id, count);
    }
  },
  getMaterialDetail: function (e) {
    var id = e.currentTarget.dataset.index;
    var material = wx.getStorageSync('material' + "_" + curAccId);
    var count = material[id];
    wx.navigateTo({
      url: "material_info?id=" + id + "&count=" + count
    });
  }
})