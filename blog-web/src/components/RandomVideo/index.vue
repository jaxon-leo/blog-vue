<template>
  <div class="random-video">
    <div class="random-video-btn" @click="openPlayer">
      <el-tooltip class="box-item" effect="dark" content="随机视频播放" placement="right">
        <div>
          <i class="el-icon-d-arrow-right"></i>
        </div>
      </el-tooltip>
    </div>

    <!-- PC：侧边抽屉 -->
    <el-drawer
      v-if="!isMobile"
      title="随机视频播放"
      :visible.sync="drawer"
      :with-header="false"
      direction="ltr"
      size="400px"
    >
      <div class="video-container video-drawer">
        <video ref="video" controls autoplay playsinline :src="videoSrc" @loadedmetadata="onVideoLoaded"></video>
        <div class="volume-control">
          <i :class="volumeMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'" @click="toggleMute" class="volume-icon" title="音量"></i>
          <el-slider v-model="volume" :min="0" :max="100" :show-tooltip="true" style="width: 80px" @input="onVolumeChange"></el-slider>
        </div>
      </div>
      <div class="video-actions">
        <el-button type="primary" :icon="btnIcon" size="small" @click="operateVideo">{{ btnContent }}</el-button>
        <el-button type="primary" icon="el-icon-arrow-right" size="small" @click="nextVideo">下一个视频</el-button>
      </div>
    </el-drawer>

    <!-- 移动端：全屏弹窗，避免挤压变形 -->
    <el-dialog
      v-if="isMobile"
      :visible.sync="dialogVisible"
      title="随机视频播放"
      fullscreen
      custom-class="random-video-dialog"
      @close="syncDrawerClose"
    >
      <div class="video-container video-fullscreen">
        <video ref="videoMobile" controls autoplay playsinline :src="videoSrc" @loadedmetadata="onVideoLoaded"></video>
        <div class="volume-control volume-control-mobile">
          <i :class="volumeMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'" @click="toggleMute" class="volume-icon" title="音量"></i>
          <el-slider v-model="volume" :min="0" :max="100" :show-tooltip="true" @input="onVolumeChange"></el-slider>
        </div>
      </div>
      <div class="video-actions">
        <el-button type="primary" :icon="btnIcon" size="small" @click="operateVideo">{{ btnContent }}</el-button>
        <el-button type="primary" icon="el-icon-arrow-right" size="small" @click="nextVideo">下一个视频</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const MOBILE_BREAKPOINT = 768
const DEFAULT_VOLUME = 0.3 // 默认音量 30%

export default {
  name: 'RandomVideo',
  data() {
    return {
      drawer: false,
      dialogVisible: false,
      videoSrc: 'https://api.yujn.cn/api/zzxjj.php',
      isPlaying: true,
      btnContent: '暂停',
      btnIcon: 'el-icon-video-pause',
      isMobile: false,
      volume: 30, // 0-100，默认 30%
      volumeMuted: false,
      volumeBeforeMute: 30
    }
  },
  watch: {
    drawer(val) {
      if (this.isMobile) this.dialogVisible = val
    },
    dialogVisible(val) {
      if (this.isMobile) this.drawer = val
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT
    },
    openPlayer() {
      this.drawer = true
    },
    syncDrawerClose() {
      this.drawer = false
    },
    nextVideo() {
      this.videoSrc = this.videoSrc + '?temps=' + new Date().getTime()
    },
    getVideoEl() {
      return this.isMobile ? this.$refs.videoMobile : this.$refs.video
    },
    onVideoLoaded() {
      const video = this.getVideoEl()
      if (video) {
        video.volume = DEFAULT_VOLUME
        this.volume = Math.round(DEFAULT_VOLUME * 100)
      }
    },
    onVolumeChange(val) {
      const video = this.getVideoEl()
      if (video) {
        video.volume = val / 100
        this.volumeMuted = val === 0
      }
    },
    toggleMute() {
      const video = this.getVideoEl()
      if (!video) return
      if (this.volumeMuted) {
        this.volume = this.volumeBeforeMute || 30
        video.volume = this.volume / 100
        this.volumeMuted = false
      } else {
        this.volumeBeforeMute = this.volume
        this.volume = 0
        video.volume = 0
        this.volumeMuted = true
      }
    },
    operateVideo() {
      const video = this.getVideoEl()
      if (!video) return
      if (this.isPlaying) {
        video.pause()
        this.btnContent = '播放'
        this.btnIcon = 'el-icon-video-play'
        this.isPlaying = false
      } else {
        video.play()
        this.btnContent = '暂停'
        this.btnIcon = 'el-icon-video-pause'
        this.isPlaying = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
.random-video-btn {
  position: fixed;
  left: 20px;
  bottom: 50%;
  font-size: 1.5rem;
  color: $primary;
  cursor: pointer;
}

.video-container {
  padding: $spacing-sm;
  border-radius: $border-radius-md;
  position: relative;

  video {
    display: block;
    width: 100%;
    max-width: 100%;
    border-radius: $border-radius-md;
  }

  .volume-control {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding: 8px 0;

    .volume-icon {
      font-size: 20px;
      cursor: pointer;
      color: $primary;
      flex-shrink: 0;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .volume-control-mobile {
    margin-top: 12px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;

    .volume-icon {
      font-size: 24px;
      min-width: 32px;
      text-align: center;
    }

    :deep(.el-slider) {
      flex: 1;
      min-width: 100px;
    }
  }
}

.video-drawer video {
  height: auto;
}

.video-fullscreen {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  min-height: 50vh;
  video {
    width: 100%;
    height: auto;
    max-height: 70vh;
    object-fit: contain;
  }
}

.video-actions {
  margin-left: 20px;
  margin-top: 10px;
}
</style>
