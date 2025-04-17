Page({
    data: {},
  
    goBack() {
      wx.navigateBack({
        delta: 1 // 返回上一级页面
      });
    }
  });
  
  