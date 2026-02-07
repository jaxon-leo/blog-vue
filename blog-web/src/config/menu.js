/**
 * 站点主导航配置，供 Header 与 MobileMenu 共用
 * PC 端用下拉，移动端用全展开列表
 */
const getMenuItems = () => [
  { name: '首页', path: '/', icon: 'fas fa-home', colorClass: 'home-link' },
  {
    name: '文章归档',
    path: '/archives',
    icon: 'fas fa-archive',
    colorClass: 'archive-link',
    children: [
      { name: '归档', path: '/archive', icon: 'fas fa-clock', colorClass: 'clock-link' },
      { name: '分类', path: '/categories', icon: 'fas fa-folder', colorClass: 'category-link' },
      { name: '标签', path: '/tags', icon: 'fas fa-tags', colorClass: 'tag-link' }
    ]
  },
  { name: '说说', path: '/moments', icon: 'fas fa-comment-dots', colorClass: 'talk-link' },
  { name: '热搜', path: '/hotSearch', icon: 'fas fa-fire', colorClass: 'hot-link' },
  { name: '资源', path: '/resources', icon: 'fas fa-cloud-download-alt', colorClass: 'resource-link' },
  { name: '相册', path: '/photos', icon: 'fas fa-images', colorClass: 'photos-link' },
  { name: '留言板', path: '/messages', icon: 'fas fa-envelope', colorClass: 'message-link' },
  { name: '友情链接', path: '/friends', icon: 'fas fa-users', colorClass: 'friend-link' },
  {
    name: '关于本站',
    path: '/about',
    icon: 'fas fa-info-circle',
    colorClass: 'about-link',
    children: [
      { name: '关于我', path: '/about', icon: 'fas fa-user', colorClass: 'about-me-link' },
      { name: '网盘系统', path: 'https://pan.dejavu.zone', icon: 'fas fa-cloud', colorClass: 'cloud-link', external: true },
      { name: '后台管理', path: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_ADMIN_URL) || 'https://admin.dejavu.zone', icon: 'fas fa-tv', colorClass: 'admin-link', external: true }
    ]
  }
]

export { getMenuItems }
