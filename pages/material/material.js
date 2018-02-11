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
    tabs: ["素材", "技能石", "棋子", "上传素材"],
    materialList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    model: 0,
    qpCount: 0,
    qpDesc: '零',
    material: {},
    uploadInfoOpen: 'N',
    uploadMatArray: [],
    keyId: '',
    uploadModel:''
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
    wx.login({
      success: function (loginCode) {
        //调用request请求api转换登录凭证  
        wx.request({
          url: app.globalData.url + '/fgo/servant/getOpenId.do?code=' + loginCode.code,
          // url: 'http://127.0.0.1/fgo/servant/getOpenId.do?code=' + loginCode.code,
          success: function (res) {
            that.setData({
              keyId: res.data.data
            })
          }
        })
      }
    })
  },
  onShow: function () {
    var that = this;
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var materialList = this.data.materialList;
    if (materialList == null || materialList == undefined || materialList.length == 0) {
      materialList = getApp().globalData.materialList;
      this.setData({
        materialList: materialList
      });
    }
    var material = wx.getStorageSync('material' + "_" + curAccId);
    var localEvent = wx.getStorageSync('envmat' + "_" + curAccId);
    for (var i = 0; i < materialList.length; i++) {
      var id = materialList[i].id + '';
      if (localEvent[id] == undefined || localEvent[id] == null) {
        localEvent[id] = 0;
      }
      if (material[id] == undefined || material[id] == null) {
        material[id] = 0;
      }
      materialList[i].count = material[id];
      materialList[i].eventCount = localEvent[id];
    }
    wx.setStorageSync('material' + "_" + curAccId, material);
    wx.setStorageSync('envmat' + "_" + curAccId, localEvent);
    var qp = material['1000'];
    if (qp == undefined || qp == null) {
      qp = 0;
    }
    var qpDesc = util.convertCount(qp);
    this.setData({
      material: material,
      materialList: materialList,
      model: wx.getStorageSync("model"),
      qpCount: qp,
      qpDesc: qpDesc
    });
    wx.request({
      url: app.globalData.url + '/fgo/img/getUploadModel.do',
      method: 'POST',
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          uploadModel: res.data.data
        });
      }
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
      material: material
    });
  },
  bindNumDelete: function (e) {
    var id = e.currentTarget.dataset.index + '';
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
    if (isNaN(count)) {
      return;
    }
    count = parseInt(count);
    if (count > 9999) {
      count = 9999;
    }
    var localEvent = wx.getStorageSync('envmat' + "_" + curAccId);
    count = count + localEvent[id];
    this.setNumToMaterial(id, count);
  },
  bindQPChange: function (e) {
    var id = e.currentTarget.dataset.index;
    var count = e.detail.value;
    if (isNaN(count)) {
      return;
    }
    count = parseInt(count);
    // if (count > 999999999){
    //   count = 999999999;
    // }
    if (count < 0) {
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
  },
  uploadImg: function () {
    wx.showToast({
      title: '请稍等',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    var that = this;
    wx.chooseImage({
      count: 5, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      fail: function () {
        wx.showToast({
          title: '未选择图片',
          icon: 'success',
          image: '/images/warning.png',
          duration: 1000
        });
      },
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        if (tempFilePaths.length > 0) {
          that.handleImg(tempFilePaths, 0);
        }
      }
    });
  },

  handleImg: function (imgFile, index) {
    if (index >= imgFile.length) {
      wx.hideToast();
      return;
    }
    wx.showToast({
      title: '上传第' + (index + 1) + "张",
      icon: 'loading',
      duration: 30000,
      mask: true
    })
    var that = this;
    var id = that.data.keyId;
    wx.uploadFile({
      url: app.globalData.url + '/fgo/img/uploadImg.do', //仅为示例，非真实的接口地址
      filePath: imgFile[index],
      name: 'file',
      formData: {
        'userId': id
      },
      fail: function () {
        wx.showToast({
          title: '请稍后再试',
          image: '/images/warning.png',
          icon: 'success',
          duration: 3000
        });
      },
      success: function (res) {
        var data = JSON.parse(res.data);
        if (data.code != '10000') {
          wx.showToast({
            title: data.msg,
            image: '/images/warning.png',
            icon: 'success',
            duration: 3000
          });
        } else {
          var uploadMatArray = that.data.uploadMatArray;
          var matInfo = data.data;
          for (var i = 0; i < matInfo.length; i++) {
            var existFlag = false;
            for (var j = 0; j < uploadMatArray.length; j++) {
              if (matInfo[i].id == uploadMatArray[j].id) {
                existFlag = true;
                uploadMatArray.splice(j, 1, matInfo[i]);
              }
            }
            if (!existFlag) {
              uploadMatArray.unshift(matInfo[i]);
            }
          }
          that.setData({
            uploadMatArray: uploadMatArray,
            uploadInfoOpen: 'N'
          })
          setTimeout(function () {
            that.handleImg(imgFile, index + 1);
          }, 1000);
        }
      }
    })
  },

  closeUploadInfo: function () {
    var flag = this.data.uploadInfoOpen == 'Y' ? 'N' : 'Y';
    this.setData({
      uploadInfoOpen: flag
    })
  },
  deleteUploadItem: function (e) {
    var id = e.currentTarget.dataset.id;
    var uploadMatArray = this.data.uploadMatArray;
    for (var j = 0; j < uploadMatArray.length; j++) {
      if (id == uploadMatArray[j].id) {
        uploadMatArray.splice(j, 1);
      }
    }
    this.setData({
      uploadMatArray: uploadMatArray
    })
  },
  syncToLocal: function () {
    var uploadMatArray = this.data.uploadMatArray;
    var material = this.data.material;
    var materialList = this.data.materialList;
    for (var j = 0; j < uploadMatArray.length; j++) {
      var id = uploadMatArray[j].id;
      for (var i = 0; i < materialList.length; i++) {
        var index = materialList[i].id;
        if (id == index) {
          materialList[i].count = uploadMatArray[j].count;
          material[id] = materialList[i].count;
        }
      }
    }
    wx.setStorageSync('material' + "_" + curAccId, material);
    this.setData({
      materialList: materialList,
      material: material,
      uploadMatArray: []
    });
    wx.showToast({
      title: '更新完成',
      icon: 'success',
      duration: 1000,
      mask: true
    })

  }
})