import request from '@/utils/request'

/**
 * 获取邮件模版列表
 */
export function listEmailTemplateApi(params?: any) {
    return request({
        url: '/email/template/list',
        method: 'get',
        params
    })
}

/**
 * 获取邮件模版类型列表
 */
export function listEmailTemplateTypeApi() {
    return request({
        url: '/email/template/type',
        method: 'get'
    })
}

/**
 * 获取邮件模版详情
 */
export function detailEmailTemplateApi(id: any) {
    return request({
        url: '/email/template/' + id,
        method: 'get'
    })
}

/**
 * 添加邮件模版
 */
export function addEmailTemplateApi(data: any) {
    return request({
        url: '/email/template/add',
        method: 'post',
        data
    })
}

/**
 * 修改邮件模版
 */
export function updateEmailTemplateApi(data: any) {
    return request({
        url: `/email/template/update`,
        method: 'put',
        data
    })
}


/**
 * 删除邮件模版
 */
export function deleteEmailTemplateApi(ids: number[] | number) {
    return request({
        url: `/email/template/delete/` + ids,
        method: 'delete'
    })
}


