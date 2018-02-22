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
  },
  onLoad: function () {
    var that = this;
    wx.setNavigationBarTitle({
      title: '英灵列表'
    });
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 5000,
      mask: true
    })
    var showType = wx.getStorageSync("showType");
    if (showType == undefined || showType == '') {
      showType = "2";
    }
    this.setData({
      showType: showType,
      showTypeTemp: showType
    })
    wx.request({
      url: app.globalData.url + '/fgo/servant/getServantList.do',
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
        setTimeout(function () {
          wx.getSystemInfo({
            success: function (res) {
              that.setData({
                pageHeight: res.windowHeight - 46,
                sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
                sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
              });
            }
          });
        }, 200);
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
      for (var j = 0; j < checkboxItems.length; j++){
        if (checkboxItems[j].checked && rarity == checkboxItems[j].value){
          temp.push(servantList[i]);
        }
      }
    }
    servantList = this.sortByCur(temp, this.data.cur);
    this.setData({
      servantList: servantList,
    });
    this.loadDataByStep(servantList, -30);
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
    var key = e.detail.value;
    var servantList = getApp().globalData.servantList;
    var temp = [];
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    for (var i = 0; i < servantList.length; i++) {
      servantList[i].flag = 0;
      if (item.indexOf(servantList[i].id) >= 0) {
        servantList[i].flag = 1;
      }
      if (servantList[i].name.indexOf(key) >= 0) {
        temp.push(servantList[i]);
      } else if (servantList[i].sex.indexOf(key) >= 0) {
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
        this.setData({
          showType: showType,
          checkboxItems: checkboxItems
        })
        this.switchServant();
        wx.setStorageSync("showType", showType);
      } else {
        var showType = this.data.showType;
        var checkboxItems = this.data.checkboxItems;
        this.setData({
          showTypeTemp: showType,
          checkboxItemsTemp: checkboxItems
        })
      }
    }
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 300, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });
    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;
    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();
    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })
    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })
      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 100)
    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
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
  }
});