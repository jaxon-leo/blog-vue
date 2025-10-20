<template>
    <div class="random-video">
        <div class="random-video-btn">
            <el-tooltip class="box-item" effect="dark" content="随机视频播放" placement="right">
                <div @click="drawer = true">
                    <i class="el-icon-d-arrow-right"></i>
                </div>
            </el-tooltip>
        </div>

        <el-drawer draggable="true" title="随机视频播放" :visible.sync="drawer" :with-header="false">
            <div class="video-container">
                <video ref="video" style="width: 100%" controls autoplay :src="videoSrc"></video>
            </div>
            <div style="margin-left: 20px; margin-top: 10px">
                <el-button type="primary" :icon="btnIcon" size="small" @click="operateVideo">
                    {{ btnContent }}
                </el-button>
                <el-button type="primary" icon="el-icon-arrow-right" size="small" @click="nextVideo">下一个视屏</el-button>
            </div>
        </el-drawer>
    </div>
</template>

<script>
export default {
    name: 'RandomVideo',
    data() {
        return {
            drawer: false,
            videoSrc: 'https://api.yujn.cn/api/zzxjj.php',
            isPlaying: true,
            btnContent: '暂停',
            btnIcon: 'el-icon-video-pause'
        }
    },
    methods: {
        //切换视频
        nextVideo() {
            this.videoSrc = this.videoSrc + "?temps=" + new Date().getTime();
        },
        //暂停和开启视频
        operateVideo() {
            if (this.isPlaying) {
                this.$refs.video.pause();
                this.btnContent = '播放';
                this.btnIcon = 'el-icon-video-play';
                this.isPlaying = false;
            } else {
                this.$refs.video.play();
                this.btnContent = '暂停';
                this.btnIcon = 'el-icon-video-pause';
                this.isPlaying = true;
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
    z-index: 999;
}

.video-container {
    padding: 0;
    border-radius: 0;
    width: 100%;
    height: 100%;
    /* 视频容器全屏 */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
}

.video-container video {
    border-radius: 0;
    max-width: 100%;
    max-height: 100%;
}

.button-group {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .random-video-btn {
        left: 10px;
        bottom: 20px;
        font-size: 1.2rem;
    }

    .video-container {
        padding: 0;
        height: 100vh;
        /* 满屏高度 */
        width: 100vw;
        /* 满屏宽度 */
    }

    .button-group {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        flex-direction: column;
        gap: 15px;
    }

    /* 调整 el-drawer 抽屉的样式 */
    .el-drawer {
        width: 100vw;
        /* 全屏宽度 */
        height: 100vh;
        /* 全屏高度 */
        padding: 0;
        box-shadow: none;
        /* 去掉阴影 */
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
    }

    .el-drawer__wrapper {
        height: 100vh;
        /* 保证 wrapper 高度为全屏 */
    }
}
</style>
