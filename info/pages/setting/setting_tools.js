// pages/setting/setting_tools.js
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var curAccId = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["素材效率", "FREE本配置"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    model: getApp().globalData.model,
    materialList: [{ matId: 0, name: '点击选择素材', count: 0 }, { matId: 0, name: '点击选择素材', count: 0 }],
    multiArray: [['铜素材', '银素材', '金素材', '技能石', '棋子'], []],
    multiIndex: [0, 0],
    allMaterialList: [],
    dropList: [],
    mapList: [],
    multiArray2: [['训练场', 'FREE本'], [], ['请选择']],
    multiIndex2: [0, 0, 0],
    chooseIndex2: [0, 0, 0],
    chooseMap: "请选择",
    curMap:[],
    mapDropList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "掉率速查"//页面标题为路由参数
    });
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          model: getApp().globalData.model
        });
      }
    });
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var dropModel = wx.getStorageSync("dropModel_" + curAccId);
    if (dropModel == undefined || dropModel == '') {
      dropModel = 1;
    }
    wx.request({
      url: getApp().globalData.url + '/material/getMapList.do?model=' + dropModel,
      method: 'GET',
      success: function (res) {
        that.setData({
          mapList: res.data.data
        })
        that.initmultiArrayMap();
      }
    });
    setTimeout(function () {
      var allMaterialList = getApp().globalData.materialList;
      var array = [];
      for (var i = 0; i < allMaterialList.length; i++) {
        if (allMaterialList[i].id > 2100 && allMaterialList[i].id < 2200 ) {
          array.push(allMaterialList[i].name);
        }
      }
      var multiArray = that.data.multiArray;
      multiArray[1] = array;
      that.setData({
        allMaterialList: allMaterialList,
        multiArray: multiArray
      })
    }, 2000);

  },

  initmultiArrayMap: function () {
    var mapList = this.data.mapList;
    var array1 = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    var array2 = ["弓初(周一)", "弓中(周一)", "弓上(周一)", "弓超(周一)"];
    var multiArray2 = this.data.multiArray2;
    multiArray2[1] = array1;
    multiArray2[2] = array2;
    this.setData({
      multiArray2: multiArray2
    })
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  bindMultiPickerChange: function (e) {
    var index = e.target.dataset.id;
    var value = e.detail.value;
    var materialList = this.data.materialList;
    materialList[index].name = this.data.multiArray[1][value[1]];
    this.setData({
      materialList: materialList
    })
  },

  bindMultiPickerColumnChange: function (e) {
    if (e.detail.column == 1) return;
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    var allMaterialList = this.data.allMaterialList;
    var targetArr = [];
    for (var i = 0; i < allMaterialList.length; i++) {
      if ((e.detail.value == 0 && allMaterialList[i].id > 2100 && allMaterialList[i].id < 2200)
        || (e.detail.value == 1 && allMaterialList[i].id > 2200 && allMaterialList[i].id < 2300)
        || (e.detail.value == 2 && allMaterialList[i].id > 2300 && allMaterialList[i].id < 2400)
        || (e.detail.value == 3 && '1' == allMaterialList[i].type)
        || (e.detail.value == 4 && '3' == allMaterialList[i].type)) {
        targetArr.push(allMaterialList[i].name);
      }
    }
    data.multiArray[1] = targetArr;
    data.multiIndex[1] = 0;
    this.setData({
      multiArray: data.multiArray,
      multiIndex: data.multiIndex
    });
  },

  bindMultiPickerChange2: function (e) {
    var value = e.detail.value;
    var desc = "";
    if (value[0] == 0) {
      desc = this.data.multiArray2[2][value[2]];
    } else {
      desc = this.data.multiArray2[1][value[1]] + "-" + this.data.multiArray2[2][value[2]];
    }
    this.setData({
      chooseMap: desc
    })
    this.initMapDesc();
  },

  initMapDesc: function(){
    var mapId = -1;
    var mapName = this.data.chooseMap;
    var mapList = this.data.mapList;
    for (var i = 0; i < mapList.length; i++) {
      if (mapList[i].name == mapName){
        mapId = mapList[i].id;
        var array = [];
        if (mapList[i].stage1 != ''){
          array.push(mapList[i].stage1);
        }
        if (mapList[i].stage2 != '') {
          array.push(mapList[i].stage2);
        }
        if (mapList[i].stage3 != '') {
          array.push(mapList[i].stage3);
        }
        mapList[i].stage = array;
        this.setData({
          curMap: [mapList[i]]
        })
        break;
      }
    }
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/material/getMapDropList.do?mapId='+mapId,
      method: 'GET',
      success: function (res) {
        that.setData({
          mapDropList: res.data.data
        })
      }
    });
  },

  bindMultiPickerColumnChange2: function (e) {
    if (e.detail.column == 2) return;
    var data = {
      multiArray: this.data.multiArray2,
      multiIndex: this.data.multiIndex2
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    if (e.detail.column == 0) {
      data.multiIndex[1] = 0;
      data.multiIndex[2] = 0;
      if (e.detail.value == 0) {
        data.multiArray[1] = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        data.multiArray[2] = ["弓初(周一)", "弓中(周一)", "弓上(周一)", "弓超(周一)"];
      } else {
        var mapList = this.data.mapList;
        var array = [];
        var array2 = [];
        for (var i = 0; i < mapList.length; i++) {
          if (mapList[i].type == 'FREE') {
            var mapName = mapList[i].name.split("-")[0];
            if (array.indexOf(mapName) < 0) {
              array.push(mapName);
            }
          }
        }
        for (var i = 0; i < mapList.length; i++) {
          if (mapList[i].type == 'FREE' && mapList[i].name.indexOf(array[0]) >= 0) {
            var mapName = mapList[i].name.split("-")[1];
            array2.push(mapName);
          }
        }
        data.multiArray[1] = array;
        data.multiArray[2] = array2;
      }
    } else if (e.detail.column == 1) {
      var mapList = this.data.mapList;
      var array = [];
      if (data.multiIndex[0] == 0) {
        for (var i = 0; i < mapList.length; i++) {
          if (mapList[i].type == 'TRAIN' && mapList[i].name.indexOf(data.multiArray[1][e.detail.value]) >= 0) {
            var mapName = mapList[i].name;
            array.push(mapName);
          }
        }
      } else if (data.multiIndex[0] == 1) {
        for (var i = 0; i < mapList.length; i++) {
          if (mapList[i].type == 'FREE' && mapList[i].name.indexOf(data.multiArray[1][e.detail.value]) >= 0) {
            var mapName = mapList[i].name.split("-")[1];
            array.push(mapName);
          }
        }
      }
      data.multiArray[2] = array;
    }
    this.setData({
      multiArray2: data.multiArray,
      multiIndex2: data.multiIndex
    });
  },

  inputChange: function (e) {
    var index = e.target.dataset.id;
    var value = e.detail.value;
    var materialList = this.data.materialList;
    materialList[index].count = value;
    this.setData({
      materialList: materialList
    })
  },

  addMaterial: function () {
    var materialList = this.data.materialList;
    materialList.push({ matId: 0, name: '点击选择素材', count: 0 });
    this.setData({
      materialList: materialList
    })
  },

  deleteMaterial: function (e) {
    var index = e.target.dataset.id;
    var materialList = this.data.materialList;
    materialList.splice(index, 1);
    this.setData({
      materialList: materialList
    })
  },

  queryRoute: function () {
    var that = this;
    var materialList = this.data.materialList;
    var dropModel = wx.getStorageSync("dropModel_" + curAccId);
    if (dropModel == undefined || dropModel == '') {
      dropModel = 1;
    }
    var param = '';
    for (var i = 0; i < materialList.length; i++) {
      var matId = this.getMaterialId(materialList[i].name, this.data.allMaterialList);
      if (matId > 0 && materialList[i].count > 0) {
        param += matId + "_" + materialList[i].count + "%5E";
      }
    }
    if (param == '') {
      wx.showToast({
        title: '无效素材',
        icon: 'success',
        image: '/images/warning.png',
        duration: 1000
      });
      return;
    }
    wx.showToast({
      title: '查询中...',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    wx.request({
      url: getApp().globalData.url + "/material/calculateRoute.do?model=" + dropModel + "&param=" + param,
      method: "GET",
      complete: function (res) {
        wx.hideToast();
      },
      success: function (res) {
        that.setData({
          dropList: res.data.data,
        })
      }
    })

  },

  getMaterialId: function (name, allMaterial) {
    var id = -1;
    for (var i = 0; i < allMaterial.length; i++) {
      if (allMaterial[i].name == name) {
        id = allMaterial[i].id;
        break;
      }
    }
    return id;
  },

  showMapDetail: function(e){
    var name = e.currentTarget.dataset.id;
    this.setData({
      chooseMap: name,
      activeIndex: 1,
      sliderOffset: 188
    })
    this.initMapDesc();
  }
})