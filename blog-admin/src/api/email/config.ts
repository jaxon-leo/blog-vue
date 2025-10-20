import request from '@/utils/request'

/**
 * 获取邮箱配置列表
 */
export function listEmailConfigApi(params?: any) {
    return request({
        url: '/email/config/list',
        method: 'get',
        params
    })
}

/**
 * 获取邮箱配置详情
 */
export function detailEmailConfigApi(id: any) {
    return request({
        url: '/email/config/' + id,
        method: 'get'
    })
}

/**
 * 添加邮箱配置
 */
export function addEmailConfigApi(data: any) {
    return request({
        url: '/email/config/add',
        method: 'post',
        data
    })
}

/**
 * 修改邮箱配置
 */
export function updateEmailConfigApi(data: any) {
    return request({
        url: `/email/config/update`,
        method: 'put',
        data
    })
}


/**
 * 删除邮箱配置
 */
export function deleteEmailConfigApi(ids: number[] | number) {
    return request({
        url: `/email/config/delete/` + ids,
        method: 'delete'
    })
}


