// pages/test/test.js
const MarkdownIt = require('../../../utils/markdown-it.js');
const md = new MarkdownIt();
Page({
    data: {
      activeTab: 'science', // 默认的功能选择
      sciencePosts: [
        {
          id: 1,
          authorName: "张医生",
          authorTitle: "血液科专家",
          authorAvatar: "https://blood-station-1327665268.cos.ap-guangzhou.myqcloud.com/头像.png", 
          title: "Rh阴性血型知识全解析",
          content: "Rh阴性血型在中国人群中的比例约为0.3%，属于稀有血型。这类献血者对医疗急救具有重要意义，特别是对于需要紧急输血的Rh阴性患者...",
          likes: 128,
          isLiked: false,
          isFavorited: false
        },
        {
          id: 2,
          authorName: "李研究员",
          authorTitle: "血液研究中心",
          authorAvatar: "https://blood-station-1327665268.cos.ap-guangzhou.myqcloud.com/头像女孩.png", 
          title: "了解稀有血型的重要性",
          content: "稀有血型捐献者是医疗体系中的宝贵资源。A型RhD阴性、B型RhD阴性、AB型RhD阴性和O型RhD阴性血型的人群在中国占比很小，但这些血型对某些特定患者的治疗至关重要...",
          likes: 85,
          isLiked: false,
          isFavorited: false
        }
      ],
      qaHistory: [],//当前对话框中的对话内容
      currentQuestion: "",//当前问题
      historyList: [], //历史列表
      showHistoryModal: false,//布尔变量用于控制列表框的显示和隐藏
      showAttachmentModal: false,
      currentChatId: null,   // 当前对话的ID
      deleSessionId: null,   //要删除的对话ID
      Token: "",
      loading: false,
      showAttachmentModal: false, // 控制附件弹窗显示
      attachedImage: null,        // 选择的图片路径
      attachedDoc: null,        // 文档附件（Word/PDF/Excel）
      showPreviewModal: false  // 控制图片放大预览弹窗显示
  // 如果需要处理其它附件，可继续添加 attachedWord、attachedPdf、attachedExcel 
    },
  
    onLoad: function() {
      wx.getStorage({
        key: 'userIdentity',
        success: (res) => {
          this.setData({
            Token: res.data.token
          })
        }
      }) 
    },
  
    // 功能栏选择功能
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({
        activeTab: tab
      });
       // 加载历史聊天记录
       this.loadChatHistory();
       // 创建新的对话
         this.newChat();
    },
  
    // 切换点赞图标
    toggleLike(e) {
      const postId = e.currentTarget.dataset.id;
      const posts = this.data.sciencePosts;
      const postIndex = posts.findIndex(post => post.id === postId);
      
      if (postIndex !== -1) {
        const isLiked = posts[postIndex].isLiked;
        
        // 切换点赞转态
        posts[postIndex].isLiked = !isLiked;
        posts[postIndex].likes = isLiked ? posts[postIndex].likes - 1 : posts[postIndex].likes + 1;
        
        this.setData({
          sciencePosts: posts
        });
      }
    },
  
    // 切换收藏图标
    toggleFavorite(e) {
      const postId = e.currentTarget.dataset.id;
      const posts = this.data.sciencePosts;
      const postIndex = posts.findIndex(post => post.id === postId);
      console.log("准备收藏")
      
      if (postIndex !== -1) {
        // 切换收藏状态
        posts[postIndex].isFavorited = !posts[postIndex].isFavorited;
        
        this.setData({
          sciencePosts: posts
        });
      }
    },
  
    // 监听输入框
    inputQuestion(e) {
      this.setData({
        currentQuestion: e.detail.value
      });
    },
 // 删除图片附件
 removeAttachedImage() {
    this.setData({ attachedImage: null });
  },
  
  // 删除文档附件
  removeAttachedDoc() {
    this.setData({ attachedDoc: null });
  },
  
  // 打开图片预览弹窗（仅图片附件支持预览）
  openPreview() {
    this.setData({ showPreviewModal: true });
  },
  
  // 关闭图片预览弹窗
  closePreview() {
    this.setData({ showPreviewModal: false });
  },
  
  // 选择图片附件（原有代码保持不变）
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          attachedImage: res.tempFilePaths[0],
          showAttachmentModal: false
        });
      },
      fail: (err) => {
        console.error('选择图片失败：', err);
        this.setData({ showAttachmentModal: false });
      }
    });
  },
  
  // 选择 Word 文档
  chooseWord() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['doc', 'docx'],
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          attachedDoc: {
            type: 'word',
            path: file.path,
            name: file.name || 'Word文档'
          },
          showAttachmentModal: false
        });
      },
      fail: (err) => {
        console.error('选择Word文档失败：', err);
        this.setData({ showAttachmentModal: false });
      }
    });
  },
  
  // 选择 PDF 文档
  choosePdf() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf'],
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          attachedDoc: {
            type: 'pdf',
            path: file.path,
            name: file.name || 'PDF文档'
          },
          showAttachmentModal: false
        });
      },
      fail: (err) => {
        console.error('选择PDF文档失败：', err);
        this.setData({ showAttachmentModal: false });
      }
    });
  },
  
  // 选择 Excel 表格
  chooseExcel() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xls', 'xlsx'],
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          attachedDoc: {
            type: 'excel',
            path: file.path,
            name: file.name || 'Excel表格'
          },
          showAttachmentModal: false
        });
      },
      fail: (err) => {
        console.error('选择Excel表格失败：', err);
        this.setData({ showAttachmentModal: false });
      }
    });
  },
  
  // 发送问题，并根据附件情况调用不同的请求逻辑
  sendQuestion() {
    let question = this.data.currentQuestion.trim();
    const { attachedImage, attachedDoc } = this.data;
    
    // 如果存在附件但文本为空，设定默认文本
    if ((attachedImage || attachedDoc) && !question) {
      question = "附件内容是什么？";
    }
    if (!question && !attachedImage && !attachedDoc) {
      return; // 无文字也无附件则不提交
    }
    
    const qaHistory = this.data.qaHistory;
    // 添加用户问题记录，同时保存附件信息（如果有）
    qaHistory.push({
      role: 'user',
      content: question,
      attachment: attachedImage
        ? { type: 'image', path: attachedImage }
        : attachedDoc
          ? { type: attachedDoc.type, path: attachedDoc.path, name: attachedDoc.name }
          : null
    });
    // 清空输入和附件
    this.setData({ qaHistory, currentQuestion: "", attachedImage: null, attachedDoc: null });
    this.saveChatHistory();
    
    // 添加空的 AI 回复并启动 loading 状态
    const aiReply = { role: 'ai', content: '', htmlContent: '' };
    qaHistory.push(aiReply);
    this.setData({ qaHistory, loading: true });
    
    // 如果有图片附件，则按原有图片处理逻辑调用接口
    if (attachedImage) {
      wx.getFileSystemManager().readFile({
        filePath: attachedImage,
        encoding: 'base64',
        success: (res) => {
          const base64Image = res.data;
          const payload = {
            model: "glm-4v",
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'image_url', image_url: { url: base64Image } },
                  { type: 'text', text: question + " 字数限定于200字" }
                ]
              }
            ]
          };
          wx.request({
            url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer bd62dc89ee6a1c34f3c72dfac96f58a5.2GA3Q4wOK7GUaC7f'  
            },
            data: JSON.stringify(payload),
            success: (res) => {
              this.processAiResponse(res.data, aiReply);
            },
            fail: (err) => {
              console.error('图片处理请求错误:', err);
              this.setData({ loading: false });
            }
          });
        },
        fail: (err) => {
          console.error("读取图片失败:", err);
          this.setData({ loading: false });
        }
      });
    } else if (attachedDoc) {
        console.log("已成功读取附件/word/pdf/excel");
        
        // 定义 MIME 类型映射，确保在读取文档附件时可以根据类型构造正确的 data URL
        const mimeMapping = {
          word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // 对于 docx 文件
          pdf: "application/pdf",
          excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // 对于 xlsx 文件
        };
    
        // 处理文档附件：读取文档内容，转换成 Base64，然后构造 payload 提交给 GLM‑4
        wx.getFileSystemManager().readFile({
          filePath: attachedDoc.path,
          encoding: 'base64',
          success: (res) => {
            console.log("成功将文档转换为Base64");
            const base64Doc = res.data;
            // 根据附件类型确定 MIME 类型，如果找不到则使用 application/octet-stream
            const mimeType = mimeMapping[attachedDoc.type] || "application/octet-stream";
            // 构造 data URL
            const dataUrl = "data:" + mimeType + ";base64," + base64Doc;
            const payload = {
              model: "glm-4",
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'file',
                      file_url: {
                        url: dataUrl
                      }
                    },
                    { type: 'text', text: question + " 最长回答限定于350字" }
                  ]
                }
              ]
            };
            wx.request({
              url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
              method: 'POST',
              header: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer bd62dc89ee6a1c34f3c72dfac96f58a5.2GA3Q4wOK7GUaC7f'  
              },
              data: JSON.stringify(payload),
              success: (res) => {
                console.log("打印文档请求结果");
                console.log(res.data);
                this.processAiResponse(res.data, aiReply);
              },
              fail: (error) => {
                console.error('请求错误:', error);
                this.setData({ loading: false });
              }
            });
          },
          fail: (err) => {
            console.error("读取文档失败:", err);
            this.setData({ loading: false });
          }
        });
      }
       else {
      // 如果没有图片或文档附件，则使用原有文本请求逻辑
      wx.request({
        url: 'https://jobguard.online/api/ai/stream-chat',
        method: 'POST',
        header: {
          'Authorization': this.data.Token,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({ input: question + "最长回答限定于350字", sessionId: this.data.currentChatId }),
        success: (res) => {
          if (res.data) {
            this.processAiResponse(res.data, aiReply);
          }
        },
        fail: (error) => {
          console.error('请求错误:', error);
          this.setData({ loading: false });
        }
      });
    }
  },
  
  
  // 处理 AI 回复（原有逻辑）
  processAiResponse(responseData, aiReply) {
    let text = "";
    const qaHistory = this.data.qaHistory;
    if (typeof responseData === "string") {
      text = responseData;
    } else if (typeof responseData === "object") {
      if (
        responseData.choices &&
        responseData.choices[0] &&
        responseData.choices[0].message &&
        responseData.choices[0].message.content
      ) {
        text = responseData.choices[0].message.content;
      } else {
        text = JSON.stringify(responseData);
      }
    }
    
    const lines = text.split('\n');
    const processedContent = lines
      .map(line => line.replace(/^data:/, '').trim())
      .filter(line => line.length > 0)
      .join('');
    
    let currentText = '';
    const typeText = (text, index = 0) => {
      if (index < text.length) {
        currentText += text[index];
        aiReply.content = currentText;
        this.setData({ qaHistory }, () => {
          this.scrollToBottom();
        });
        setTimeout(() => typeText(text, index + 1), 10);
      } else {
        aiReply.htmlContent = md.render(currentText);
        this.setData({ qaHistory, loading: false });
      }
    };
    typeText(processedContent);
    this.saveChatHistory();
  },
  
    // 滚动到底部
    scrollToBottom() {
        wx.createSelectorQuery()
          .select('.qa-history') //选择类
          .boundingClientRect(rect => {
            if (rect) {
              this.setData({
                scrollTop: rect.height // 让滚动高度等于内容高度
              });
            }
          })
          .exec();
      },
    
    // 创建新对话
    newChat() {
      // 保存当前对话到历史记录
      if (this.data.qaHistory.length > 0) {
        this.saveChatHistory();
      }
      
      // 请求后端创建新的会话ID
      wx.request({
        url: 'https://jobguard.online/api/ai/create-session',
        method: 'POST',
        header:{
            'Authorization': this.data.Token,
            'Content-Type': 'application/json' //请求头格式为json
        },
        success: (res) => {
          console.log("打印创建新对话框res.data")  
          console.log(res.data)  
          if (res.data) {
            // 设置新的会话ID和清空对话历史
            console.log("新的对话框ID")
            console.log(res.data.data)
            this.setData({
              qaHistory: [], // 清空历史
              currentChatId: res.data.data // 新的会话ID
            });
            console.log("currentChatId")
            console.log(this.data.currentChatId)
          }
        },
        fail: (err) => {
          console.error('创建新会话失败:', err);
        }
      });
    },
    
    // 保存对话历史
    saveChatHistory() {
      if (this.data.qaHistory.length === 0) return;
      
      // 获取已有的历史记录
      const chatHistory = wx.getStorageSync('chatHistory') || [];
      
      // 检查当前对话ID是否已存在
      const existingIndex = chatHistory.findIndex(item => item.id === this.data.currentChatId);
      
      // 准备要保存的对话数据
      const firstQuestion = this.data.qaHistory.find(msg => msg.role === 'user')?.content || '';
      const title = firstQuestion.length > 5 ? firstQuestion.substring(0, 5) + '...' : firstQuestion;
      
      const chatData = {
        id: this.data.currentChatId,
        title: title,
        date: this.formatDate(new Date()),
        messages: this.data.qaHistory,
        timestamp: Date.now()
      };
      
      // 更新或添加对话记录
      if (existingIndex !== -1) {
        chatHistory[existingIndex] = chatData;
      } else {
        chatHistory.unshift(chatData); // 添加到开头
      }
      
      // 保存到本地存储
      wx.setStorageSync('chatHistory', chatHistory);
      
      // 更新历史列表
      this.loadChatHistory();
    },
    
    // 加载历史聊天记录
    loadChatHistory() {
      const chatHistory = wx.getStorageSync('chatHistory') || [];
      this.setData({
        historyList: chatHistory
      });
    },
    
    // 打开历史记录弹窗
    viewHistory() {
      // 刷新历史记录列表
      this.loadChatHistory();
      this.setData({
        showHistoryModal: true
      });
    },
    
    // 关闭历史记录弹窗
    closeHistory() {
      this.setData({
        showHistoryModal: false
      });
    },
    
    // 加载指定的历史对话
    loadHistoryChat(e) {
        const chatId = e.currentTarget.dataset.id;
        const chatHistory = wx.getStorageSync('chatHistory') || [];
        const chat = chatHistory.find(item => item.id === chatId);
        
        if (chat) {
          this.setData({
            qaHistory: chat.messages,
            currentChatId: chatId,
            showHistoryModal: false
          }, () => {
            // 在 setData 回调中执行滚动，确保数据已渲染
            this.scrollToBottom();
          });
        }
      },
    
    // 添加附件功能（占位）
    /*addAttachment() {
      wx.showToast({
        title: '附件功能暂未实现',
        icon: 'none'
      });
    },*/
    // 打开附件弹窗
