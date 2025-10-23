<template>
  <div class="profile-container">
    <!-- 左侧固定导航 -->
    <div class="profile-sidebar" role="complementary">
      <!-- 用户信息卡片 -->
      <el-card class="user-card">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="showCropper = true" role="button" tabindex="0" aria-label="更换头像">
            <el-avatar :size="100" :src="userInfo.avatar" alt="用户头像"></el-avatar>
            <div class="upload-overlay" inert>
              <i class="el-icon-camera"></i>
            </div>
          </div>
        </div>
        <h3 class="username">{{ userInfo.nickname }}</h3>
        <p class="signature">{{ userInfo.signature || '这个人很懒，还没有写简介...' }}</p>

        <!-- 添加签到按钮 -->
        <div class="sign-in-section">
          <el-button type="primary" :disabled="signInStatus" @click="handleSignIn" size="small"
            :loading="signInLoading">
            <i class="el-icon-check"></i>
            {{ signInStatus ? '今日已签到' : '立即签到' }}
          </el-button>
          <div class="sign-in-stats">
            <div class="stat-item">
              <span class="label">连续签到</span>
              <span class="value">{{ signInStats.continuousDays }}天</span>
            </div>
            <div class="stat-item">
              <span class="label">累计签到</span>
              <span class="value">{{ signInStats.totalDays }}天</span>
            </div>
          </div>
        </div>

        <div class="user-stats" role="list">
          <div class="stat-item" role="listitem">
            <span class="number">{{ statistics.posts }}</span>
            <span class="label">文章</span>
          </div>
          <div class="stat-item" role="listitem">
            <span class="number">{{ statistics.followers }}</span>
            <span class="label">关注者</span>
          </div>
          <div class="stat-item" role="listitem">
            <span class="number">{{ statistics.likes }}</span>
            <span class="label">获赞</span>
          </div>
        </div>
      </el-card>

      <!-- 导航菜单 -->
      <el-menu class="nav-menu" :default-active="currentTab" @select="currentTab = $event" role="navigation">
        <el-menu-item v-for="tab in tabs" :key="tab.key" :index="tab.key" :aria-label="tab.label">
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <main class="content-area" role="main">
      <!-- 个人资料 -->
      <div v-if="currentTab === 'index'" class="content-section">
        <h2 class="section-title">个人资料</h2>
        <el-form ref="profileForm" :model="profileForm" :rules="profileRules" label-width="80px" class="profile-form"
          @submit.prevent="submitProfile">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" placeholder="请输入昵称" aria-label="昵称输入框"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="profileForm.mobile" placeholder="请输入手机号" aria-label="手机号输入框"></el-input>
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input type="textarea" v-model="profileForm.signature" :rows="4" placeholder="介绍一下自己吧..."></el-input>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="profileForm.sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
              <el-radio :label="0">保密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitProfile" :loading="loading" icon="el-icon-edit"
              size="small">保存修改</el-button>
            <el-button size="small" @click="resetProfile" icon="el-icon-refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 账号绑定 -->
      <div v-if="currentTab === 'binding'" cla1110ss="content-section">
        <h2 class="section-title">账号绑定</h2>
        <div class="binding-tips">
          <el-alert title="账号绑定提示" type="info" description="绑定第三方账号后，您可以直接使用第三方账号登录本站，还可以同步您的个人信息。" show-icon
            :closable="false">
          </el-alert>
        </div>
        <div class="binding-list">
          <div v-for="account in boundAccounts" :key="account.type">
            <el-card v-if="account.type != 'wechat'" class="binding-item">
              <div class="binding-content">
                <div class="account-info">
                  <div class="account-icon">
                    <i :class="account.icon" :style="{ color: account.color }"></i>
                  </div>
                  <div class="account-details">
                    <span class="account-name">{{ account.name }}
                    </span>
                  </div>
                </div>
                <!-- 新增区域：将账号的用户名或“未绑定账号”显示在这里 -->
                <div class="centered-content">
                  <!-- 头像部分 -->
                  <div class="account-avatar" v-if="account.isBind && account.avatar">
                    <img :src="account.avatar" alt="头像" />
                  </div>

                  <span>{{ account.type === 'email' ? (profileForm.email ? profileForm.email : '未绑定账号')
                    : (account.isBind ? account.username : '未绑定账号') }}</span>
                </div>
                <div class="binding-status">
                  <el-tag :type="account.type === 'email' ? (profileForm.email ? 'success' : 'info')
                    : (account.isBind ? 'success' : 'info')" size="small" effect="dark" class="status-tag">
                    {{ account.type === 'email' ? (profileForm.email ? '已绑定' : '未绑定')
                      : (account.isBind ? '已绑定' : '未绑定') }}
                  </el-tag>
                  <el-button :type="account.type === 'email' ? (profileForm.email ? 'danger' : 'primary')
                    : (account.isBind ? 'danger' : 'primary')" size="small" :icon="account.type === 'email' ? (profileForm.email ? 'el-icon-close' : 'el-icon-link')
                      : (account.isBind ? 'el-icon-close' : 'el-icon-link')"
                    @click="account.isBind ? unbindAccount(account.type) : bindAccount(account.type)">
                    {{ account.type === 'email' ? (profileForm.email ? '解除绑定' : '立即绑定')
                      : (account.isBind ? '解除绑定' : '立即绑定') }}
                  </el-button>
                </div>
              </div>
            </el-card>

            <!-- wechat卡片额外处理 -->
            <el-card v-if="account.type === 'wechat'" class="binding-item">
              <div class="binding-content">
                <div class="account-info">
                  <div class="account-icon">
                    <i :class="account.icon" :style="{ color: account.color }"></i>
                  </div>
                  <div class="account-details">
                    <span class="account-name">{{ account.name }}
                    </span>
                  </div>
                </div>
                <!-- 新增区域：将账号的用户名或“未绑定账号”显示在这里 -->
                <div class="centered-content">
                  <span>关注微信公众号发送"我要绑定"，绑定邮箱账户，获取更多资讯</span>
                </div>
                <div class="binding-status">
                  <el-button size="small" effect="dark" @click="refreshBindList()" :loading="isLoading">
                    <i :class="isLoading ? '' : 'fas fa-sync'" style="color: #000;"></i>
                    刷新
                  </el-button>
                  <el-button :type="account.isBind ? 'success' : 'info'" size="small"
                    :icon="account.isBind ? 'el-icon-check' : 'el-icon-close'">
                    {{ account.isBind ? '已关注并绑定' : '未绑定' }}
                  </el-button>
                </div>
              </div>

              <div align="center">
                <img src="https://minio.dejavu.zone/dejavu-blog/common/qrcode.jpg" />
              </div>

            </el-card>
          </div>
        </div>


        <!-- 编辑邮箱弹框 -->
        <el-dialog :visible.sync="showEditEmailForm" :title="profileForm.email ? '解绑邮箱' : '绑定邮箱'" width="500px"
          top="30vh" :append-to-body="true">
          <div class="apply-form">
            <el-form size="small" :model="editEmailForm" :rules="editEmailRules" ref="editEmailForm">
              <el-form-item class="form-item" prop="email">
                <el-input prefix-icon="el-icon-message" v-model="editEmailForm.email" placeholder="请输入邮箱"
                  :readonly="!!profileForm.email" />
              </el-form-item>
              <el-form-item class="form-item" prop="code">
                <el-input prefix-icon="el-icon-key" v-model="editEmailForm.code" placeholder="请输入验证码">
                  <template slot="append">
                    <el-button @click="sendEmailCode" :disabled="codeSending">
                      {{ codeButtonText }}
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item class="form-item" style="text-align: right;">
                <el-button type="primary" :loading="loading" @click="editEmail">
                  提 交
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-dialog>

      </div>






      <!-- 我的文章 -->
      <div v-if="currentTab === 'posts'" class="content-section">
        <h2 class="section-title">我的文章</h2>
        <div class="action-bar">
          <div>
            <el-input v-model="params.title" size="mini" placeholder="输入文字标题搜索文章..." prefix-icon="el-icon-search"
              style="width: 300px;margin-right: 10px"></el-input>
            <el-button type="primary" size="mini" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </div>

          <el-button type="primary" icon="el-icon-edit" size="mini" @click="$router.push('/editor')">写文章</el-button>
        </div>

        <div v-loading="loading" v-if="posts.length">
          <el-card v-for="post in posts" :key="post.id" class="post-item">
            <div class="post-content">
              <h3 class="post-title" @click="viewPost(post.id)">{{ post.title }}</h3>
              <p class="post-excerpt">{{ post.summary }}</p>
              <div class="post-meta">
                <el-tag size="small"><i class="el-icon-date"></i>{{ post.createTime }}</el-tag>
                <el-tag size="small" type="info"><i class="el-icon-view"></i>{{ post.quantity }} 阅读</el-tag>
                <el-tag size="small" type="success"><i class="el-icon-chat-line-square"></i>{{ post.commentNum || 0 }}
                  评论</el-tag>
                <el-tag size="small" type="warning"><i class="el-icon-star-off"></i>{{ post.likeNum || 0 }} 点赞</el-tag>
              </div>
            </div>
            <div class="post-actions">
              <el-button type="text" icon="el-icon-view" @click="viewPost(post.id)">查看</el-button>
              <el-button type="text" icon="el-icon-edit" @click="editPost(post.id)">编辑</el-button>
              <el-button type="text" icon="el-icon-delete" class="delete" @click="deletePost(post)">删除</el-button>
            </div>
          </el-card>

          <div class="pagination-box">
            <el-pagination background @current-change="handlePostChange" :current-page="params.pageNum"
              :page-size="params.pageSize" :total="total" layout="prev, pager, next" class="pagination"></el-pagination>
          </div>
        </div>
        <el-empty v-else description="暂无文章，快去发布你的文章吧~~"></el-empty>
      </div>

      <!-- 我的评论 -->
      <div v-if="currentTab === 'comments'" class="content-section">
        <h2 class="section-title">我的评论</h2>
        <div v-if="myComments.length" v-loading="loading">
          <el-card v-for="comment in myComments" :key="comment.id" class="comment-item">
            <div class="comment-actions">
              <p class="comment-text" v-html="parseContent(comment.content)"></p>
              <el-button type="text" icon="el-icon-delete" class="delete"
                @click="deleteComment(comment.id)">删除</el-button>
            </div>
            <div class="comment-meta">
              <el-link type="primary" @click="viewPost(comment.articleId)">文章：{{ comment.articleTitle }}</el-link>
              <el-tag size="small">
                <i class="el-icon-time"></i>
                {{ comment.createTime }}
              </el-tag>
              <el-tag size="small" type="success"><i class="el-icon-star-off"></i>{{ comment.likeCount ?
                comment.likeCount : 0 }} 赞</el-tag>
            </div>
          </el-card>
          <div class="pagination-box">
            <el-pagination background v-if="myComments.length" @current-change="handlePageChange"
              :current-page="params.pageNum" :page-size="params.pageSize" layout="prev, pager, next" :total="total">
            </el-pagination>
          </div>
        </div>
        <el-empty v-else description="暂无评论数据"></el-empty>
      </div>

      <!-- 我的回复 -->
      <div v-if="currentTab === 'replies'" class="content-section">
        <h2 class="section-title">我的回复</h2>
        <div v-if="myReplies.length" v-loading="loading">
          <el-card v-for="reply in myReplies" :key="reply.id" class="reply-item">
            <div class="reply-content">
              <div class="comment-actions">
                <p class="reply-text">
                  <el-tag size="small" type="info">回复 @{{ reply.replyNickname }}</el-tag>
                <p v-html="parseContent(reply.content)"></p>
                </p>
                <el-button type="text" icon="el-icon-delete" class="delete"
                  @click="deleteReply(reply.id)">删除</el-button>
              </div>
              <div class="reply-meta">
                <el-link type="primary" @click="viewPost(reply.articleId)">文章：{{ reply.articleTitle }}</el-link>
                <el-tag size="small">
                  <i class="el-icon-time"></i>
                  {{ reply.createTime }}
                </el-tag>
              </div>
            </div>
          </el-card>

          <div class="pagination-box">
            <el-pagination background v-if="myReplies.length" @current-change="handleReplyPageChange"
              :current-page="params.pageNum" :page-size="params.pageSize" layout="prev, pager, next" :total="total">
            </el-pagination>
          </div>
        </div>

        <el-empty v-else description="暂无回复评论数据"></el-empty>

      </div>

      <!-- 我的点赞 -->
      <div v-if="currentTab === 'likes'" class="content-section">
        <h2 class="section-title">我的点赞</h2>
        <div v-if="myLikes.length" v-loading="loading">
          <el-card v-for="like in myLikes" :key="like.id" class="like-item">
            <div class="like-content">
              <div class="comment-actions">
                <el-link class="article-title" @click="viewPost(like.id)">{{ like.title }}</el-link>
                <el-button type="text" icon="el-icon-star-off" class="delete"
                  @click="cancelLike(like.id)">取消点赞</el-button>
              </div>
              <div class="like-meta">
                <!-- <el-tag size="small"><i class="el-icon-user"></i>{{ like.author }}</el-tag> -->
                <el-tag size="small">
                  <i class="el-icon-time"></i>
                  {{ like.createTime }}
                </el-tag>
              </div>
            </div>
          </el-card>
          <div class="pagination-box">
            <el-pagination background v-if="myLikes.length" @current-change="handleLikePageChange"
              :current-page="params.pageNum" :page-size="params.pageSize" layout="prev, pager, next" :total="total">
            </el-pagination>
          </div>
        </div>

        <el-empty v-else description="暂无点赞数据"></el-empty>
      </div>

      <!-- 修改密码 -->
      <div v-if="currentTab === 'security'" class="content-section">
        <h2 class="section-title">修改密码</h2>

        <div class="binding-tips">
          <el-alert title="修改密码提示" type="info" description="只有邮箱注册/绑定邮箱的才可使用密码登录" show-icon :closable="false">
          </el-alert>
        </div>
        <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="100px"
          class="security-form">
          <el-form-item class="form-item" prop="email">
            <el-input prefix-icon="el-icon-message" v-model="passwordForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item class="form-item" prop="code">
            <el-input prefix-icon="el-icon-key" v-model="passwordForm.code" placeholder="请输入验证码">
              <template slot="append">
                <el-button @click="sendUpdatePwdEmailCode" :disabled="codeSending">
                  {{ codeButtonText }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="passwordForm.newPassword" show-password placeholder="请输入新密码"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input type="password" v-model="passwordForm.confirmPassword" show-password
              placeholder="请再次输入新密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="submitPasswordChange" icon="el-icon-edit"
              :loading="loading">确认修改</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 反馈 -->
      <div v-if="currentTab === 'feedback'" class="content-section">
        <h2 class="section-title">意见反馈</h2>
        <el-tabs>
          <el-tab-pane label="提交反馈">
            <el-form ref="feedbackForm" :model="feedbackForm" :rules="feedbackRules" label-width="100px"
              class="feedback-form">
              <el-form-item label="反馈类型" prop="type">
                <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
                  <el-option v-for="item in feedbackTypes" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="反馈内容" prop="content">
                <el-input type="textarea" v-model="feedbackForm.content" :rows="5"
                  placeholder="请详细描述您的问题或建议..."></el-input>
              </el-form-item>
              <el-form-item label="联系邮箱" prop="email">
                <el-input v-model="feedbackForm.email" placeholder="请留下您的联系邮箱，方便我们回复您"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitFeedback" icon="el-icon-check"
                  :loading="loading">提交反馈</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="我的反馈">
            <div class="feedback-list">
              <div v-loading="loading" v-if="myFeedbacks.length">
                <el-card v-for="feedback in myFeedbacks" :key="feedback.id" class="feedback-item">
                  <div class="feedback-header">
                    <div class="feedback-info">
                      <el-tag v-if="item.value === feedback.type" v-for="item in feedbackTypes" :type="item.style">
                        {{ item.label }}
                      </el-tag>
                      <span class="feedback-time">
                        <i class="far fa-clock"></i>
                        {{ feedback.createTime }}
                      </span>
                    </div>
                    <el-tag v-if="item.value === String(feedback.status)" v-for="item in feedbackStatus"
                      :type="item.style">
                      {{ item.label }}
                    </el-tag>
                  </div>
                  <div class="feedback-content">
                    <p>{{ feedback.content }}</p>
                  </div>
                  <div class="feedback-reply" v-if="feedback.replyContent">
                    <div class="reply-title">
                      <i class="el-icon-chat-line-round"></i> 管理员回复：
                    </div>
                    <p class="reply-content">{{ feedback.replyContent }}</p>
                  </div>
                </el-card>
                <div class="pagination-box" v-if="myFeedbacks.length">
                  <el-pagination background @current-change="handleFeedbackPageChange" :current-page="params.pageNum"
                    :page-size="params.pageSize" layout="prev, pager, next" :total="total">
                  </el-pagination>
                </div>
              </div>
              <el-empty v-else description="暂无反馈记录"></el-empty>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

    </main>

    <AvatarCropper :visible.sync="showCropper" :user="userInfo" @update-avatar="handleAvatarUpdate" />

  </div>
</template>

<script>
import {
  getUserInfoApi, updateProfileApi, updatePasswordByEmailApi,
  getMyCommentApi, delMyCommentApi, getMyLikeApi, getMyReplyApi, getMyFeedbackApi, addFeedbackApi,
  signInApi, getSignInStatusApi, getSignInStatsApi, getBoundAccountsApi, sendUnbindEmailCodeApi, sendBindEmailCodeApi, editEmailApi
} from '@/api/user'
import { getMyArticleApi, likeArticleApi, delArticleApi } from '@/api/article'
import { getDictDataApi } from '@/api/dict'
import { getAuthRenderApi, sendEmailCodeApi, sendUpdatePwdEmailCodeApi } from '@/api/auth'
import AvatarCropper from '@/components/common/AvatarCropper.vue'
import { setCookie } from "@/utils/cookie";
import { marked } from "marked";
export default {
  name: 'index',
  components: {
    AvatarCropper
  },
  data() {
    // 密码确认验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      userInfo: {},
      editForm: {
        username: '',
        email: '',
        signature: ''
      },
      passwordForm: {
        email: '',
        code: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      statistics: {
        posts: 0,
        likes: 0,
        followers: 0
      },
      currentTab: 'index',
      tabs: [
        { key: 'index', label: '个人资料', icon: 'fas fa-user' },
        { key: 'binding', label: '账号绑定', icon: 'fas fa-link' },
        { key: 'posts', label: '我的文章', icon: 'fas fa-file-alt' },
        { key: 'comments', label: '我的评论', icon: 'fas fa-comments' },
        { key: 'replies', label: '我的回复', icon: 'fas fa-reply' },
        { key: 'likes', label: '我的点赞', icon: 'fas fa-heart' },
        { key: 'security', label: '修改密码', icon: 'fas fa-lock' },
        { key: 'feedback', label: '反馈', icon: 'fas fa-comment-dots' }
      ],
      boundAccounts: [],

      posts: [],
      myComments: [],
      myReplies: [],
      myLikes: [],
      passwordRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
            message: '请输入有效的邮箱地址',
            trigger: 'blur'
          }
        ],
        code: [
          { required: true, message: '请输入邮箱验证码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      // 个人资料表单
      profileForm: {
        nickname: '',
        email: '',
        sex: 2,
        signature: '',
        mobile: ''
      },
      profileRules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        mobile: [
          {
            pattern: /^1[3-9]\d{9}$/, // 正则验证手机号格式
            message: '手机号格式不正确',
            trigger: 'blur'
          }
        ]
      },
      params: {
        pageNum: 1,
        pageSize: 10,
        title: '',
      },
      total: 0,
      loading: false,
      // 添加反馈列表相关数据
      feedbackTypes: [],
      feedbackStatus: [],
      feedbackForm: {
        type: '',
        content: '',
        contact: ''
      },
      myFeedbacks: [],
      feedbackRules: {
        type: [
          { required: true, message: '请选择反馈类型', trigger: 'blur' },
        ],
        content: [
          { required: true, message: '请输入反馈内容', trigger: 'blur' },
        ],
        email: [
          { required: false, message: '请输入联系邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
        ],
      },
      signInStatus: false,
      signInStats: {
        continuousDays: 0,
        totalDays: 0
      },
      signInLoading: false,
      showCropper: false,
      // 所有需要展示的绑定账号类型
      allAccountTypes: [
        'email', 'qq', 'gitee', 'github', 'wechat'
      ],
      // 映射类型信息，包括 icon 和 color 和 name
      typeMappings: {
        email: { icon: 'fas fa-envelope', color: '#007BFF', name: '邮箱' },
        qq: { icon: 'fab fa-qq', color: '#60a5fa', name: 'QQ' },
        gitee: { icon: 'fab fa-git-alt', color: '#FF0000', name: '码云' },
        github: { icon: 'fab fa-github', color: '#000000', name: 'Github' },
        wechat: { icon: 'fab fa-weixin', color: '#10b981', name: '微信公众号' }
      },
      editEmailForm: {
        email: '',
        code: '',
        isBind: true
      },
      codeButtonText: '发送验证码',
      showEditEmailForm: false,
      codeSending: false,
      isLoading: false,
      editEmailRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
            message: '请输入有效的邮箱地址',
            trigger: 'blur'
          }
        ],
        code: [
          { required: true, message: '请输入邮箱验证码', trigger: 'blur' }
        ]
      },
    }
  },

  watch: {
    // 监听路由变化，更新 currentTab
    '$route.params.currentTab'(newTab) {
      this.currentTab = newTab || 'index'; // 如果 URL 中没有 currentTab，则默认为 'index'
      this.handleTabChange(newTab);
    },

    '$store.state.userInfo': {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.$router.push('/')
        }
      },
      deep: true
    }
  },
  created() {
    // 页面初始化时，获取路由中的 currentTab 参数
    this.updateTabFromRoute();

    getUserInfoApi().then(res => {
      this.userInfo = res.data.sysUser
      Object.assign(this.profileForm, res.data.sysUser)
    })

    this.getFeedbackDict()
    // 获取签到状态和统计
    this.getSignInStatus()
    this.getSignInStats()

    //获取账号绑定信息
    this.getBoundAccounts()
  },
  methods: {
    // 从路由中获取并更新 currentTab
    updateTabFromRoute() {
      const tab = this.$route.params.currentTab || 'index'; // 默认 'index'
      this.currentTab = tab;
      this.handleTabChange(tab);
    },
    // 根据 currentTab 执行不同的业务逻辑
    handleTabChange(newTab) {
      switch (newTab) {
        case 'posts':
          this.params.pageNum = 1;
          this.getMyArticle();
          break;
        case 'comments':
          this.params.pageNum = 1;
          this.getMyComment();
          break;
        case 'replies':
          this.params.pageNum = 1;
          this.getMyReplies();
          break;
        case 'likes':
          this.params.pageNum = 1;
          this.getMyLikes();
          break;
        case 'feedback':
          this.params.pageNum = 1;
          this.getMyFeedbacks();
          break;
        default:
          break; dwada
      }
    },
    /**
     * 获取反馈类型字典
     */
    getFeedbackDict() {
      getDictDataApi(['feedback_type']).then(res => {
        this.feedbackTypes = res.data
      })

      getDictDataApi(['feedback_status']).then(res => {
        this.feedbackStatus = res.data
      })
    },
    /**
     * 获取我的评论
     */
    getMyComment() {
      this.loading = true
      getMyCommentApi(this.params).then(res => {
        this.myComments = res.data.records
        this.total = res.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 解析评论内容
     */
    parseContent(content) {
      return marked(content || "");
    },
    /**
     * 分页
     * @param val
     */
    handlePageChange(val) {
      this.params.pageNum = val
      this.getMyComment()
    },

    /**
     * 获取我的文章
     */
    getMyArticle() {
      this.loading = true
      getMyArticleApi(this.params).then(res => {
        this.posts = res.data.records
        this.total = res.data.total
      }).finally(() => {
        this.loading = false
      })
    },

    /**
     * 跳转文章详情
     * @param id
     */
    viewPost(id) {
      this.$router.push(`/post/${id}`)
    },
    /**
     * 编辑文章
     * @param id
     */
    editPost(id) {
      this.$router.push(`/editor?id=${id}`)
    },
    /**
     * 删除文章
     * @param id
     */
    deletePost(row) {
      this.$confirm(`确定要删除标题为 '${row.title}' 的文章吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delArticleApi(row.id).then(res => {
          this.$message.success('删除成功')
          this.getMyArticle()
        }).catch(err => {
          this.$message.error(err.message || '删除失败')
        })
      }).catch(() => { })
    },
    /**
     * 搜索文章
     * @param id
     */
    handleSearch() {
      this.params.pageNum = 1
      this.getMyArticle()
    },
    /**
     * 分页
     * @param val
     */
    handlePostChange(page) {
      this.params.pageNum = page
      this.getMyArticle()
    },

    refreshBindList() {
      this.isLoading = true;
      // 模拟网络请求
      setTimeout(() => {
        this.isLoading = false;
        // 更新绑定状态
        this.getBoundAccounts();
      }, 2000);
    },

    /**
     * 绑定账号
     * @param type
     */
    bindAccount(type) {
      if (type != 'email') {
        getAuthRenderApi(type).then((res) => {
          // //将当前地址存到cookie中
          // if (!window.location.href.includes("login")) {
          //   setCookie("redirectUrl", window.location.href);
          // }
          // if(window.location.href.includes("user/profile")) {
          //     setCookie("redirectUrl", window.location.href);
          // }
          window.open(res.data, "_self");
        });
        return;
      }
      //弹框
      //若type为邮箱，特别处理
      this.showEditEmailForm = true;
      // 如果已经绑定邮箱，就显示它；否则清空输入框
      this.editEmailForm.email = this.profileForm.email || '';
    },

    unbindAccount(type) {
      const account = this.boundAccounts.find(acc => acc.type === type)
      if (account) {
        this.$confirm('确定要解除绑定吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          account.isBind = false
          this.$message.success('已解除绑定')
        }).catch(() => { })
      }
    },
    /**
     * 删除评论
     */
    deleteComment(id) {
      this.$confirm('此操作会把该评论下的子评论也一并删除，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delMyCommentApi(id).then(res => {
          this.$message.success('删除成功')
          this.getMyComment()
        })
      }).catch(() => { })
    },
    /**
     * 删除回复
     */
    deleteReply(id) {
      this.$confirm('确定要删除这条回复吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delMyCommentApi(id).then(res => {
          this.$message.success('删除成功')
          this.getMyReplies()
        })
      }).catch(() => { })
    },
    /**
     * 取消点赞
     * @param id
     */
    cancelLike(id) {
      this.$confirm('确定要取消点赞吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        likeArticleApi(id).then(res => {
          this.$message.success('已取消点赞')
          this.getMyLikes()
        })
      }).catch(() => { })
    },

    /**
     * 添加反馈
     */
    submitFeedback() {
      this.$refs.feedbackForm.validate(valid => {
        if (valid) {
          this.loading = true
          addFeedbackApi(this.feedbackForm).then(res => {
            this.$message.success('感谢您的反馈！')
            this.feedbackForm = { ...{} }
          }).finally(() => {
            this.loading = false
          })
        }
      })

    },
    // 提交密码修改
    submitPasswordChange() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          this.loading = true
          updatePasswordByEmailApi(this.passwordForm).then(res => {
            this.$message.success('密码修改成功！')
            this.$refs.passwordForm.resetFields()
          }).catch(err => {
            this.$message.error(err.message)
          }).finally(() => {
            this.loading = false

          })
        }
      })
    },
    // 提交个人资料
    submitProfile() {
      this.loading = true
      updateProfileApi(this.profileForm).then(res => {
        this.userInfo.nickname = this.profileForm.nickname
        this.$store.state.userInfo.nickname = this.profileForm.nickname
        this.$message.success('个人资料更新成功！')
      }).catch(err => {
        this.$message.error(err.message)
      }).finally(() => {
        this.loading = false
      })
    },
    // 重置个人资料
    resetProfile() {
      this.profileForm = { ...{} }
    },
    /**
     * 获取我的回复
     */
    getMyReplies() {
      this.loading = true
      getMyReplyApi(this.params).then(res => {
        this.myReplies = res.data.records
        this.total = res.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 回复分页
     */
    handleReplyPageChange(val) {
      this.params.pageNum = val
      this.getMyReplies()
    },
    /**
     * 获取我的点赞
     */
    getMyLikes() {
      this.loading = true
      getMyLikeApi(this.params).then(res => {
        this.myLikes = res.data.records
        this.total = res.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 点赞分页
     */
    handleLikePageChange(val) {
      this.params.pageNum = val
      this.getMyLikes()
    },
    /**
     * 获取我的反馈列表
     */
    getMyFeedbacks() {
      this.loading = true
      let params = {
        ...this.params,
        source: 'PC'
      }
      getMyFeedbackApi(params).then(res => {
        this.myFeedbacks = res.data.records
        this.total = res.data.total
      }).finally(() => {
        this.loading = false
      })
    },

    /**
     * 反馈列表分页
     */
    handleFeedbackPageChange(val) {
      this.params.pageNum = val
      this.getMyFeedbacks()
    },
    /**
     * 获取签到状态
     */
    getSignInStatus() {
      getSignInStatusApi().then(res => {
        this.signInStatus = res.data
      })
    },

    /**
     * 获取签到统计
     */
    getSignInStats() {
      getSignInStatsApi().then(res => {
        this.signInStats = res.data
      })
    },

    /**
     * 获取账号绑定信息
     */
    getBoundAccounts() {
      getBoundAccountsApi().then(res => {
        // 将接口返回的数据映射到 boundAccounts 中
        const accounts = this.allAccountTypes.map(type => {
          // 找到接口中返回的对应账户
          const accountFromApi = res.data.find(account => account.source === type);

          // 获取映射类型的默认信息
          const accountDetails = this.typeMappings[type];

          // 如果接口没有返回这个账号的数据，就初始化为未绑定
          return {
            type,
            icon: accountDetails.icon,
            color: accountDetails.color,
            name: accountDetails.name,
            avatar: accountFromApi?.avatar || '',
            username: accountFromApi?.username || '',
            isBind: accountFromApi ? accountFromApi.isBind : false
          };
        });

        // 更新绑定账户列表
        this.boundAccounts = accounts;
      })
    },
    /**
     * 发送密码邮箱验证码
     */
    async sendVerificationCode() {

    },
    /**
    * 发送邮箱验证码
    */
    sendEmailCode() {
      if (this.codeSending) return;

      if (!this.editEmailForm.email) {
        this.$message.error("请先输入邮箱");
        return;
      }

      this.codeSending = true;
      // 开始倒计时
      let countdown = 60;
      this.codeButtonText = `${countdown}秒后重试`;

      this.codeTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(this.codeTimer);
          this.codeSending = false;
          this.codeButtonText = "发送验证码";
        } else {
          this.codeButtonText = `${countdown}秒后重试`;
        }
      }, 1000);
      //若profileForm.email 有值。 发送绑定验证码。 否则解绑验证码
      if (!this.profileForm.email) {
        this.editEmailForm.isBind = true;
        sendBindEmailCodeApi(this.editEmailForm.email)
          .then((res) => {
            this.$message.success("发送成功，请前往邮箱查看验证码");
          })
          .catch((err) => {
            this.$message.error(err.message || "发送失败");
            this.codeSending = false;
          });
        return;
      }

      this.editEmailForm.isBind = false;
      sendUnbindEmailCodeApi(this.editEmailForm.email)
        .then((res) => {
          this.$message.success("发送成功，请前往邮箱查看验证码");
        })
        .catch((err) => {
          this.$message.error(err.message || "发送失败");
          this.codeSending = false;
        });
    },



    /**
  * 发送邮箱验证码
  */
    sendUpdatePwdEmailCode() {
      if (this.codeSending) return;

      if (!this.passwordForm.email) {
        this.$message.error("请先输入邮箱");
        return;
      }

      this.codeSending = true;
      // 开始倒计时
      let countdown = 60;
      this.codeButtonText = `${countdown}秒后重试`;

      this.codeTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(this.codeTimer);
          this.codeSending = false;
          this.codeButtonText = "发送验证码";
        } else {
          this.codeButtonText = `${countdown}秒后重试`;
        }
      }, 1000);
      //发送修改密码验证码
      sendUpdatePwdEmailCodeApi(this.passwordForm.email)
        .then((res) => {
          this.$message.success("发送成功，请前往邮箱查看验证码");
        })
        .catch((err) => {
          this.$message.error(err.message || "发送失败");
          this.codeSending = false;
        });
    },



    //提交邮箱更改
    editEmail() {
      this.$refs["editEmailForm"].validate(async (valid) => {
        if (valid) {
          this.loading = true;
          try {
            await editEmailApi(this.editEmailForm);
            this.$message.success("提交成功");
            //关闭弹框. 清空form
            this.showEditEmailForm = false;
            //手动刷新数据
            if (this.editEmailForm.isBind) {
              this.profileForm.email = this.editEmailForm.email
            } else {
              this.profileForm.email = ''
            }
          } catch (error) {
            this.$message.error(error.message || "提交失败，请重试");
          } finally {
            this.loading = false;
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    /**
     * 签到
     */
    handleSignIn() {
      if (this.signInStatus.hasSignedIn) return

      this.signInLoading = true
      signInApi().then(res => {
        this.$message.success('签到成功！')
        this.getSignInStatus()
        this.getSignInStats()
      }).catch(err => {
        this.$message.error(err.message || '签到失败')
      }).finally(() => {
        this.signInLoading = false
      })
    },

    /**
     * 更新头像
     */
    handleAvatarUpdate(newAvatarUrl) {
      this.userInfo.avatar = newAvatarUrl;
    }
  }
}
</script>

<style scoped lang="scss">
:deep(input[aria-hidden=true]) {
  display: none !important;
}

.delete {
  color: red;
}

.profile-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.profile-sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
  width: 300px;
  flex-shrink: 0;


  @include responsive(sm) {
    position: unset;

    .el-dialog {
      width: 95% !important;
    }
  }
}



.user-card {
  text-align: center;
  background: var(--card-bg);
  border: var(--border-color);

  .avatar-section {
    margin-bottom: 16px;
  }

  .avatar-wrapper {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    position: relative;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;

    .upload-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;

      i {
        font-size: 24px;
        color: white;
      }
    }

    &:hover .upload-overlay {
      opacity: 1;
    }
  }

  .username {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--text-primary);
  }

  .signature {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0 0 16px;
    line-height: 1.5;
  }

  .user-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    .stat-item {
      .number {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-color);
      }

      .label {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

.el-menu-item {
  color: var(--text-secondary) !important;
}

.nav-menu {
  border-radius: 8px;
  background: var(--card-bg);
  border-right: none;
  margin-top: $spacing-md;


  .is-active {
    background: var(--hover-bg);
    color: $primary;
  }

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;

    &:hover {
      background: var(--hover-bg);
      color: $primary;
    }

    i {
      margin-right: 12px;
    }
  }
}

.content-area {
  flex: 1;
  min-width: 0;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.profile-form,
.security-form,
.feedback-form {
  max-width: 600px;
}

.post-item {
  margin-bottom: 16px;

  .post-content {
    margin-bottom: 16px;
  }

  .post-title {
    font-size: 18px;
    color: var(--text-secondary);
    margin: 0 0 12px;
    cursor: pointer;

    &:hover {
      color: $primary;
    }
  }

  .post-excerpt {
    color: var(--text-secondary);
    margin: 0 0 12px;
    line-height: 1.5;
  }

  .post-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .el-tag {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .post-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }
}

.comment-item,
.reply-item,
.like-item {
  margin-bottom: 16px;

  .comment-actions,
  .reply-actions,
  .like-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .article-title {
      font-size: 18px;
      font-weight: 700;
    }
  }

  .comment-text,
  .reply-text {
    color: var(--text-secondary);
    margin: 0 0 12px;
    line-height: 1.5;

    :deep(img) {
      max-width: 200px !important;
      max-height: 200px !important;
    }
  }

  .comment-meta,
  .reply-meta,
  .like-meta {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}



.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.binding-item {
  margin-bottom: 16px;

  .account-info {
    display: flex;
    align-items: center;
    gap: 16px;

    i {
      font-size: 24px;
      color: var(--primary-color);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
  }

  .content-area {
    padding: 16px;
  }

  .action-bar {
    .el-input {
      width: 100% !important;
    }
  }
}

.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.binding-item,
.comment-item,
.reply-item,
.like-item,
.post-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}


.binding-tips {
  margin-bottom: 24px;

  :deep(.el-alert) {
    border-radius: 8px;

    .el-alert__title {
      font-size: 15px;
      font-weight: 500;
    }

    .el-alert__description {
      margin: 8px 0 0;
      font-size: 13px;
      color: var(--text-secondary);
    }
  }
}

.binding-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;

  .binding-item {
    .binding-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
    }

    .account-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      /* 保证账号信息两侧元素分布 */
      width: 100%;
      /* 保证父容器宽度 */
    }

    .account-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--hover-bg);
      transition: all 0.3s ease;

      i {
        font-size: 24px;
        color: var(--primary-color);
      }
    }

    .account-details {
      display: flex;
      flex-direction: row;
      gap: 14px;
      align-items: center;
      /* 垂直居中对齐 */
      flex-grow: 1;
      /* 允许子元素扩展占据空间 */
    }

    .account-name {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
      /* 防止换行 */
      white-space: nowrap;
      /* 如果有溢出内容，隐藏它 */
      overflow: hidden;
      /* 用省略号显示溢出的文本 */
      text-overflow: ellipsis;
      flex-grow: 1;
      /* 让 account-name 自适应占据多余空间 */
    }

    .account-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        /* 保证头像不变形 */
      }
    }

    .account-desc {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* 新增加的区域：用于居中显示账号名或未绑定账号的提示 */
    .centered-content {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      text-align: center;
      font-size: 14px;
      /* 设置一个浅色，表示未绑定账号的状态 */
      color: #a39191;
      /* 可根据需要调整间距 */
      margin-top: 16px;
      gap: 12px;
      /* 头像与用户名之间的间距 */
    }

    .binding-status {
      display: flex;
      align-items: center;
      gap: 16px;

      .status-tag {
        min-width: 64px;
        text-align: center;
      }
    }

    &:hover {
      .account-icon {
        transform: scale(1.05);
        background: var(--primary-color);

        i {
          color: $primary;
        }
      }
    }
  }
}

.feedback-list {
  .feedback-item {
    margin-bottom: 16px;

    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .feedback-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .feedback-time {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
          font-size: 14px;

        }
      }
    }

    .feedback-content {
      color: var(--text-primary);
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .feedback-reply {
      background: var(--hover-bg);
      padding: 12px;
      border-radius: 8px;

      .reply-title {
        color: var(--text-secondary);
        font-weight: 500;
        margin-bottom: 8px;

        i {
          margin-right: 4px;
        }
      }

      .reply-content {
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
      }
    }
  }
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .write-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 4px;
    background: $primary;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      background: darken($primary, 10%);
    }

    i {
      font-size: 14px;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: var(--text-secondary);

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    margin-bottom: 24px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 24px;
    border-radius: 4px;
    background: var(--hover-bg);
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      background: var(--hover-bg-dark);
    }

    &.primary {
      background: $primary;
      color: white;

      &:hover {
        background: darken($primary, 10%);
      }
    }
  }
}

.sign-in-section {
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin: 16px 0;

  .sign-in-stats {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .label {
        font-size: 12px;
        color: var(--text-secondary);
      }

      .value {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
      }
    }
  }
}
</style>
