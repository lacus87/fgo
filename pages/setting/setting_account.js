var wxCharts = require('../style/wxcharts-min.js');
var time = 0;
var touchDot = 0;//触摸时的原点
var touchDotH = 0;//触摸时的原点y轴
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
Page({
  data: {
    flag: 1,
    tabs: ["职阶分布", "收集进度"],
    showTopTips: false,
    checkboxItems: [
      { name: '五星', value: '5', count: [1, 1, 1, 1, 1], checked: true },
      { name: '四星', value: '4', count: [1, 1, 1, 1] },
      { name: '三星', value: '3', count: [1, 1, 1] },
      { name: '二星', value: '2', count: [1, 1] },
      { name: '一星', value: '1', count: [1] }
    ],
    pageWidth: 300,
    model: 0,
    materialData: {},
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    ownCount: [0, 0, 0, 0, 0],
    totalCount: [0, 0, 0, 0, 0],
    percent: [0, 0, 0, 0, 0],
    imgPath:""
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '英灵收集详情'
    });
    var that = this;
    var servantList = getApp().globalData.servantList;
    var totalCount = [0, 0, 0, 0, 0];
    for (var i = 0; i < servantList.length; i++) {
      var index = 5 - parseInt(servantList[i].rarity);
      totalCount[index] = totalCount[index] + 1;
    }
    that.setData({
      totalCount: totalCount
    });
    var rarity = 5;
    var checkboxItems = this.data.checkboxItems;
    for (var i = 0; i < checkboxItems.length; i++) {
      checkboxItems[i].checked = false;
      if (checkboxItems[i].value == rarity) {
        checkboxItems[i].checked = true;
      }
    }
    this.setData({
      checkboxItems: checkboxItems,
      url: app.globalData.url + "/fgo"
    });
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageWidth: res.windowWidth,
          pageHeight: res.windowHeight,
          model: wx.getStorageSync("model")
        });
      }
    });
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    this.drawServant();
    this.changeRarity();
  },
  changeRarity: function () {
    var rarity = wx.getStorageSync('servantRarity');
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    var ownCount = [0, 0, 0, 0, 0];
    var totalCount = this.data.totalCount;
    for (var i = 0; i < item.length; i++) {
      var id = item[i] + '';
      var index = 5 - parseInt(rarity[id].rarity);
      ownCount[index] = ownCount[index] + 1;
    }
    var percent = [];
    percent.push(Math.floor(ownCount[0] * 100 / totalCount[0]));
    percent.push(Math.floor(ownCount[1] * 100 / totalCount[1]));
    percent.push(Math.floor(ownCount[2] * 100 / totalCount[2]));
    percent.push(Math.floor(ownCount[3] * 100 / totalCount[3]));
    percent.push(Math.floor(ownCount[4] * 100 / totalCount[4]));
    this.setData({
      ownCount: ownCount,
      percent: percent
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  drawServant: function () {
    var that = this;
    var width = this.data.pageWidth;
    var servantData = [
      { name: 'SABER', data: 0, color: '#1195db' },
      { name: 'ARCHER', data: 0, color: '#f6ef37' },
      { name: 'LANCER', data: 0, color: '#0e932e' },
      { name: 'RIDER', data: 0, color: '#a686ba' },
      { name: 'CASTER', data: 0, color: '#7dc5eb' },
      { name: 'ASSASSIN', data: 0, color: '#515151' },
      { name: 'BERSERKER', data: 0, color: '#d81e06' },
      { name: 'RULER', data: 0, color: '#efb336' },
      { name: 'AVENGER', data: 0, color: '#88147f' },
      { name: 'SHIELDER', data: 0, color: '#e89abe' },
      { name: 'ALTEREGO', data: 0, color: '#17abe3' },
      { name: 'MOONCANCER', data: 0, color: '#a4579d' },
      { name: 'FOREIGNER', data: 0, color: '#5A5AAD' },
    ];
    var checkboxItems = this.data.checkboxItems;
    var rarityList = [];
    for (var i = 0; i < checkboxItems.length; i++) {
      if (checkboxItems[i].checked) {
        rarityList.push(checkboxItems[i].value);
      }
    }
    var rarity = wx.getStorageSync('servantRarity');
    if (rarity == undefined || rarity == '') {
      rarity = new Object();
    }
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (item == undefined || item == '') {
      item = [];
    }
    for (var i = 0; i < item.length; i++) {
      var id = item[i] + '';
      var curRarity = rarity[id];
      if (rarityList.indexOf(curRarity.rarity) >= 0) {
        for (var j = 0; j < servantData.length; j++) {
          if (servantData[j].name == curRarity.clazz) {
            servantData[j].data = servantData[j].data + 1;
            break;
          }
        }
      }
    }
    for (var i = servantData.length - 1; i >= 0; i--) {
      if (servantData[i].data == 0) {
        servantData.splice(i, 1);
      }
    }
    for (var i = servantData.length - 1; i >= 0; i--) {
      servantData[i].name = servantData[i].name + ":" + servantData[i].data;
    }
    if (servantData.length == 0) {
      return;
    }
    new wxCharts({
      canvasId: 'accountInfo',
      type: 'pie',
      series: servantData,
      width: width,
      height: 300,
      dataLabel: false
    }).addEventListener('renderComplete' , function(){
      wx.canvasToTempFilePath({
        canvasId: 'accountInfo',
        success: function (res) {
          that.setData({
            imgPath: res.tempFilePath
          });
        }
      })
    });
  },


  checkboxChange: function (e) {
    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      checkboxItems: checkboxItems
    });
    this.drawServant();
  },

  onShareAppMessage(res){
    return {
      imageUrl: this.data.imgPath
    }
  }
});