var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var touchDotH = 0;//触摸时的原点y轴
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();


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
    model: 0,
    cur: 0,
    init: 0,
    errMsg:'',
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight - 45,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 5000,
      mask: true
    })
    wx.request({
      url: app.globalData.url+'/fgo/servant/getServantList.do',
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
            errMsg: "服务器处于备案过程中，暂无法响应，备案完成后会第一时间开启"
          })
          return;
        }
        var servantList = res.data.data;
        servantList = that.sortByCur(servantList, that.data.cur);
        app.globalData.servantList = servantList;
        that.setData({
          tempList: servantList
        })
        that.onShow();
        var servantRarity = new Object;
        for (var i = 0; i < res.data.data.length; i++) {
          var servant = res.data.data[i];
          var id = servant.id;
          servantRarity[id] = {
            'rarity': servant.rarity,
            'clazz': servant.clazz,
            'imgPath': servant.imgPath
          };
        }
        wx.setStorageSync('servantRarity', servantRarity);
      }
    });
  },
  onShow: function () {
    var servantList = this.data.loadList;
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
      for (var i = 0; i < servantList.length; i++) {
        servantList[i].flag = 0;
        if (item.indexOf(servantList[i].id) >= 0) {
          servantList[i].flag = 1;
        }
      }
      this.setData({
        init: 1,
        servantList: servantList,
        model: wx.getStorageSync("model")
      })
      this.loadDataByStep(servantList, -30);
    } else {
      this.loadServantData(servantList);
    }
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
      servantList: servantList,
      model: wx.getStorageSync("model"),
    });
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  switchChange: function (e) {
    var flag = this.data.flag == 1 ? 0 : 1;
    this.setData({
      flag: flag
    });
  },
  // 触摸开始事件 
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点 
    touchDotH = e.touches[0].pageY;
    // 使用js计时器记录时间  
    interval = setInterval(function () {
      time++;
    }, 200);
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    var touchMoveY = e.changedTouches[0].pageY;
    console.log(touchMoveY - touchDotH);
    if (touchMoveY - touchDotH <= -150
      || touchMoveY - touchDotH >= 150) {
      clearInterval(interval); // 清除setInterval 
      time = 0;
      return;
    }

    var touchMove = e.changedTouches[0].pageX;

    // 向左滑动  
    if (touchMove - touchDot <= -40 && time < 10) {
      var index = this.data.activeIndex;
      if (index < this.data.tabs.length - 1) {
        index++;
      }
      var sliderOffset = this.data.sliderLeft * index * 10;
      this.setData({
        activeIndex: index,
        sliderOffset: sliderOffset
      });
    }
    // 向右滑动 
    if (touchMove - touchDot >= 40 && time < 10) {
      var index = this.data.activeIndex;
      if (index > 0) {
        index--;
      }
      var sliderOffset = this.data.sliderLeft * index * 10;
      this.setData({
        activeIndex: index,
        sliderOffset: sliderOffset
      });
    }
    clearInterval(interval); // 清除setInterval 
    time = 0;
  },
  switchServant: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['全部', '五星', '四星', '金卡','其他'],
      success: function (res) {
        if (!res.cancel) {
          var id = res.tapIndex;
          var servantList = getApp().globalData.servantList;
          console.log(servantList);
          var temp = [];
          var item = wx.getStorageSync('srv_list' + "_" + curAccId);
          for (var i = 0; i < servantList.length; i++) {
            servantList[i].flag = 0;
            if (item.indexOf(servantList[i].id) >= 0) {
              servantList[i].flag = 1;
            }
            var rarity = parseInt(servantList[i].rarity);
            if (id == 1 && rarity == 5) {
              temp.push(servantList[i]);
            } else if (id == 2 && rarity == 4) {
              temp.push(servantList[i]);
            } else if (id == 3 && rarity > 3) {
              temp.push(servantList[i]);
            } else if (id == 4 && rarity < 4) {
              temp.push(servantList[i]);
            } else if (id == 0) {
              temp.push(servantList[i]);
            }
          }
          servantList = that.sortByCur(temp, that.data.cur);
          that.setData({
            servantList: servantList,
          });
          that.loadDataByStep(servantList, -30);
        }
      }
    })

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
    step = step + 40;
    var array = [];
    for (var i = 0; i < step && i < servantList.length; i++) {
      array.push(servantList[i]);
    }
    this.setData({
      loadList: array
    })
    var that = this;
    setTimeout(function () {
      that.loadDataByStep(servantList, step);
    }, 100);
  }
});