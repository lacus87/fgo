// pages/material/material.js
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
    qpDesc:'零'
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
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    wx.setNavigationBarTitle({
      title: '素材列表'
    });
    var materialList = getApp().globalData.materialList;
    that.setData({
      materialList: materialList
    });
    // wx.request({
    //   url: 'https://www.fgowiki.cn/fgo/material/getMaterialList.do',
    //   method: 'GET',
    //   success: function (res) {
    //     var materialList = res.data.data;
    //     for (var i = 0; i < materialList.length; i++) {
    //       var id = materialList[i].id;
    //       var ownCount = wx.getStorageSync('mat_' + id);
    //       if (ownCount == undefined || ownCount == '') {
    //         ownCount = 0;
    //         wx.setStorageSync('mat_' + id, ownCount);
    //       }
    //       materialList[i].count = ownCount;
    //     }
    //     that.setData({
    //       materialList: materialList
    //     });
    //   }
    // });
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
    for (var i = 0; i < materialList.length; i++) {
      var id = materialList[i].id + '';
      if (material[id] == undefined || material[id] == null){
        material[id] = 0;
      }
      materialList[i].count = material[id];
    }
    wx.setStorageSync('material' + "_" + curAccId, material);
    var qp = material['1000'];
    if(qp == undefined || qp == null){
      qp = 0;
    }
    var qpDesc = this.convertCount(qp);
    this.setData({
      materialList: materialList,
      model: wx.getStorageSync("model"),
      qpCount:qp,
      qpDesc: qpDesc
    });
  },
  setNumToMaterial: function (id, num) {
    var materialList = this.data.materialList;
    for (var i = 0; i < materialList.length; i++) {
      var index = materialList[i].id;
      if (id == index) {
        materialList[i].count = num;
      }
    }
    this.setData({
      materialList: materialList
    });
  },
  bindNumDelete: function (e) {
    var id = e.currentTarget.dataset.index+'';
    var material = wx.getStorageSync('material'+"_"+curAccId);
    var count = material[id];
    if (count > 0) {
      count--;
      material[id] = count;
      wx.setStorageSync('material'+"_"+curAccId, material);
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
    var material = wx.getStorageSync('material'+"_"+curAccId);
    if(count < 0){
      count = 0;
    }
    if(count > 9999){
      count = 9999;
    }
    material[id] = count;
    wx.setStorageSync('material'+"_"+curAccId, material);
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
    var qpDesc = this.convertCount(count);
    this.setData({
      qpCount: count,
      qpDesc: qpDesc
    });
  },

  bindNumAdd: function (e) {
    var id = e.currentTarget.dataset.index;
    var material = wx.getStorageSync('material'+"_"+curAccId);
    var count = material[id];
    if (count < 9999) {
      count++;
      material[id] = count;
      wx.setStorageSync('material'+"_"+curAccId, material);
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
  },

  convertCount: function(money) {
    //汉字的数字
    var cnNums = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九');
    //基本单位
    var cnIntRadice = new Array('', '十', '百', '千');
    //对应整数部分扩展单位
    var cnIntUnits = new Array('', '万', '亿', '兆');
    //对应小数部分单位
    var cnDecUnits = new Array('角', '分', '毫', '厘');
    //整数金额时后面跟的字符
    var cnInteger = '';
    //整型完以后的单位
    var cnIntLast = '';
    //最大处理的数字
    var maxNum = 999999999999999.9999;
    //金额整数部分
    var integerNum;
    //金额小数部分
    var decimalNum;
    //输出的中文金额字符串
    var chineseStr = '';
    //分离金额后用的数组，预定义
    var parts;
    if(money == '') { return ''; }
  money = parseFloat(money);
    if(money >= maxNum) {
      //超出最大处理数字
      return '';
    }
  if (money == 0) {
      chineseStr = cnNums[0] + cnIntLast + cnInteger;
      return chineseStr;
    }
  //转换为字符串
  money = money.toString();
    if(money.indexOf('.') == -1) {
      integerNum = money;
      decimalNum = '';
    } else {
      parts = money.split('.');
      integerNum = parts[0];
      decimalNum = parts[1].substr(0, 4);
    }
  //获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
      var zeroCount = 0;
      var IntLen = integerNum.length;
      for (var i = 0; i < IntLen; i++) {
        var n = integerNum.substr(i, 1);
        var p = IntLen - i - 1;
        var q = p / 4;
        var m = p % 4;
        if (n == '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            chineseStr += cnNums[0];
          }
          //归零
          zeroCount = 0;
          chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
        }
        if (m == 0 && zeroCount < 4) {
          chineseStr += cnIntUnits[q];
        }
      }
      chineseStr += cnIntLast;
    }
  //小数部分
  if (decimalNum != '') {
      var decLen = decimalNum.length;
      for (var i = 0; i < decLen; i++) {
        var n = decimalNum.substr(i, 1);
        if (n != '0') {
          chineseStr += cnNums[Number(n)] + cnDecUnits[i];
        }
      }
    }
  if (chineseStr == '') {
      chineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (decimalNum == '') {
      chineseStr += cnInteger;
    }
  return chineseStr;
  },
})