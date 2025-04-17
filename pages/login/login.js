// index.js
Page({
    data: {
        identityOptions: ['游客','兼职护士', '献血者', '管理员', '研究所专家'], //身份选项
        identityDict: {'兼职护士':'NURSE','献血者':'DONOR','管理员':'ADMIN','研究所专家': 'EXPERT'},
        selectedIdentity: '兼职护士', //已选身份
        selectedIdentityIndex: 0, // 选择的身份索引
        phoneNumber: '', //电话号码
        password: '', //密码
        isAgreed: false, //是否同意协议
        showIdentityDropdown: false, //默认下拉身份框不可见
        passwordVisible: false, // 默认密码不可见
    },
  //密码查看和隐藏  
  togglePasswordVisibility() {
        this.setData({
          //通过布尔变量来控制是否显示  
          passwordVisible: !this.data.passwordVisible
        });
      },
  // 点击显示下拉身份框
 toggleIdentityDropdown(e) {
    console.log('点击下拉身份选择框'); // 在控制台输出一条日志，表示函数被触发

    // 如果是关闭下拉菜单，直接设置
    if (this.data.showIdentityDropdown) {
        this.setData({
            showIdentityDropdown: false // 如果下拉菜单已经是显示状态，则将其关闭
        });
        return; // 结束函数执行
    }

    // 获取点击元素的位置信息
    const query = wx.createSelectorQuery(); // 创建一个查询对象，用于获取页面元素的位置信息
    query.select('.picker-selected').boundingClientRect(); // 查询类名为'picker-selected'的元素的位置信息
    query.exec((res) => { // 执行查询，并获取结果
        if (res && res[0]) {
            const rect = res[0]; // 获取查询结果中的第一个元素的位置信息
            this.setData({
                showIdentityDropdown: true, // 设置下拉菜单为显示状态
                dropdownStyle: `top:${rect.bottom}px; left:${rect.left}px; width:${rect.width}px;` // 设置下拉菜单的位置和宽度
                // 将下拉菜单定位到点击元素的下方，并与之宽度相同
            });
        } else {
            // 如果无法获取位置，仍然显示下拉菜单
            this.setData({
                showIdentityDropdown: true // 即使无法获取位置信息，也显示下拉菜单
            });
        }
    });
},

 // 选择身份
 selectIdentity(e) {
    console.log("aaa") //测试代码
    const index = e.currentTarget.dataset.index; //找到当前目标对象的数据集的索引
    console.log('Selected identity:', this.data.identityOptions[index]);
    this.setData({
        selectedIdentity: this.data.identityOptions[index],
        showIdentityDropdown: false //选择身份后，关闭下拉的身份选择框
    });
  },
// 点击页面其他区域关闭下拉菜单
  onTapPage() {
    if (this.data.showIdentityDropdown) {
        console.log('点击其他区域关闭下拉菜单！');
        this.setData({
            showIdentityDropdown: false
        });
    }
},
    //输入手机号码
    onPhoneNumberInput(e) {
        this.setData({
            phoneNumber: e.detail.value
        });
    },
    //输入密码
    onPasswordInput(e) {
        this.setData({
            password: e.detail.value
        });
    },

     // 同意协议
     onAgreementChange(e) {
        this.setData({
            isAgreed: !this.data.isAgreed
        });
        console.log(this.data.isAgreed)
    },

    navigateToUserService() {
        // 跳转到用户服务协议页面
        wx.navigateTo({
            url: '/pages/user-service/user-service' // 根据实际路径修改
        });
    },

    navigateToPrivacyPolicy() {
        // 跳转到隐私协议页面
        wx.navigateTo({
            url: '/pages/privacy-policy/privacy-policy' // 根据实际路径修改
        });
    },
    navigateToRegister() {
        // 跳转到隐私协议页面
        wx.redirectTo({
            url: '/pages/register/register' // 根据实际路径修改
        });
    },
    onLoginTap() {
        console.log('当前协议状态:', this.data.isAgreed);
    
        if (!this.data.isAgreed) {
            wx.showToast({
                title: '请先同意用户服务协议和隐私协议',
                icon: 'none'
            });
            return;
        }
    
        if (!this.data.phoneNumber || !this.data.password) {
            wx.showToast({
                title: '手机号或密码不能为空',
                icon: 'none'
            });
            return;
        }
    
        console.log('正在验证账号:', this.data.phoneNumber);
    
        wx.request({
            url: 'https://jobguard.online/api/auth/login', // 替换为你的后端 API 地址
            method: 'POST', //请求方式
            header: {
                // 'Authorization': '{{this.data.phoneNumber}}',
                'Content-Type': 'application/json' //请求头格式为json
            },
            //请求体
            data: {
                phone: this.data.phoneNumber,
                password: this.data.password,
                role: this.data.identityDict[this.data.selectedIdentity], //对照后端的存储表字段格式
                isAgreed: this.data.isAgreed 
            },
            success: (res) => { //请求成功回调
                console.log('后端返回:', res.data.data.token); //打印信息进行调试
                if (res.data.message=="success") {
                    wx.showToast({
                        title: '正在登录',
                        icon: 'success',
                        duration: 500,})
                    setTimeout(() => {
                        console.log("token:"+res.data.data.token)
                        //传递身份信息，为tapbar页面切换不同身份
                        wx.setStorage({
                            key: 'userIdentity',
                            data: {
                                "Identity":this.data.selectedIdentity,
                                "token": res.data.data.token
                           }
                          });
                        wx.switchTab({
                            url: '/pages/nurse/information/information'
                        });
                            }, 500);
                } else {
                    wx.showToast({
                        title: res.data.message || '账号或密码错误',
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
    }
});