addAttachment() {
    this.setData({
      showAttachmentModal: true
    });
  },
  // 关闭附件弹窗
  closeAttachmentModal() {
    this.setData({
      showAttachmentModal: false
    });
  },
  // 选择图片：调用微信选择图片 API
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: (res) => {
        // 假设只选择一张图片
        this.setData({
          attachedImage: res.tempFilePaths[0],
          showAttachmentModal: false
        });
      },
      fail: (err) => {
        console.error('选择图片失败：', err);
        this.setData({ showAttachmentModal: false });
      }
    });
  },
  
    
    // 格式化日期: YYYY-MM-DD
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    // 删除历史对话项
deleteHistoryItem(e) {
    // 阻止事件冒泡，避免触发 loadHistoryChat
    e.stopPropagation && e.stopPropagation();
    const chatId = e.currentTarget.dataset.id;//获取点击的对话项的ID
    
    wx.showModal({
      title: '提示',
      content: '是否确定删除该对话？',
      success: (res) => {
        if (res.confirm) {
          // 从本地存储中移除该对话项
          let chatHistory = wx.getStorageSync('chatHistory') || [];
          chatHistory = chatHistory.filter(item => item.id !== chatId);
          wx.setStorageSync('chatHistory', chatHistory);
          this.setData({
            historyList: chatHistory
          });
          console.log("点击后的对话项ID")
          console.log(chatId)
          // 向后端发送删除会话的请求
          wx.request({
            url: `https://jobguard.online/api/ai/delete-session?sessionId=${chatId}`,
            method: 'POST',
            header: {
              'Authorization': this.data.Token,
              'Content-Type': 'application/json'
            },
            success: (res) => {
              console.log('删除对话成功:', res);
            },
            fail: (err) => {
              console.error('删除对话请求失败:', err);
            }
          });
        }
      }
    });
  }
  
  });