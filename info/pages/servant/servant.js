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
    flag: 0,
    tabs: ["ALL", "剑", "弓", "枪", "骑", "术", "杀", "狂", "其他"],
    servantList: [],
    tempList: [],
    loadList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    model: app.globalData.model,
    cur: 0,
    sortTemp: 0,
    init: 0,
    errMsg: '',
    inputShowed: false, // 搜索输入框是否显示  
    inputVal: "", // 搜索的内容  
    checkboxItems: [
      { name: '五星', value: '5', count: [1, 1, 1, 1, 1], checked: true },
      { name: '四星', value: '4', count: [1, 1, 1, 1], checked: true },
      { name: '三星', value: '3', count: [1, 1, 1], checked: true },
      { name: '二星', value: '2', count: [1, 1], checked: true },
      { name: '一星', value: '1', count: [1], checked: true }
    ],
    showType: "2",
    checkboxItemsTemp: [
      { name: '五星', value: '5', count: [1, 1, 1, 1, 1], checked: true },
      { name: '四星', value: '4', count: [1, 1, 1, 1], checked: true },
      { name: '三星', value: '3', count: [1, 1, 1], checked: true },
      { name: '二星', value: '2', count: [1, 1], checked: true },
      { name: '一星', value: '1', count: [1], checked: true }
    ],
    showTypeTemp: "2",
    sex: [{ name: "女性", checked: 0 }, { name: "男性", checked: 0 }, { name: "？", checked: 0 }],
    camp1: [{ name: "天", checked: 0 }, { name: "地", checked: 0 }, { name: "人", checked: 0 }, { name: "星", checked: 0 }, { name: "兽", checked: 0 }], 
    camp2: [{ name: "秩序", checked: 0 }, { name: "混沌", checked: 0 }, { name: "中立", checked: 0 }],
    camp3: [{ name: "善", checked: 0 }, { name: "恶", checked: 0 }, { name: "中庸", checked: 0 }, { name: "花嫁", checked: 0 }, { name: "狂", checked: 0 }, { name: "夏", checked: 0 }],
    props: [{ name: "骑乘", checked: 0 }, { name: "人型", checked: 0 }, { name: "从者（不被EA克制）", checked: 0 }, { name: "半从者", checked: 0 }, { name: "拟似从者", checked: 0 }, { name: "龙", checked: 0 }, { name: "亚瑟", checked: 0 }, { name: "Saber脸", checked: 0 }, { name: "王", checked: 0 }, { name: "罗马", checked: 0 }, { name: "所爱之人", checked: 0 }, { name: "神性", checked: 0 }, { name: "魔性", checked: 0 }, { name: "猛兽", checked: 0 }, { name: "希腊神话系男性", checked: 0 }],
    cardType: [{ name: "Buster", checked: 0 }, { name: "Arts", checked: 0 }, { name: "Quick", checked: 0 }],
    cardSpec: [{ name: "群体", checked: 0 }, { name: "单体", checked: 0 }, { name: "辅助", checked: 0 }],
    propAllMatch:false,
  },
  onLoad: function () {
    var that = this;
    var allProps = this.data.sex.concat(this.data.camp1).concat(this.data.camp2).concat(this.data.camp3).concat(this.data.props);
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    var showType = wx.getStorageSync("showType");
    if (showType == undefined || showType == '') {
      showType = "2";
    }
    this.setData({
      showType: showType,
      showTypeTemp: showType,
      model: app.globalData.model
    })
    if (app.globalData.servantList.length == 0) {
      wx.request({
        url: app.globalData.url + '/servant/getServantList.do',
        method: 'GET',
        fail: function () {
          wx.showToast({
            title: '服务器无响应',
            image: '/images/warning.png',
            icon: 'success',
            duration: 5000
          });
        },
        success: function (res) {
          wx.hideToast();
          if (res.statusCode != 200) {
            that.setData({
              errMsg: "服务器正在重启中，暂无法响应，会尽快开启"
            })
            return;
          }
          var servantList = res.data.data;
          for (var i = 0; i < servantList.length; i++) {
            var array = [];
            for (var j = 0; j < allProps.length; j++){
              if (servantList[i].addition.indexOf(allProps[j].name) >=0){
                array.push(allProps[j].name);
              }
            }
            servantList[i].additionDesc = array;
          }
          that.setServantType(servantList);
          servantList = that.sortByCur(servantList, that.data.cur);
          app.globalData.servantList = servantList;
          that.setData({
            tempList: servantList
          })
          that.onShow();
          var servantRarity = new Object;
          for (var i = 0; i < servantList.length; i++) {
            var id = servantList[i].id;
            servantRarity[id] = {
              'rarity': servantList[i].rarity,
              'clazz': servantList[i].clazz,
              'imgPath': servantList[i].imgPath
            };
          }
          wx.setStorageSync('servantRarity', servantRarity);
        }
      });
    } else {
      wx.hideToast();
      var servantList = app.globalData.servantList;
      for (var i = 0; i < servantList.length; i++) {
        var array = [];
        for (var j = 0; j < allProps.length; j++) {
          if (servantList[i].addition.indexOf(allProps[j].name) >= 0) {
            array.push(allProps[j].name);
          }
        }
        servantList[i].additionDesc = array;
      }
      that.setServantType(servantList);
      servantList = this.sortByCur(servantList, this.data.cur);
      app.globalData.servantList = servantList;
      this.setData({
        tempList: servantList
      })
      this.onShow();
      var servantRarity = new Object;
      for (var i = 0; i < servantList.length; i++) {
        var id = servantList[i].id;
        servantRarity[id] = {
          'rarity': servantList[i].rarity,
          'clazz': servantList[i].clazz,
          'imgPath': servantList[i].imgPath
        };
      }
      wx.setStorageSync('servantRarity', servantRarity);
    }
  },

  setServantType: function(servantList){
    for (var i = 0; i < servantList.length; i++){
      var servant = servantList[i];
      if (servant.clazz == 'SABER'){
        servant.clazzType = 1;
      } else if (servant.clazz == 'ARCHER') {
        servant.clazzType = 2;
      } else if (servant.clazz == 'LANCER'){
        servant.clazzType = 3;
      } else if (servant.clazz == 'RIDER') {
        servant.clazzType = 4;
      } else if (servant.clazz == 'CASTER') {
        servant.clazzType = 5;
      } else if (servant.clazz == 'ASSASSIN') {
        servant.clazzType = 6;
      } else if (servant.clazz == 'BERSERKER') {
        servant.clazzType = 7;
      } else {
        servant.clazzType = 8;
      }
    }
  },

  onShow: function () {
    var that = this;
    var servantList = this.data.loadList;
    setTimeout(function () {
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            pageHeight: res.windowHeight - 46,
            sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 8,
            sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
          });
        }
      });
    }, 200);
    if (this.data.init != 1) {
      servantList = this.data.tempList;
      if (servantList.length == 0) return;
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
      var item = wx.getStorageSync('srv_list' + "_" + curAccId);
      if (item == undefined || item == '') {
        item = [];
        wx.setStorageSync('srv_list' + "_" + curAccId, item);
      }
      if (item.length == 0) {
        wx.showModal({
          title: '提示',
          content: '还未拥有任何英灵，是否去关注？',
          confirmText: '去关注',
          cancelText: '取消',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: 'servant_cared',
              })
            } else if (res.cancel) {
            }
          }
        })
      }
      for (var i = 0; i < servantList.length; i++) {
        servantList[i].flag = 0;
        if (item.indexOf(servantList[i].id) >= 0) {
          servantList[i].flag = 1;
        }
      }
      this.setData({
        init: 1,
        servantList: servantList
      })
      this.loadDataByStep(servantList, -30);
    } else {
      this.loadServantData(servantList);
    }
  },
  setFilterPanel: function (e) { //展开筛选面板
    wx.showLoading({
      title: '加载中...',
    })
    const d = this.data;
    const i = e.currentTarget.dataset.findex;
    this.setData({
      showfilter: d.showfilterindex == i?false:true,
      showfilterindex: d.showfilterindex == i?null:i
    }, wx.hideLoading());
  },
  hideFilter: function () { //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },

  loadServantData: function (servantList) {
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
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (item == undefined || item == '') {
      item = [];
      wx.setStorageSync('srv_list' + "_" + curAccId, item);
    }
    for (var i = 0; i < servantList.length; i++) {
      servantList[i].flag = 0;
      if (item.indexOf(servantList[i].id) >= 0) {
        servantList[i].flag = 1;
      }
    }
    servantList = this.sortByCur(servantList, this.data.cur);
    this.setData({
      loadList: servantList,
      servantList: servantList
    });
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  switchChange: function (e) {
    var flag = (this.data.flag + 1) % 3;
    this.setData({
      flag: flag
    });
  },
  switchServant: function () {
    var checkboxItems = this.data.checkboxItems;
    var servantList = getApp().globalData.servantList;
    var temp = [];
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    for (var i = 0; i < servantList.length; i++) {
      servantList[i].flag = 0;
      if (item.indexOf(servantList[i].id) >= 0) {
        servantList[i].flag = 1;
      }
      var rarity = servantList[i].rarity;
      for (var j = 0; j < checkboxItems.length; j++) {
        if (checkboxItems[j].checked && rarity == checkboxItems[j].value) {
          this.filterServant(temp, servantList[i]);
        }
      }
    }
    servantList = this.sortByCur(temp, this.data.cur);
    this.setData({
      servantList: servantList,
    });
    this.loadDataByStep(servantList, -30);
  },

  filterServant: function (temp, servant){
    var props = servant.addition;
    var filters = [this.data.camp1, this.data.camp2, this.data.camp3, this.data.sex,  this.data.cardType, this.data.cardSpec];
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


  sort: function (e) {
    var time = e.timeStamp;
    //设置无效点击，根据自己的需求设置，这里navigateTo切换页面到动画结束需要的时间为500毫秒左右
    if (time - app.globalData.lastTapTime < 1000 && app.globalData.lastTapTime != 0) {
      app.globalData.lastTapTime = time;//这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;
    var that = this;
    var servantList = this.sortByCur(this.data.servantList, this.data.cur == 1 ? 0 : 1);
    this.setData({
      cur: this.data.cur == 1 ? 0 : 1,
      servantList: servantList
    })
    this.sortByCur(app.globalData.servantList, this.data.cur);
    that.loadDataByStep(servantList, -30);
  },
  sortByCur: function (servantList, cur) {
    if (cur == 1) {
      servantList.sort(function (a, b) {
        if (a.id == '1001') return -1;
        if (b.id == '1001') return 1;
        return a.id < b.id ? -1 : 1
      });
    } else {
      servantList.sort(function (a, b) {
        if (a.id == '1001') return -1;
        if (b.id == '1001') return 1;
        return a.id < b.id ? 1 : -1
      });
    }
    return servantList;
  },

  loadDataByStep: function (servantList, step) {    
    if (step > servantList.length) {
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    step = step + 1000;
    var array = [];
    for (var i = 0; i < step && i < servantList.length; i++) {
      array.push(servantList[i]);
    }
    this.setData({
      loadList: array
    }, function(){
      wx.hideLoading();
    })
    var that = this;
    setTimeout(function () {
      that.loadDataByStep(servantList, step);
    }, 100);
  },
  // 点击叉叉icon 清除输入内容，并加载数据  
  clearInput: function () {
    this.setData({
      inputVal: "",
      servantList: getApp().globalData.servantList
    });
    this.loadDataByStep(getApp().globalData.servantList, -30);
  },

  // 输入内容时 把当前内容赋值给 查询的关键字，并显示搜索记录  
  inputTyping: function (e) {
    var that = this;
    var key = e.detail.value.toUpperCase();
    var servantList = getApp().globalData.servantList;
    var temp = [];
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    for (var i = 0; i < servantList.length; i++) {
      servantList[i].flag = 0;
      if (item.indexOf(servantList[i].id) >= 0) {
        servantList[i].flag = 1;
      }
      if (servantList[i].name.toUpperCase().indexOf(key) >= 0) {
        temp.push(servantList[i]);
      } else if (servantList[i].sex.toUpperCase().indexOf(key) >= 0) {
        temp.push(servantList[i]);
      }
    }
    servantList = that.sortByCur(temp, that.data.cur);
    that.setData({
      servantList: servantList
    });
    that.loadDataByStep(servantList, -30);
  },
  inputChange: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  showServantDetail: function (e) {
    //servant_detail?id={{item.id}}
    wx.showLoading({
      title: '页面跳转中...',
      mask: true
    })
    var id = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "servant_detail?id=" + id
    });
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    var currentOper = e.currentTarget.dataset.oper;
    if (currentStatu == "close") {
      if (currentOper == "confirm") {
        var showType = this.data.showTypeTemp;
        var checkboxItems = this.data.checkboxItemsTemp;
        var sortTemp = this.data.sortTemp;
        this.setData({
          showType: showType,
          checkboxItems: checkboxItems,
          cur: sortTemp
        })
        this.switchServant();
        wx.setStorageSync("showType", showType);
      } else {
        var showType = this.data.showType;
        var checkboxItems = this.data.checkboxItems;
        this.setData({
          showTypeTemp: showType,
          checkboxItemsTemp: checkboxItems,
          sortTemp: this.data.cur
        })
      }
      this.hideFilter();
    }
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
  showTypeChange: function (e) {
    this.setData({
      showTypeTemp: e.detail.value
    })
  },
  sortTypeChange: function (e) {
    this.setData({
      sortTemp: e.detail.value
    })
  },
  chooseCamp1: function(e){
    var name = e.currentTarget.dataset.id;
    var camp1 = this.data.camp1;
    camp1.forEach(function(item){
      if(item.name == name){
        item.checked = item.checked == 1?0:1;
      }
    })
    this.setData({
      camp1: camp1
    })
  },
  chooseCamp2: function (e) {
    var name = e.currentTarget.dataset.id;
    var camp2 = this.data.camp2;
    camp2.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      camp2: camp2
    })
  },
  chooseCamp3: function (e) {
    var name = e.currentTarget.dataset.id;
    var camp3 = this.data.camp3;
    camp3.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      camp3: camp3
    })
  },
  chooseSex: function (e) {
    var name = e.currentTarget.dataset.id;
    var sex = this.data.sex;
    sex.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      sex: sex
    })
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
    var props = this.data.cardType;
    props.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      cardType: props
    })
  },
  chooseCardSpec: function (e) {
    var name = e.currentTarget.dataset.id;
    var props = this.data.cardSpec;
    props.forEach(function (item) {
      if (item.name == name) {
        item.checked = item.checked == 1 ? 0 : 1;
      }
    })
    this.setData({
      cardSpec: props
    })
  },

  propAllMatchChange: function(e){
    this.setData({
      propAllMatch: this.data.propAllMatch == 1?0:1
    })
  }
});