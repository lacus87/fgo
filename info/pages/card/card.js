var sliderWidth = 40; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var touchDotH = 0;//触摸时的原点y轴
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    cardList: [],
    showList: [],
    pageHeight: 400,
    model: app.globalData.model,
    cur: 0,
    sortTemp: 0,
    inputShowed: false, // 搜索输入框是否显示  
    inputVal: "", // 搜索的内容  
    checkboxItems: [
      { name: '五星', value: '5', count: [1, 1, 1, 1, 1], checked: true },
      { name: '四星', value: '4', count: [1, 1, 1, 1], checked: true },
      { name: '三星', value: '3', count: [1, 1, 1], checked: true },
      { name: '二星', value: '2', count: [1, 1], checked: true },
      { name: '一星', value: '1', count: [1], checked: true }
    ],
    checkboxItemsTemp: [
      { name: '五星', value: '5', count: [1, 1, 1, 1, 1], checked: true },
      { name: '四星', value: '4', count: [1, 1, 1, 1], checked: true },
      { name: '三星', value: '3', count: [1, 1, 1], checked: true },
      { name: '二星', value: '2', count: [1, 1], checked: true },
      { name: '一星', value: '1', count: [1], checked: true }
    ],
    props: [{ name: "Master经验", checked: 0 }, { name: "礼装经验", checked: 0 }, { name: "羁绊加成", checked: 0 }, { name: "友情点", checked: 0 }, { name: "QP增加", checked: 0 }, { name: "攻击力", checked: 0 }, { name: "宝具", checked: 0 }, { name: "特攻", checked: 0 }, { name: "固伤", checked: 0 }, { name: "防御力", checked: 0 }, { name: "特防", checked: 0 }, { name: "无视防御", checked: 0 }, { name: "无敌贯通", checked: 0 }, { name: "必中", checked: 0 }, { name: "即死率", checked: 0 }, { name: "Arts", checked: 0 }, { name: "Quick", checked: 0 }, { name: "Buster", checked: 0 }, { name: "闪避", checked: 0 }, { name: "无敌", checked: 0 }, { name: "毅力", checked: 0 }, { name: "嘲讽", checked: 0 }, { name: "NP", checked: 0 }, { name: "回NP", checked: 0 }, { name: "黄金律", checked: 0 }, { name: "暴击", checked: 0 }, { name: "产星", checked: 0 }, { name: "出星率", checked: 0 }, { name: "集星", checked: 0 }, { name: "最大HP", checked: 0 }, { name: "回HP", checked: 0 }, { name: "回复量", checked: 0 }, { name: "弱体耐性", checked: 0 }, { name: "弱体无效", checked: 0 }, { name: "免伤", checked: 0 }],
    cardType: [{ name: "卡池常驻", checked: 0 }, { name: "活动奖励", checked: 0 }, { name: "期间限定", checked: 0 }],
    cardSpec: [{ name: "活动加成", checked: 0 }, { name: "商店兑换", checked: 0 }, { name: "羁绊", checked: 0 }, { name: "情人节", checked: 0 }, { name: "纪念", checked: 0 }, { name: "EXP卡", checked: 0 }],
    propAllMatch:false
  },
  onLoad: function () {
    var that = this;
    this.setData({
      model: app.globalData.model
    })
    wx.showLoading({
      title: '正在加载...',
    });
    if (app.globalData.cardList.length == 0) {
      var localCardCache = wx.getStorageSync('localCardCache');
      if (localCardCache == undefined || localCardCache == '') {
        localCardCache = [];
      }
      wx.request({
        url: app.globalData.url + '/servant/getCardList.do?count=' + localCardCache.length + '&version=' + wx.getStorageSync('localCardCacheVersion'),
        method: 'GET',
        fail: function () {
          wx.hideLoading();
          wx.showToast({
            title: '服务器无响应',
            image: '/images/warning.png',
            icon: 'success',
            duration: 5000
          });
        },
        success: function (res) {
          if (res.data.data) {
            app.globalData.cardList = res.data.data;
            wx.setStorage({
              key: "localCardCache",
              data: res.data.data
            })
            wx.setStorage({
              key: "localCardCacheVersion",
              data: res.data.data[0].version
            })
          } else {
            app.globalData.cardList = localCardCache;
          }
          that.setData({
            cardList: app.globalData.cardList.reverse()
          }, function () {
            that.loadImgList(true);
          })
        }
      });
    } else {
      that.setData({
        cardList: app.globalData.cardList
      }, function(){
        that.loadImgList(true);
      })
    }
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            pageHeight: res.windowHeight - 46,
          });
        }
      });
    }, 200);
  },
  setFilterPanel: function (e) { //展开筛选面板
    const d = this.data;
    const i = e.currentTarget.dataset.findex;
    if (d.showfilterindex == i) {
      this.setData({
        showfilter: false,
        showfilterindex: null
      })
    } else {
      this.setData({
        showfilter: true,
        showfilterindex: i,
      })
    }
  },
  hideFilter: function () { //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  switchServant: function () {
    wx.showLoading({
      title: '正在筛选...',
    });
    var that = this;
    var checkboxItems = this.data.checkboxItems;
    var cardList = getApp().globalData.cardList;
    var temp = [];
    for (var i = 0; i < cardList.length; i++) {
      var rarity = cardList[i].star;
      for (var j = 0; j < checkboxItems.length; j++) {
        if (checkboxItems[j].checked && rarity == checkboxItems[j].value) {
          this.filterServant(temp, cardList[i]);
        }
      }
    }
    this.setData({
      cardList: temp,
    }, function(){
      that.loadImgList(true);
    });
  },

  filterServant: function (temp, servant){
    var props = servant.attr.split(",");
    var filters = [ this.data.cardType, this.data.cardSpec];
    for (var i = 0; i < filters.length; i++) {
      var filter = filters[i];
      var filterFlag = false;
      var chooseExist = false;
      for (var j = 0; j < filter.length; j++) {
        if (filter[j].checked) {
          chooseExist = true;
          if (props.indexOf(filter[j].name) >= 0){
            filterFlag = true;
          }
        }
      }
      if (chooseExist && !filterFlag) return;
    }
    var filter = this.data.props;
    var propAllMatch = this.data.propAllMatch;
    //任意匹配
    if (propAllMatch == 0){
      var filterFlag = false;
      var chooseExist = false;
      for (var j = 0; j < filter.length; j++) {
        if (filter[j].checked) {
          chooseExist = true;
          if (props.indexOf(filter[j].name) >= 0) {
            filterFlag = true;
          }
        }
      }
      if (chooseExist && !filterFlag) return;
    } else if (propAllMatch == 1){
      //全部匹配
      var filterFlag = true;
      var chooseExist = false;
      for (var j = 0; j < filter.length; j++) {
        if (filter[j].checked) {
          chooseExist = true;
          if (props.indexOf(filter[j].name) < 0) {
            filterFlag = false;
          }
        }
      }
      if (chooseExist && !filterFlag) return;
    }
    temp.push(servant);
  },
  sortByCur: function (cardList, cur) {
    if (cur == 1) {
      cardList.sort(function (a, b) {
        if (a.id == '1001') return -1;
        if (b.id == '1001') return 1;
        return a.id < b.id ? -1 : 1
      });
    } else {
      cardList.sort(function (a, b) {
        if (a.id == '1001') return -1;
        if (b.id == '1001') return 1;
        return a.id < b.id ? 1 : -1
      });
    }
    return cardList;
  },

  // 点击叉叉icon 清除输入内容，并加载数据  
  clearInput: function () {
    var that = this;
    wx.showLoading({
      title: '正在加载...',
    });
    this.setData({
      inputVal: "",
      cardList: getApp().globalData.cardList
    }, function(){
      that.loadImgList(true);
    });
  },

  // 输入内容时 把当前内容赋值给 查询的关键字，并显示搜索记录  
  inputTyping: function (e) {
    var that = this;
    var key = e.detail.value.toUpperCase();
    var cardList = getApp().globalData.cardList;
    var temp = [];
    for (var i = 0; i < cardList.length; i++) {
      if (cardList[i].name.toUpperCase().indexOf(key) >= 0) {
        temp.push(cardList[i]);
      }
    }
    this.setData({
      cardList: temp
    }, function(){
      that.loadImgList(true);
    });
  },
  inputChange: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  showCardDetail: function (e) {
    var id = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "card_detail?id=" + id
    });
  },

  checkboxChange: function (e) {
    var checkboxItems = this.data.checkboxItemsTemp, values = e.detail.value;
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
      checkboxItemsTemp: checkboxItems
    });
  },
  chooseProps: function (e) {
    var name = e.currentTarget.dataset.id;
    var props = this.data.props;
    props.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      props: props
    })
  },
  chooseCardType: function (e) {
    var name = e.currentTarget.dataset.id;
    var camp1 = this.data.cardType;
    camp1.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      cardType: camp1
    })
  },
  chooseCardSpec: function (e) {
    var name = e.currentTarget.dataset.id;
    var camp1 = this.data.cardSpec;
    camp1.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      cardSpec: camp1
    })
  },

  propAllMatchChange: function(e){
    this.setData({
      propAllMatch: this.data.propAllMatch == 1?0:1
    })
  },

  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    var currentOper = e.currentTarget.dataset.oper;
    if (currentStatu == "close") {
      if (currentOper == "confirm") {
        var checkboxItems = this.data.checkboxItemsTemp;
        var sortTemp = this.data.sortTemp;
        this.setData({
          checkboxItems: checkboxItems,
          cur: sortTemp
        })
        this.switchServant();
      } else {
        var checkboxItems = this.data.checkboxItems;
        this.setData({
          checkboxItemsTemp: checkboxItems,
          sortTemp: this.data.cur
        })
      }
      this.hideFilter();
    }
  },

  loadImgList: function(init){
    var showList = init==true?[]:this.data.showList;
    var length = showList.length;
    var globalList = this.data.cardList;
    if (length >= globalList.length) {
      wx.hideLoading();
      return;
    }
    wx.showLoading({
      title: '正在加载...',
    })
    for(var i = length; i< length+100 && i < globalList.length; i++){
      showList.push(globalList[i]);
    }
    this.setData({
      showList: showList
    }, function () {
      wx.hideLoading();
    });
  }
});