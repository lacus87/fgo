// pages/setting/setting_help.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "使用帮助"//页面标题为路由参数
    });
    var array = this.data.questions;
    if (array.length == 0) {
      array.push({ "id": 1, name: "选择自己的英灵",show:0});
      array.push({ "id": 2, name: "设置英灵的技能等级", show: 0 });
      array.push({ "id": 3, name: "查看英灵的升级材料", show: 0 });
      array.push({ "id": 4, name: "设置素材数量", show: 0 });
      array.push({ "id": 5, name: "查看素材掉落/需求英灵", show: 0 });
      array.push({ "id": 6, name: "查看活动内容", show: 0 });
      array.push({ "id": 7, name: "查看无限池活动", show: 0 });
      array.push({ "id": 8, name: "设置账号信息", show: 0 });
      array.push({ "id": 9, name: "规划英灵升级", show: 0 });
      array.push({ "id": 10, name: "查看规划结果", show: 0 });
      array.push({ "id": 11, name: "宝具伤害计算", show: 0 });

      this.setData({
        questions: array,
        model: wx.getStorageSync("model")
      })
    }
  },
  showDetail: function (e) {
    var id = e.currentTarget.dataset.index;
    var eventList = this.data.questions;
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].id == id) {
        eventList[i].show = eventList[i].show == 0 ? 1 : 0;
      } else {
        eventList[i].show = 0;
      }
    }
    this.setData({
      questions: eventList
    });
  },
})