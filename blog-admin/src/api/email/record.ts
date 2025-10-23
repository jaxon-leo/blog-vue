import request from '@/utils/request'

/**
 * 获取邮件发送记录列表
 */
export function listEmailSendRecordApi(params?: any) {
    return request({
        url: '/email/record/list',
        method: 'get',
        params
    })
}

/**
 * 获取邮件发送记录详情
 */
export function detailEmailSendRecordApi(id: any) {
    return request({
        url: '/email/record/' + id,
        method: 'get'
    })
}

/**
 * 添加邮件发送记录
 */
export function addEmailSendRecordApi(data: any) {
    return request({
        url: '/email/record/add',
        method: 'post',
        data
    })
}

/**
 * 修改邮件发送记录
 */
export function updateEmailSendRecordApi(data: any) {
    return request({
        url: `/email/record/update`,
        method: 'put',
        data
    })
}


/**
 * 删除邮件发送记录
 */
export function deleteEmailSendRecordApi(ids: number[] | number) {
    return request({
        url: `/email/record/delete/` + ids,
        method: 'delete'
    })
}


