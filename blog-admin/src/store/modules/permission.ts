import { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import { getRouters } from "@/api/system/auth";
import { defineStore } from "pinia";
import { ref } from "vue";
const modules = import.meta.glob("../../views/**/*.vue");
import ParentView from '@/components/ParentView/index.vue'

const Layout = () => import("@/layouts/index.vue");

/** 将 path 转为合法路由 name 片段（无前导/、/ 换 _） */
function pathToNameSegment(path: string): string {
  return (path || '').replace(/^\//, '').replace(/\//g, '_').replace(/_+/g, '_') || 'route';
}

/**
 * 递归过滤有权限的异步(动态)路由，子路由 name 带父级前缀，保证全局唯一
 *
 * @param routes 接口返回的异步(动态)路由
 * @param isRoot 是否根级
 * @param parentNamePrefix 父级 name 前缀，用于生成唯一子 name
 */
const filterAsyncRoutes = (routes: RouteRecordRaw[], isRoot = true, parentNamePrefix = ''): any[] => {
  const asyncRoutes: any[] = [];

  routes.forEach((route) => {
    const tmpRoute = { ...route };
    const segment = pathToNameSegment((route.path as string) || '');

    // 子路由一律带父级前缀，保证与祖先、兄弟不重名
    if (parentNamePrefix) {
      tmpRoute.name = `${parentNamePrefix}_${tmpRoute.name || segment}`.replace(/_+/g, '_');
    } else if (!tmpRoute.name && segment) {
      tmpRoute.name = segment;
    }
    const currentNamePrefix = (tmpRoute.name as string) || segment || parentNamePrefix;

    if (tmpRoute.component) {
      if (tmpRoute.component?.toString() === "Layout") {
        tmpRoute.component = Layout;
      } else if (tmpRoute.component === 'ParentView') {
        tmpRoute.component = ParentView;
      } else {
        const compPath = typeof tmpRoute.component === 'string'
          ? (tmpRoute.component.startsWith('/') ? tmpRoute.component : `/${tmpRoute.component}`)
          : '';
        const component = compPath ? modules[`../../views${compPath}.vue`] : undefined;
        if (component) {
          tmpRoute.component = component;
        }
      }

      if (tmpRoute.children && tmpRoute.children.length > 0) {
        tmpRoute.children = filterAsyncRoutes(tmpRoute.children, false, currentNamePrefix);
      }
    }
    asyncRoutes.push(tmpRoute);
  });

  // 只在处理根级路由时添加404路由
  if (isRoot) {
    asyncRoutes.push({
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error-page/404.vue'),
      meta: {
        title: '404',
        hidden: true
      }
    });
  }

  return asyncRoutes;
};

// setup
export const usePermissionStore = defineStore("permission", () => {
  // state
  const routes = ref<RouteRecordRaw[]>([]);

  // actions
  function setRoutes(newRoutes: RouteRecordRaw[]) {
    // 合并时去掉静态路由里的 404，只保留动态路由末尾的 404，避免重复
    const base = constantRoutes.filter(
      (r) => r.name !== 'NotFound' && r.path !== '/:pathMatch(.*)*'
    );
    routes.value = base.concat(newRoutes);
  }
  /**
   * 生成动态路由
   *
   * @param roles 用户角色集合
   * @returns
   */
  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      // 接口获取所有路由
      getRouters()
        .then(({ data: asyncRoutes }) => {
          // 根据角色获取有访问权限的路由
          const accessedRoutes = filterAsyncRoutes(asyncRoutes);
          setRoutes(accessedRoutes);
          resolve(accessedRoutes);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  /**
   * 获取与激活的顶部菜单项相关的混合模式左侧菜单集合
   */
  const mixLeftMenus = ref<RouteRecordRaw[]>([]);
  function setMixLeftMenus(topMenuPath: string) {
    const matchedItem = routes.value.find((item) => item.path === topMenuPath);
    if (matchedItem && matchedItem.children) {
      mixLeftMenus.value = matchedItem.children;
    }
  }
  return {
    routes,
    setRoutes,
    generateRoutes,
    mixLeftMenus,
    setMixLeftMenus,
  };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
