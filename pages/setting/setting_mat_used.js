var flag_hd = true;
var curAccId = 1;
var app = getApp();
Page({
  data: {
    pageWidth: 300,
    model: 0,
    materialData: {},
    pageHeight: 400,
    url: '',
    modelArray: [],
    showModalStatus: false,
    reqCount: 0,
    height:300,
    imgPath:'',
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '素材消耗详情'
    });
    this.setData({
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
    var mat = options.mat;
    if (mat == undefined) {
      this.calculate();
    }else{
      this.setData({
        materialData: JSON.parse(mat),
      })
    }
  },

  calculate: function () {
    var that = this;
    var servantList = wx.getStorageSync('srv_list' + "_" + curAccId);
    var skillList = wx.getStorageSync('srvSkill' + "_" + curAccId);
    var infoArray = [];
    for (var i = 0; i < servantList.length; i++) {
      var servant = new Object;
      servant.servantId = servantList[i];
      var id = servantList[i] + "";
      if (skillList[id] == undefined) {
        skillList[id] = [0, 1, 1, 1];
      }
      servant.rank = "0_" + skillList[id][0];
      servant.skill1 = "1_" + skillList[id][1];
      servant.skill2 = "1_" + skillList[id][2];
      servant.skill3 = "1_" + skillList[id][3];
      servant.clothFlag = 'N';
      infoArray.push(servant);
    }
    infoArray.sort(function (a, b) {
      return a.servantId < b.servantId ? -1 : 1;
    })
    var dropModel = wx.getStorageSync("dropModel_" + curAccId);
    if (dropModel == undefined || dropModel == ''){
      dropModel = 1;
    }
    var routInfo = { "param": infoArray, "ownCount": wx.getStorageSync('material' + "_" + curAccId),"model":dropModel };
    wx.showToast({
      title: '计算中...',
      icon: 'loading',
      duration: 3000,
      mask: true
    })
    wx.request({
      url: app.globalData.url + "/fgo/material/calculateServantMaterial.do",
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: routInfo,
      complete: function (res) {
        wx.hideToast();
      },
      success: function (res) {
        var materialData = res.data.data;
        var array1 = [];
        var array2 = [];
        var array3 = [];
        for (var i = 0; i < materialData.material.length; i++) {
          var id = materialData.material[i].type;
          if (id == '1') {
            array1.push(materialData.material[i]);
          } else if (id == '2') {
            array2.push(materialData.material[i]);
          } else if (id == '3') {
            array3.push(materialData.material[i]);
          }
        }
        materialData.material1 = array1;
        materialData.material2 = array2;
        materialData.material3 = array3;
        var height = Math.ceil(array1.length / 5) + Math.ceil(array2.length / 5) + Math.ceil(array3.length / 5) + 1;
        that.setData({
          materialData: res.data.data,
          height: height*55+20
        })
        // that.drawImg(materialData);
      }
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    var id = e.currentTarget.dataset.index + '';
    var reqCount = e.currentTarget.dataset.count;
    var array = this.data.materialData.servantReqList[id];
    this.setData({
      reqCount: reqCount,
      modelArray: array
    })
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 100, //动画时长 
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
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    var url = 'pages/setting/setting_mat_used?mat=' + JSON.stringify(this.data.materialData);
    return {
      path: url,
    }
  },
  // drawImg(materialData){
  //   var that = this;
  //   var ctx = wx.createCanvasContext("accountInfo", this);
  //   ctx.drawImage("/images/qb.jpg",20,10,50,50);
  //   ctx.setFontSize(15);
  //   ctx.fillText(' *' + materialData.qp, 70, 30);
  //   ctx.fillText('【' +materialData.qpStr+'】', 70, 50);
  //   var width = this.data.pageWidth;
  //   var split = (width - 300)/4;
    
  //   var matArray = [];
  //   matArray.push(materialData.material2);
  //   matArray.push(materialData.material1);
  //   matArray.push(materialData.material3);
  //   ctx.setFillStyle("white");
  //   ctx.setShadow(1, 1, 1, 'black');

  //   var curTop = 0;
  //   for(var index = 0; index < matArray.length; index++){
  //     var mat = matArray[index];
  //     var top = 0;
  //     for (var i = 0; i < mat.length; i++) {
  //       var left = i % 5 * (50 + split) + 20;
  //       top = curTop + (parseInt(i / 5) + 1) * 55 + 5;
  //       ctx.drawImage(mat[i].imgPath, left, top, 50, 50);
  //       ctx.fillText(mat[i].count, left, top + 45);
  //     }
  //     curTop = top;
  //   }
  //   ctx.draw(false);
  //   setTimeout(function(){
  //     wx.canvasToTempFilePath({
  //       canvasId: 'accountInfo',
  //       success: function (res) {
  //         console.log(res.tempFilePath);
  //         that.setData({
  //           imgPath: res.tempFilePath
  //         });
  //       }
  //     })
  //   },1000);
  // }
});