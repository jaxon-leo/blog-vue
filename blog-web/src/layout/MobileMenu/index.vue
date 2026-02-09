<template>
  <el-drawer
    :visible.sync="visible"
    direction="ltr"
    :with-header="false"
    size="85%"
    custom-class="mobile-menu-drawer"
  >
    <div class="mobile-menu">
      <div class="menu-header">
        <img :src="$store.state.webSiteInfo.logo" alt="logo" class="logo">
        <h2 class="site-name">{{ $store.state.webSiteInfo.name }}</h2>
      </div>
      <div class="menu-content">
        <template v-for="item in menuItems">
          <!-- 有子菜单：全宽展开显示所有子项 -->
          <div v-if="item.children && item.children.length" :key="item.path" class="menu-group">
            <div class="menu-group-title">
              <i :class="item.icon"></i>
              <span>{{ item.name }}</span>
            </div>
            <template v-for="child in item.children">
              <a
                v-if="child.external"
                :key="child.path + '_ext'"
                href="javascript:void(0)"
                class="menu-item menu-item-child"
                @click="handleItemClick(child)"
              >
                <i :class="child.icon"></i>
                <span>{{ child.name }}</span>
              </a>
              <router-link
                v-else
                :key="child.path"
                :to="child.path"
                class="menu-item menu-item-child"
                :class="{ active: $route.path === child.path }"
                @click.native="closeMenu"
              >
                <i :class="child.icon"></i>
                <span>{{ child.name }}</span>
              </router-link>
            </template>
          </div>
          <!-- 无子菜单：单行链接 -->
          <router-link
            v-else
            :key="item.path"
            :to="item.path"
            class="menu-item"
            :class="{ active: $route.path === item.path }"
            @click.native="closeMenu"
          >
            <i :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </template>
      </div>
      <div class="menu-footer">
        <p>© {{ new Date().getFullYear() }} {{ $store.state.webSiteInfo.title }}</p>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { getMenuItems } from '@/config/menu'

export default {
  name: 'MobileMenu',
  data() {
    return {
      visible: false
    }
  },
  computed: {
    menuItems() {
      return getMenuItems()
    }
  },
  watch: {
    '$store.state.mobileMenuVisible': {
      immediate: true,
      handler(val) {
        this.visible = val
      }
    },
    visible(val) {
      if (val !== this.$store.state.mobileMenuVisible) {
        this.$store.commit('setMobileMenuVisible', val)
      }
    }
  },
  methods: {
    closeMenu() {
      this.$store.commit('setMobileMenuVisible', false)
    },
    handleItemClick(item) {
      if (item.external) {
        window.open(item.path, '_blank')
      } else {
        this.$router.push(item.path)
      }
      this.closeMenu()
    }
  }
}
</script>

<style scoped>

.mobile-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.menu-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 36px;
  width: auto;
  border-radius: 5px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.site-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color, #615959);
  margin: 0;
}

.menu-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.menu-group {
  margin-bottom: 12px;
}

.menu-group-title {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary-color, #666);
  border-bottom: 1px solid var(--border-color, #eee);
  margin-bottom: 4px;
}

.menu-group-title i {
  margin-right: 10px;
  font-size: 1rem;
}

.menu-item-child {
  padding-left: 44px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  color: var(--text-color, #918484);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.menu-item i {
  margin-right: 12px;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.menu-item span {
  flex: 1;
  font-weight: 500;
}

.menu-item:hover {
  background-color: var(--hover-color, #f5f5f5);
  transform: translateX(4px);
}

.menu-item:hover i {
  transform: scale(1.1);
}

.menu-item.active {
  background-color: var(--primary-color, #1890ff);
  color: #fff;
}

.menu-footer {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary-color, #666);
  font-size: 0.9rem;
  border-top: 1px solid var(--border-color, #eee);
}

/* 菜单项动画 */
.menu-item-enter-active,
.menu-item-leave-active {
  transition: all 0.3s ease;
}

.menu-item-enter,
.menu-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
