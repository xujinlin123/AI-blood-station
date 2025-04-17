
// 定义一个页面对象（小程序页面结构）
Page({
    // 页面的初始数据
    data: {
      identitySelected: "兼职护士",  // 存储用户选择的身份
      userName: "张医生",    // 默认用户名（张医生）
      userId: "MD12345",     // 默认用户ID
      userAvatar: "https://blood-station-1327665268.cos.ap-guangzhou.myqcloud.com/头像女孩.png",  // 默认头像图片路径
      showNameDialog: false, // 控制修改姓名对话框的显示
      newName: "",           // 存储临时输入的新姓名
      userPhoto: "https://blood-station-1327665268.cos.ap-guangzhou.myqcloud.com/头像女孩.png",
      hospital: '广东省中医院',
      department: '检验科',
      userID: '440xxxxxxxxxxxxxxx',
      userGender: '女',
      userCertNo: 'xxxx',
      isPageReady: false,
      userYear: '2024',
      userBlood: 'Rh阴性',
      Token: ''
    },
  
    // 生命周期方法：页面加载时执行
    onLoad: function(options) {
      this.setData({ isPageReady: false }) // 新增加载状态
  
      wx.getStorage({
        key: 'userIdentity',
        success: (res) => {
          this.setData({
            identitySelected: res.data.Identity,
            isPageReady: true, // 数据就绪后设置加载完成
            Token: res.data.token
          })
        },
        fail: () => {
          this.setData({ isPageReady: true }) // 异常情况也允许渲染
        }
      }) 
    },
  
    // 自定义方法：加载用户数据
    loadUserData: function() {
      // 从同步存储中获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {       // 如果用户信息存在
        this.setData({
          userName: userInfo.name || this.data.userName, // 更新用户名或保留默认值
          userId: userInfo.id || this.data.userId,      // 更新用户ID或保留默认值
          userRole: userInfo.role || this.data.userRole, // 更新用户角色或保留默认值
          userAvatar: userInfo.avatar || this.data.userAvatar // 更新头像或保留默认值
        });
      }
    },
  
    // 显示姓名编辑对话框
    showNameEditDialog: function() {
      this.setData({
        showNameDialog: true,     // 显示对话框
        newName: this.data.userName // 将当前用户名设为初始值
      });
    },
  
    // 隐藏姓名编辑对话框
    hideNameEditDialog: function() {
      this.setData({
        showNameDialog: false     // 隐藏对话框
      });
    },
  
    // 处理姓名输入变化
    onNameInput: function(e) {
      this.setData({
        newName: e.detail.value   // 将用户输入的新值更新到newName
      });
    },
  
    // 确认修改姓名
    confirmNameChange: function() {
      if (this.data.newName.trim()) { // 检查新姓名是否为空
        // 从存储中获取当前用户信息
        let userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.name = this.data.newName; // 更新用户信息中的姓名
        wx.setStorageSync('userInfo', userInfo); // 保存更新后的用户信息
        console.log("token:"+this.data.Token)
        wx.request({
            url: 'https://jobguard.online/api/auth/modify-name', // 替换为你的后端 API 地址
            method: 'POST', //请求方式
            header: {
                'Authorization': this.data.Token,
                'Content-Type': 'application/json' //请求头格式为json
            },
            //请求体
            data: {
                name: this.data.newName
            },
            success: (res) => { //请求成功回调
                console.log('后端返回:', res.data); //打印信息进行调试
                if (res.data.message=="success") {
                     // 显示成功提示
            wx.showToast({
                 title: '名字修改成功', // "名字修改成功"
                 icon: 'success'
                       });    
                } else {
                    wx.showToast({
                        title: res.data.message || '名字修改错误',
                        icon: 'none'
                    });
                }
            },
            //请求失败
            fail: (err) => {
                console.error('请求失败:', err);
                wx.showToast({
                    title: '网络错误，请稍后重试',
                    icon: 'none'
                });
            }
        });

        this.setData({
          userName: this.data.newName, // 更新页面显示的用户名
          showNameDialog: false       // 隐藏对话框
        });
      } else { // 如果姓名为空
        wx.showToast({
          title: '名字不能为空', // "名字不能为空"
          icon: 'error'
        });
      }
    },
  
    // 阻止事件冒泡（防止事件向上传播）
    preventBubble: function() {
      return; // 空函数，用于阻止事件
    },
  
    // 导航到“管理捐献者”页面
    navigateToManageDonors: function() {
      wx.navigateTo({
        url: '/pages/manageDonors/manageDonors' // 目标页面路径
      });
    },
  
    // 导航到“审核申请”页面
    navigateToReviewApplications: function() {
      wx.navigateTo({
        url: '/pages/reviewApplications/reviewApplications'
      });
    },
  
    // 导航到“黑名单”页面
    navigateToBlacklist: function() {
      wx.navigateTo({
        url: '/pages/blacklist/blacklist'
      });
    },
  
    // 导航到“护士认证”页面
    navigateToNurseCert: function() {
      wx.navigateTo({
        url: '/pages/nurseCert/nurseCert'
      });
    },
  
    // 导航到“捐献者认证”页面
    navigateToDonorCert: function() {
      wx.navigateTo({
        url: '/pages/donorCert/donorCert'
      });
    },
  
    // 导航到“捐献记录”页面
    navigateToDonationRecords: function() {
      wx.navigateTo({
        url: '/pages/donationRecords/donationRecords'
      });
    },
  
    // 导航到“消息”页面
    navigateToMessages: function() {
      wx.navigateTo({
        url: '/pages/messages/messages'
      });
    },
  
    // 导航到“反馈”页面
    navigateToFeedback: function() {
      wx.navigateTo({
        url: '/pages/feedback/feedback'
      });
    },
  
    // 退出登录功能
    logout: function() {
        
      wx.showModal({
        title: '提示', // "提示"
        content: '确定要退出登录吗？', // "确定要退出登录吗？"
        success: (res) => { // 用户响应后的回调
          if (res.confirm) { // 如果用户确认
            // 清除存储的用户数据
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('token');
            
            // 重定向到登录页面
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    },
  
    // 检查更新
    checkUpdate: function() {
      wx.showLoading({
        title: '检查更新中...' // "检查更新中..."
      });
      // 模拟检查更新，使用定时器
      setTimeout(() => {
        wx.hideLoading(); // 隐藏加载提示
        
        // 显示模拟结果
        wx.showModal({
          title: '版本更新', // "版本更新"
          content: '当前已是最新版本 v1.0.5', // "当前已是最新版本 v1.0.5"
          showCancel: false // 不显示取消按钮
        });
      }, 1500); // 延迟1.5秒
    },
    
    // 开始更新（模拟）
    startUpdate: function() {
      wx.showLoading({
        title: '更新中...' // "更新中..."
      });
      
      // 模拟更新过程
      setTimeout(() => {
        wx.hideLoading(); // 隐藏加载提示
        wx.showToast({
          title: '更新成功', // "更新成功"
          icon: 'success'
        });
      }, 2000); // 延迟2秒
    }
});